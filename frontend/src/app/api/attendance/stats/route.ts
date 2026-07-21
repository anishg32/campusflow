import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import Attendance, { AttendanceStatus } from '@/lib/models/Attendance';
import Student from '@/lib/models/Student';
import connectDB from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req);
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);

    const totalStudents = await Student.countDocuments();
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: nextDay },
    });

    const present = todayAttendance.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const absent = todayAttendance.filter((r) => r.status === AttendanceStatus.ABSENT).length;

    return NextResponse.json({
      totalStudents,
      todayPresent: present,
      todayAbsent: absent,
      todayPercentage: totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
