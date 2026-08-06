import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Circular from '@/lib/models/Circular';
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/circulars — fetch circulars visible to the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Build filter based on user role
    let filter: Record<string, unknown> = {};

    if (user.role === 'admin') {
      // Admin sees all circulars
      filter = {};
    } else {
      // Faculty/Student see circulars targeted at 'all' or their specific role
      filter = {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: user.role },
        ],
      };

      // If user belongs to a department, also filter by department (or no department = college-wide)
      if (user.department) {
        filter = {
          $and: [
            filter,
            {
              $or: [
                { department: { $exists: false } },
                { department: null },
                { department: user.department },
              ],
            },
          ],
        };
      }
    }

    const circulars = await Circular.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('postedBy', 'name role')
      .populate('department', 'name code')
      .lean();

    return NextResponse.json(circulars);
  } catch (error: any) {
    console.error('Get circulars error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/circulars — create a new circular (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can post circulars' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { title, message, targetAudience, department } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const circularData: Record<string, unknown> = {
      title,
      message,
      postedBy: user._id,
      targetAudience: targetAudience || 'all',
    };

    if (department && mongoose.Types.ObjectId.isValid(department)) {
      circularData.department = department;
    }

    const circular = await Circular.create(circularData);

    const populated = await Circular.findById(circular._id)
      .populate('postedBy', 'name role')
      .populate('department', 'name code')
      .lean();

    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    console.error('Create circular error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
