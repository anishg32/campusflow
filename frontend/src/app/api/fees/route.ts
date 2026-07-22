import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import Fee from '@/lib/models/Fee';
import Student from '@/lib/models/Student';
import connectDB from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    
    const filter: any = {};
    if (department) filter.department = department;

    const fees = await Fee.find(filter)
      .populate('student', 'name rollNumber')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    return NextResponse.json(fees);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req);
    await connectDB();

    const { studentId, departmentId, totalAmount, dueDate } = await req.json();

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    const fee = await Fee.create({
      student: studentId,
      department: departmentId,
      totalAmount,
      dueDate,
    });

    const populated = await fee.populate(['student', 'department']);
    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
