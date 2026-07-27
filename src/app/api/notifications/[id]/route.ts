import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { verifyAuth } from '@/lib/auth';

// PUT /api/notifications/:id — mark a single notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: user._id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json(notification);
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
