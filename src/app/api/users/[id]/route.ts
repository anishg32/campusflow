import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth';

// PUT /api/users/[id] — Admin edits a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAuth(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { name, loginId, password, phoneNumber, department } = body;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Don't allow editing admin users
    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Cannot edit admin users' }, { status: 403 });
    }

    if (name) user.name = name;
    if (loginId) {
      // Check uniqueness
      const existing = await User.findOne({ loginId: loginId.trim(), _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: `Login ID "${loginId}" is already taken` }, { status: 400 });
      }
      user.loginId = loginId.trim();
      user.email = `${loginId.trim().toLowerCase().replace(/\s+/g, '')}@campus.local`;
    }
    if (password) user.password = password;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (department !== undefined) user.department = department || undefined;

    await user.save();

    const updated = await User.findById(id)
      .select('-password')
      .populate('department', 'name code')
      .lean();

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/users/[id] — Admin deletes a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAuth(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
