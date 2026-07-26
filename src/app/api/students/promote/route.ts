import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import Student from '@/lib/models/Student';
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAuth(req);
    if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { studentIds, targetYear } = await req.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'No students provided' }, { status: 400 });
    }

    let result;
    if (targetYear && targetYear !== 'next') {
      const yearNum = parseInt(targetYear);
      result = await Student.updateMany(
        { _id: { $in: studentIds } },
        { $set: { year: yearNum } }
      );
    } else {
      // Update students where year is less than 4 (since max is 4 in schema)
      result = await Student.updateMany(
        { _id: { $in: studentIds }, year: { $lt: 4 } },
        { $inc: { year: 1 } }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully promoted ${result.modifiedCount} students`,
      modifiedCount: result.modifiedCount
    });
  } catch (error: any) {
    console.error('Bulk promote error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
