import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import Department from '@/lib/models/Department';
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

    const department = await Department.findById(resolvedParams.id);
    if (!department) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    const students = await Student.find({ department: resolvedParams.id }).sort({ name: 1 });

    return NextResponse.json({ department, students });
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

    const department = await Department.findById(resolvedParams.id);
    if (!department) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    const studentCount = await Student.countDocuments({ department: resolvedParams.id });
    if (studentCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete department with ${studentCount} students. Move or remove them first.` },
        { status: 400 }
      );
    }

    await department.deleteOne();
    return NextResponse.json({ message: 'Department removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
