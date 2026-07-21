import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import Student from '@/lib/models/Student';
import Department from '@/lib/models/Department';
import connectDB from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req);
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
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter)
      .populate('department', 'name code')
      .sort({ name: 1 });

    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req);
    await connectDB();

    const { name, rollNumber, phoneNumber, email, department, year, section, parentName, parentPhoneNumber } = await req.json();

    const existing = await Student.findOne({ rollNumber });
    if (existing) {
      return NextResponse.json({ message: 'A student with this roll number already exists' }, { status: 400 });
    }

    const dept = await Department.findById(department);
    if (!dept) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    const student = await Student.create({
      name,
      rollNumber,
      phoneNumber,
      email,
      department,
      year: year || 1,
      section: section || 'A',
      parentName,
      parentPhoneNumber,
    });

    const populated = await student.populate('department', 'name code');
    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
