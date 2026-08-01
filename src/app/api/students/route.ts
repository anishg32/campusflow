import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import Student from '@/lib/models/Student';
import Department from '@/lib/models/Department';
import connectDB from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAuth(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const year = searchParams.get('year');
    const section = searchParams.get('section');
    const search = searchParams.get('search');

    const filter: any = {};
    if (department) filter.department = department;
    if (year) filter.year = Number(year);
    if (section) filter.section = section;
    if (search) {
      const tokens = search.trim().split(/\s+/);
      filter.$and = tokens.map(token => ({
        $or: [
          { name: { $regex: token, $options: 'i' } },
          { rollNumber: { $regex: token, $options: 'i' } },
          { phoneNumber: { $regex: token, $options: 'i' } },
        ]
      }));
    }

    if (session.role === 'student') {
      const verifyRoll = searchParams.get('verifyRoll');
      const verifyName = searchParams.get('verifyName');
      const verifyDept = searchParams.get('verifyDept');
      const verifyYear = searchParams.get('verifyYear');

      if (!verifyRoll || !verifyName || !verifyDept || !verifyYear) {
        return NextResponse.json({ message: 'Missing verification details' }, { status: 400 });
      }
      filter.rollNumber = { $regex: new RegExp(`^${verifyRoll.trim()}$`, 'i') };
      filter.name = { $regex: new RegExp(verifyName.trim(), 'i') };
      filter.department = verifyDept;
      filter.year = Number(verifyYear);
      
      console.log('STUDENT VERIFICATION FILTER:', filter);
      require('fs').appendFileSync('api-log.txt', JSON.stringify({verifyRoll, verifyName, verifyDept, verifyYear, filter}) + '\n');
      
      // Clear $and/$or since we are forcing an exact match for privacy
      delete filter.$or;
      delete filter.$and;
    }

    const limit = Number(searchParams.get('limit')) || 50;
    const page = Number(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    const students = await Student.find(filter)
      .populate('department', 'name code')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Student.countDocuments(filter);

    return NextResponse.json({ students, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req);
    await connectDB();

    const { name, rollNumber, registerNumber, phoneNumber, email, department, year, section, parentName, parentPhoneNumber, gender, dateOfBirth } = await req.json();

    const existing = await Student.findOne({ rollNumber });
    if (existing) {
      return NextResponse.json({ message: 'A student with this register number already exists' }, { status: 400 });
    }

    const dept = await Department.findById(department);
    if (!dept) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    const student = await Student.create({
      name,
      rollNumber,
      registerNumber,
      phoneNumber,
      email,
      department,
      year: year || 1,
      section: section || 'A',
      parentName,
      parentPhoneNumber,
      gender,
      dateOfBirth,
    });

    const populated = await student.populate('department', 'name code');
    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await verifyAuth(req);
    await connectDB();

    const { studentIds } = await req.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ message: 'No students provided for deletion' }, { status: 400 });
    }

    await Student.deleteMany({ _id: { $in: studentIds } });

    return NextResponse.json({ message: 'Students deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
