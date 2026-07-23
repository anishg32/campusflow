import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import connectDB from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // MOCK LOGIN BYPASS
    // Always succeed regardless of password or database
    let role = 'student';
    if (email.includes('admin')) role = 'admin';
    if (email.includes('faculty')) role = 'faculty';

    return NextResponse.json({
      _id: 'mock-user-id-123',
      name: 'Demo ' + role,
      email: email,
      role: role,
      token: generateToken('mock-user-id-123', role),
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
