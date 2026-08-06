import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User, { Role } from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth';

// GET /api/users — Admin lists all users (with optional role filter)
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAuth(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');
    const search = searchParams.get('search');

    const filter: Record<string, unknown> = {};
    
    if (roleFilter && roleFilter !== 'all') {
      filter.role = roleFilter;
    } else {
      // Don't show admin users in the list
      filter.role = { $in: [Role.FACULTY, Role.STUDENT] };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { loginId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/users — Admin creates a new faculty or student user
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAuth(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { name, loginId, password, phoneNumber, role, department } = body;

    if (!name || !loginId || !password) {
      return NextResponse.json(
        { error: 'Name, Login ID, and Password are required' },
        { status: 400 }
      );
    }

    const allowedRoles = [Role.FACULTY, Role.STUDENT];
    if (!allowedRoles.includes(role as Role)) {
      return NextResponse.json(
        { error: 'Role must be faculty or student' },
        { status: 400 }
      );
    }

    // Check if loginId already exists
    const existingUser = await User.findOne({ loginId: loginId.trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: `A user with ID "${loginId}" already exists` },
        { status: 400 }
      );
    }

    // Generate a unique email from loginId (required by schema but not used for login)
    const email = `${loginId.trim().toLowerCase().replace(/\s+/g, '')}@campus.local`;
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'A user with this ID already exists' },
        { status: 400 }
      );
    }

    const userData: Record<string, unknown> = {
      name,
      loginId: loginId.trim(),
      email,
      password,
      role,
      phoneNumber,
    };

    if (department) {
      userData.department = department;
    }

    const user = await User.create(userData);

    const created = await User.findById(user._id)
      .select('-password')
      .populate('department', 'name code')
      .lean();

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('Create user error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A user with this Login ID already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
