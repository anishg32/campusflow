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

    const { studentId, departmentId, year, title, totalAmount, dueDate, bulk } = await req.json();

    if (bulk) {
      if (!departmentId) {
        return NextResponse.json({ message: 'Department is required for bulk invoice' }, { status: 400 });
      }
      
      const filter: any = { department: departmentId };
      if (year) filter.year = year;
      
      const studentsInDept = await Student.find(filter);
      if (studentsInDept.length === 0) {
        return NextResponse.json({ message: 'No students found for this department/year' }, { status: 404 });
      }

      const feeDocs = studentsInDept.map((s) => ({
        title: title || 'General Fee',
        student: s._id,
        department: departmentId,
        totalAmount,
        dueDate,
        payments: []
      }));

      await Fee.insertMany(feeDocs);
      return NextResponse.json({ message: `Successfully generated ${feeDocs.length} invoices` }, { status: 201 });
    }

    // Single student invoice
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    const fee = await Fee.create({
      title: title || 'General Fee',
      student: studentId,
      department: departmentId,
      totalAmount,
      dueDate,
      payments: []
    });

    const populated = await fee.populate(['student', 'department']);
    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
