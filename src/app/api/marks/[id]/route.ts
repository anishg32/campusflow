import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Mark from '@/lib/models/Mark';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifyAuth(request);
    if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await context.params;
    const body = await request.json();
    
    const updatedMark = await Mark.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedMark) {
      return NextResponse.json({ error: 'Mark not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedMark);
  } catch (error: any) {
    console.error('Update mark error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Another entry for this subject and exam type already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifyAuth(request);
    if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await context.params;
    
    const deletedMark = await Mark.findByIdAndDelete(id);
    
    if (!deletedMark) {
      return NextResponse.json({ error: 'Mark not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete mark error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
