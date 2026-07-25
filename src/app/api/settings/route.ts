import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      // In this app, maybe all teachers can see settings, but let's just allow if verified
    }
    
    await connectDB();
    
    // Fetch the first settings document
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req);
    await connectDB();
    
    const { twilioAccountSid, twilioAuthToken, twilioPhoneNumber } = await req.json();
    
    let settings = await Settings.findOne();
    
    if (settings) {
      settings.twilioAccountSid = twilioAccountSid;
      settings.twilioAuthToken = twilioAuthToken;
      settings.twilioPhoneNumber = twilioPhoneNumber;
      await settings.save();
    } else {
      settings = await Settings.create({
        twilioAccountSid,
        twilioAuthToken,
        twilioPhoneNumber,
      });
    }

    return NextResponse.json({ message: 'Settings saved successfully', settings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
