import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json({ error: 'Phone number and message are required' }, { status: 400 });
    }

    const authKey = process.env.MSG91_AUTH_KEY;
    const senderId = process.env.MSG91_SENDER_ID;

    if (!authKey || !senderId) {
      // Dev fallback: log the message instead of failing
      console.log('\n=============================================');
      console.log(`[MOCK MSG91 SMS] To: ${phone}`);
      console.log(`[MOCK MSG91 SMS] Message: ${message}`);
      console.log('=============================================\n');
      return NextResponse.json({
        success: true,
        mock: true,
        message: 'MSG91 credentials not configured. SMS logged to console.',
      });
    }

    // Format phone number to international format (India: 91)
    const formattedPhone = phone.replace(/\D/g, '');
    const internationalPhone = formattedPhone.startsWith('91')
      ? formattedPhone
      : `91${formattedPhone}`;

    const response = await fetch('https://control.msg91.com/api/v4/sms', {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: senderId,
        route: '4',
        country: '91',
        sms: [
          {
            message: message,
            to: [internationalPhone],
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.type === 'error' || !response.ok) {
      console.error('MSG91 API error:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to send SMS' },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ success: true, response: data });
  } catch (error: any) {
    console.error('MSG91 send error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
