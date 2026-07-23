import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import Student from '@/lib/models/Student';
import connectDB from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth(req);
    await connectDB();
    const resolvedParams = await params;

    const student = await Student.findById(resolvedParams.id).populate('department', 'name code');
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth(req);
    await connectDB();
    const resolvedParams = await params;

    const { name, rollNumber, phoneNumber, email, department, year, section, parentName, parentPhoneNumber } = await req.json();

    const student = await Student.findById(resolvedParams.id);
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    if (rollNumber && rollNumber !== student.rollNumber) {
      const dup = await Student.findOne({ rollNumber });
      if (dup) {
        return NextResponse.json({ message: 'A student with this roll number already exists' }, { status: 400 });
      }
    }

    if (name) student.name = name;
    if (rollNumber) student.rollNumber = rollNumber;
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (email !== undefined) student.email = email;
    if (department) student.department = department;
    if (year) student.year = year;
    if (section) student.section = section;
    if (parentName !== undefined) student.parentName = parentName;
    if (parentPhoneNumber !== undefined) student.parentPhoneNumber = parentPhoneNumber;

    await student.save();
    const populated = await student.populate('department', 'name code');
    return NextResponse.json(populated);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth(req);
    await connectDB();
    const resolvedParams = await params;

    const student = await Student.findById(resolvedParams.id);
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }
    await student.deleteOne();
    return NextResponse.json({ message: 'Student removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
