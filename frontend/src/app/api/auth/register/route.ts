import { NextRequest, NextResponse } from 'next/server';
import User, { Role } from '@/lib/models/User';
import connectDB from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, phoneNumber } = await req.json();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: Role.FACULTY,
    });

    if (user) {
      return NextResponse.json(
        {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user.id, user.role),
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: 'Invalid user data' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
