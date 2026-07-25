import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Mark from '@/lib/models/Mark';
import Student from '@/lib/models/Student';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const examType = searchParams.get('examType');
    const studentParam = searchParams.get('student');
    
    const query: any = {};
    if (department) query.department = department;
    if (examType) query.examType = examType;
    if (studentParam) query.student = studentParam;
    
    if (session.role === 'student') {
      const currentStudent = await Student.findOne({ email: session.email });
      if (!currentStudent) {
        return NextResponse.json([]);
      }
      query.student = currentStudent._id;
    }
    
    const marks = await Mark.find(query)
      .populate('student', 'name rollNumber year section')
      .populate('department', 'name code')
      .sort({ date: -1, createdAt: -1 });
      
    return NextResponse.json(marks);
  } catch (error: any) {
    console.error('Fetch marks error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    
    // Support bulk upload if body is array
    if (Array.isArray(body)) {
      const marks = await Mark.insertMany(body);
      return NextResponse.json(marks, { status: 201 });
    }
    
    const { student, department, subjectName, examType, marksObtained, maxMarks, date } = body;
    
    if (!student || !department || !subjectName || !examType || marksObtained === undefined || maxMarks === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const mark = await Mark.create({
      student,
      department,
      subjectName,
      examType,
      marksObtained: Number(marksObtained),
      maxMarks: Number(maxMarks),
      date: date ? new Date(date) : new Date(),
    });
    
    return NextResponse.json(mark, { status: 201 });
  } catch (error: any) {
    console.error('Create mark error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Mark for this subject and exam type already exists for this student.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
