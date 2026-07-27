import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Mark from '@/lib/models/Mark';
import { verifyAuth } from '@/lib/auth';
import { sendSMS } from '@/lib/sms';
import Student from '@/lib/models/Student';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find all marks where obtained/max < 50%
    const allMarks = await Mark.find().populate('student');
    
    const failingMarks = allMarks.filter(m => {
      const p = (m.marksObtained / m.maxMarks) * 100;
      return p < 50;
    });
    
    // Group by student to avoid spamming the same student multiple times
    const failingStudentsMap = new Map<string, { name: string, phone: string, email: string, count: number }>();
    
    for (const mark of failingMarks) {
      const student = mark.student as any;
      if (student && student._id) {
        if (!failingStudentsMap.has(student._id.toString())) {
          failingStudentsMap.set(student._id.toString(), {
            name: student.name,
            phone: student.phoneNumber,
            email: student.email || '',
            count: 1
          });
        } else {
          const s = failingStudentsMap.get(student._id.toString())!;
          s.count += 1;
        }
      }
    }
    
    let notifiedCount = 0;
    
    // Send SMS to each student/parent
    for (const [id, student] of failingStudentsMap.entries()) {
      if (student.phone) {
        const message = `CampusFlow Alert: Dear ${student.name}, you have ${student.count} subjects that need improvement. Please check your student portal.`;
        const success = await sendSMS(student.phone, message);
        if (success) {
          notifiedCount++;
        }
      }
    }
    
    // Create in-app notifications for students who have User accounts
    const studentEmails = Array.from(failingStudentsMap.values())
      .map(s => s.email)
      .filter(Boolean);

    if (studentEmails.length > 0) {
      const userAccounts = await User.find({ email: { $in: studentEmails } }).select('_id email');
      const emailToUserId = new Map(userAccounts.map(u => [u.email, u._id]));

      const notificationDocs = [];
      for (const [, student] of failingStudentsMap) {
        const userId = emailToUserId.get(student.email);
        if (userId) {
          notificationDocs.push({
            recipient: userId,
            type: 'marks_alert',
            title: 'Marks Alert: Needs Improvement',
            message: `You have ${student.count} subject${student.count > 1 ? 's' : ''} that need improvement. Please review your marks.`,
            link: '/dashboard/marks?filter=needs-improvement',
            read: false,
          });
        }
      }

      if (notificationDocs.length > 0) {
        await Notification.insertMany(notificationDocs);
      }
    }

    return NextResponse.json({ success: true, notifiedCount, totalFailingStudents: failingStudentsMap.size });
  } catch (error: any) {
    console.error('Notify marks error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
