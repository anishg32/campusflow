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

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      // Dev fallback: log the message instead of failing
      console.log('\n=============================================');
      console.log(`[MOCK WHATSAPP] To: ${phone}`);
      console.log(`[MOCK WHATSAPP] Message: ${message}`);
      console.log('=============================================\n');
      return NextResponse.json({
        success: true,
        mock: true,
        message: 'WhatsApp credentials not configured. Message logged to console.',
      });
    }

    // Format phone number to international format (India: +91)
    const formattedPhone = phone.replace(/\D/g, '');
    const internationalPhone = formattedPhone.startsWith('91')
      ? formattedPhone
      : `91${formattedPhone}`;

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: internationalPhone,
          type: 'text',
          text: { body: message },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Failed to send WhatsApp message' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, messageId: data.messages?.[0]?.id });
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
