import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import Department from '@/lib/models/Department';
import Student from '@/lib/models/Student';
import connectDB from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req);
    await connectDB();

    const departments = await Department.find().sort({ name: 1 });

    const deptData = await Promise.all(
      departments.map(async (dept) => {
        const studentCount = await Student.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          studentCount,
        };
      })
    );

    return NextResponse.json(deptData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req);
    await connectDB();
    const { name, code, description } = await req.json();

    const existing = await Department.findOne({ $or: [{ name }, { code }] });
    if (existing) {
      return NextResponse.json(
        { message: 'Department with this name or code already exists' },
        { status: 400 }
      );
    }

    const department = await Department.create({ name, code, description });
    return NextResponse.json(department, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
