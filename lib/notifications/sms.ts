export async function sendSms(
  phone: string,
  message: string,
  _notificationId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const provider = process.env.SMS_PROVIDER || 'msg91';

  try {
    // Normalize phone number (assume Indian +91 if 10 digits)
    let normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length === 10) {
      normalizedPhone = '91' + normalizedPhone;
    }

    if (provider === 'msg91') {
      return await sendViaMsg91(normalizedPhone, message);
    } else if (provider === 'twilio') {
      return await sendViaTwilio(normalizedPhone, message);
    } else {
      // Mock / Dev fallback
      console.log(`[SMS MOCK] To: ${normalizedPhone} | MSG: ${message}`);
      return { success: true, messageId: `mock_${Date.now()}` };
    }
  } catch (err: any) {
    console.error('[SMS Service Error]', err);
    return { success: false, error: err.message || 'Unknown SMS error' };
  }
}

async function sendViaMsg91(phone: string, message: string) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID || 'SMARTC';

  if (!authKey || !templateId) {
    console.warn('[SMS] MSG91 credentials missing, falling back to mock send.');
    console.log(`[SMS MOCK MSG91] To: ${phone} | MSG: ${message}`);
    return { success: true, messageId: `mock_msg91_${Date.now()}` };
  }

  const response = await fetch('https://api.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      authkey: authKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: templateId,
      sender: senderId,
      short_url: '0',
      recipients: [
        {
          mobiles: phone,
          message: message,
        },
      ],
    }),
  });

  const data = await response.json();
  if (data.type === 'success') {
    return { success: true, messageId: data.message };
  } else {
    throw new Error(data.message || 'MSG91 API error');
  }
}

async function sendViaTwilio(phone: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!accountSid || !authToken || !from) {
    console.warn('[SMS] Twilio credentials missing, falling back to mock send.');
    console.log(`[SMS MOCK TWILIO] To: ${phone} | MSG: ${message}`);
    return { success: true, messageId: `mock_twilio_${Date.now()}` };
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const encodedBody = new URLSearchParams({
    To: '+' + phone,
    From: from,
    Body: message,
  });

  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encodedBody,
  });

  const data = await response.json();
  if (data.sid) {
    return { success: true, messageId: data.sid };
  } else {
    throw new Error(data.message || 'Twilio API error');
  }
}
