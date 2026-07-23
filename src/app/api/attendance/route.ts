import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import Attendance, { AttendanceStatus } from '@/lib/models/Attendance';
import Student from '@/lib/models/Student';
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    await connectDB();

    const { date, departmentId, records } = await req.json();

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ message: 'No attendance records provided' }, { status: 400 });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    for (const record of records) {
      const { studentId, status } = record;

      const attendance = await Attendance.findOneAndUpdate(
        { student: studentId, date: attendanceDate },
        {
          student: studentId,
          faculty: user.id,
          date: attendanceDate,
          status: status === 'present' ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
          department: departmentId,
        },
        { upsert: true, new: true }
      );
      results.push(attendance);
    }

    return NextResponse.json({ message: `Attendance marked for ${results.length} students`, count: results.length }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const departmentId = searchParams.get('departmentId');

    if (!date || !departmentId) {
      return NextResponse.json({ message: 'Date and departmentId are required' }, { status: 400 });
    }

    const queryDate = new Date(date as string);
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const students = await Student.find({ department: departmentId }).sort({ name: 1 });

    const attendanceRecords = await Attendance.find({
      department: departmentId,
      date: { $gte: queryDate, $lt: nextDay },
    });

    const attendanceMap = new Map<string, string>();
    attendanceRecords.forEach((record) => {
      attendanceMap.set(record.student.toString(), record.status);
    });

    const result = students.map((student) => ({
      _id: student._id,
      name: student.name,
      rollNumber: student.rollNumber,
      phoneNumber: student.phoneNumber,
      status: attendanceMap.get(student._id.toString()) || null,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
