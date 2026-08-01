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
      if (!currentStudent && !studentParam) {
        return NextResponse.json([]);
      }
      query.student = studentParam || currentStudent?._id;
    }
    
    const marks = await Mark.find(query)
      .populate('student', 'name rollNumber year section')
      .populate('department', 'name code')
      .sort({ semester: -1, subjectName: 1 });
      
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
      const marksData = body.map(m => ({ ...m, createdBy: session.userId }));
      const marks = await Mark.insertMany(marksData);
      return NextResponse.json(marks, { status: 201 });
    }
    
    const { student, department, semester, subjectName, examType, marksObtained, maxMarks, date, assignmentMarks, internalExamMarks, grade } = body;
    
    if (!student || !department || !semester || !subjectName || !examType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (examType === 'Semester Exam' && !grade) {
      return NextResponse.json({ error: 'Grade is required for Semester Exam' }, { status: 400 });
    }

    
    const mark = await Mark.create({
      student,
      department,
      semester: Number(semester),
      subjectName,
      examType,
      marksObtained: examType === 'Semester Exam' ? undefined : (marksObtained !== undefined && marksObtained !== '' ? Number(marksObtained) : undefined),
      maxMarks: examType === 'Semester Exam' ? undefined : (maxMarks !== undefined && maxMarks !== '' ? Number(maxMarks) : undefined),
      grade: examType === 'Semester Exam' ? grade : undefined,
      assignmentMarks: assignmentMarks ? Number(assignmentMarks) : undefined,
      internalExamMarks: internalExamMarks ? Number(internalExamMarks) : undefined,
      date: date ? new Date(date) : new Date(),
      createdBy: session.userId,
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
