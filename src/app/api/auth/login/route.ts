import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import connectDB from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { password, loginId } = body;
    let email = body.email;

    let user;

    if (loginId) {
      // Faculty/Student login with Staff ID or Student ID
      user = await User.findOne({ loginId: loginId.trim() });
    } else if (email) {
      // Admin login with email
      email = email.trim().toLowerCase();
      user = await User.findOne({ email });
    } else {
      return NextResponse.json(
        { message: 'Please provide login credentials' },
        { status: 400 }
      );
    }

    if (user && (await user.matchPassword(password))) {
      return NextResponse.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        loginId: user.loginId,
        token: generateToken(user.id, user.role),
      });
    } else {
      return NextResponse.json(
        { message: loginId ? 'Invalid ID or password' : 'Invalid email or password' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
