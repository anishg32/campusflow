import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import Fee from '@/lib/models/Fee';
import Student from '@/lib/models/Student';
import connectDB from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAuth(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    
    const filter: any = {};
    if (department) filter.department = department;

    const studentParam = searchParams.get('student');

    if (session.role === 'student') {
      const currentStudent = await Student.findOne({
        $or: [
          { rollNumber: { $regex: new RegExp(`^${session.loginId?.trim() || ''}$`, 'i') } },
          { registerNumber: { $regex: new RegExp(`^${session.loginId?.trim() || ''}$`, 'i') } }
        ]
      });
      if (!currentStudent && !studentParam) {
        return NextResponse.json([]);
      }
      filter.student = studentParam || currentStudent?._id;
    } else if (studentParam) {
      filter.student = studentParam;
    }

    const fees = await Fee.find(filter)
      .populate('student', 'name rollNumber year')
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

    const { studentId, departmentId, year, semester, title, totalAmount, tuitionFee, busFee, sportsFee, bookFee, examFee, dueFee, dueDate, bulk } = await req.json();

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
        semester,
        totalAmount,
        tuitionFee,
        busFee,
        sportsFee,
        bookFee,
        examFee,
        dueFee,
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
      semester,
      totalAmount,
      tuitionFee,
      busFee,
      sportsFee,
      bookFee,
      examFee,
      dueFee,
      dueDate,
      payments: []
    });

    const populated = await fee.populate(['student', 'department']);
    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
