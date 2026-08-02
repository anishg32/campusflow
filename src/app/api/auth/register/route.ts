import { NextRequest, NextResponse } from 'next/server';
import User, { Role } from '@/lib/models/User';
import connectDB from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    let email = body.email;
    const { name, password, phoneNumber, role } = body;
    email = email.trim().toLowerCase();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    const allowedRoles = [Role.STUDENT, Role.FACULTY];
    const userRole = allowedRoles.includes(role as Role) ? role : Role.FACULTY;

    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: userRole,
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
