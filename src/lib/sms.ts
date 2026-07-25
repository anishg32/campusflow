import connectDB from '@/lib/db';
import Settings from '@/lib/models/Settings';

export async function sendSMS(to: string, message: string): Promise<boolean> {
  await connectDB();
  const settings = await Settings.findOne();
  
  const accountSid = settings?.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
  const authToken = settings?.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = settings?.twilioPhoneNumber || process.env.TWILIO_PHONE_NUMBER;

  // If no credentials, just mock the SMS (useful for local development)
  if (!accountSid || !authToken || !fromNumber) {
    console.log('\n=============================================');
    console.log(`[MOCK SMS] To: ${to}`);
    console.log(`[MOCK SMS] Message: ${message}`);
    console.log('=============================================\n');
    return true;
  }

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send SMS via Twilio:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}
