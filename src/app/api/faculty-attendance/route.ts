import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import FacultyAttendance, { FacultyAttendanceStatus } from '@/lib/models/FacultyAttendance';
import User from '@/lib/models/User';
import connectDB from '@/lib/db';
import { sendSMS } from '@/lib/sms';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    await connectDB();

    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Only admins can record faculty attendance' }, { status: 403 });
    }

    const { date, records } = await req.json();

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ message: 'No attendance records provided' }, { status: 400 });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    for (const record of records) {
      const { facultyId, status } = record;

      const isAbsent = status === 'absent' || status === FacultyAttendanceStatus.ABSENT;
      
      const attendance = await FacultyAttendance.findOneAndUpdate(
        { faculty: facultyId, date: attendanceDate },
        {
          faculty: facultyId,
          recordedBy: user.id,
          date: attendanceDate,
          status: isAbsent ? FacultyAttendanceStatus.ABSENT : FacultyAttendanceStatus.PRESENT,
        },
        { upsert: true, returnDocument: 'after' }
      );
      
      // If marked absent, send SMS to faculty member
      if (isAbsent) {
        const facultyUser = await User.findById(facultyId);
        if (facultyUser && facultyUser.phoneNumber) {
          const dateString = attendanceDate.toLocaleDateString();
          const message = `Dear ${facultyUser.name}, you have been marked absent on ${dateString}. Please contact administration if this is an error.`;
          
          sendSMS(facultyUser.phoneNumber, message).catch(err => console.error('SMS Error:', err));
        }
      }

      results.push(attendance);
    }

    return NextResponse.json({ message: `Attendance marked for ${results.length} faculty members`, count: results.length }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAuth(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const departmentId = searchParams.get('departmentId');
    const facultyParam = searchParams.get('faculty');

    // Faculty member viewing their own attendance
    if (session.role === 'faculty') {
      const records = await FacultyAttendance.find({ faculty: session.id }).sort({ date: -1 });
      return NextResponse.json(records);
    }
    
    if (facultyParam) {
      const records = await FacultyAttendance.find({ faculty: facultyParam }).sort({ date: -1 });
      return NextResponse.json(records);
    }

    if (!date) {
      return NextResponse.json({ message: 'Date is required' }, { status: 400 });
    }

    const queryDate = new Date(date as string);
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const facultyFilter: any = { role: 'faculty' };
    if (departmentId) facultyFilter.department = departmentId;

    const facultyMembers = await User.find(facultyFilter).sort({ name: 1 });

    const attendanceRecords = await FacultyAttendance.find({
      date: { $gte: queryDate, $lt: nextDay },
    });

    const attendanceMap = new Map<string, string>();
    attendanceRecords.forEach((record) => {
      attendanceMap.set(record.faculty.toString(), record.status);
    });

    const result = facultyMembers.map((fac) => ({
      _id: fac._id,
      name: fac.name,
      loginId: fac.loginId,
      phoneNumber: fac.phoneNumber,
      status: attendanceMap.get(fac._id.toString()) || null,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
