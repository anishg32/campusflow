import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { verifyAuth } from '@/lib/auth';
import Student from '@/lib/models/Student';
import Department from '@/lib/models/Department';
import User, { Role } from '@/lib/models/User';
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
      // For students, simply match their loginId to rollNumber or registerNumber
      if (!session.loginId) {
        return NextResponse.json({ message: 'No login ID associated with this session' }, { status: 400 });
      }

      // Clear any other filters so they only see their own profile
      delete filter.$or;
      delete filter.$and;
      delete filter.department;
      delete filter.year;
      delete filter.section;
      delete filter.name;

      filter.$or = [
        { rollNumber: { $regex: new RegExp(`^${session.loginId.trim()}$`, 'i') } },
        { registerNumber: { $regex: new RegExp(`^${session.loginId.trim()}$`, 'i') } }
      ];
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
    const session = await verifyAuth(req);
    if (session.role !== 'admin') {
      return NextResponse.json({ message: 'Only administrators can create students' }, { status: 403 });
    }
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

    // Auto-create a User account for the student so they can log in immediately
    const existingUser = await User.findOne({ loginId: rollNumber });
    if (!existingUser) {
      const fallbackEmail = `${rollNumber.toLowerCase()}@student.campus.local`;
      await User.create({
        name,
        email: email || fallbackEmail,
        loginId: rollNumber,
        password: dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : 'student123',
        role: Role.STUDENT,
        department: dept._id,
      });
    }

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
