import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    return NextResponse.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      department: user.department,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Not authorized' },
      { status: 401 }
    );
  }
}
