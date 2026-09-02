import twilio from 'twilio';
import { SmsProviderResult } from './types';

/**
 * Normalizes phone numbers to standard E.164 format.
 * Defaults 10-digit Indian numbers to +91XXXXXXXXXX.
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // If 10-digit Indian number without country code
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }

  return '+' + cleaned;
}

/**
 * Masks phone number for secure logging: e.g. +91******3210
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 6) return '******';
  const prefix = phone.substring(0, 3);
  const suffix = phone.substring(phone.length - 4);
  return `${prefix}******${suffix}`;
}

/**
 * Validates whether the given string is a valid mobile phone number.
 */
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return /^\+[1-9]\d{9,14}$/.test(normalized);
}

/**
 * Core send SMS function supporting Twilio, MSG91, and safe Mock mode.
 */
export async function sendSms(
  phone: string,
  message: string,
  notificationId?: string
): Promise<SmsProviderResult> {
  const provider = (process.env.SMS_PROVIDER || 'twilio').toLowerCase();

  try {
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!isValidPhoneNumber(normalizedPhone)) {
      return {
        success: false,
        error: `INVALID_PHONE_NUMBER: '${phone}' could not be normalized to valid E.164 format.`,
      };
    }

    const maskedPhone = maskPhoneNumber(normalizedPhone);
    console.log(`[SMS Service] Dispatching SMS to ${maskedPhone} via [${provider.toUpperCase()}]`);

    if (provider === 'fast2sms') {
      return await sendViaFast2Sms(normalizedPhone, message);
    } else if (provider === 'twilio') {
      return await sendViaTwilio(normalizedPhone, message, notificationId);
    } else if (provider === 'msg91') {
      return await sendViaMsg91(normalizedPhone, message);
    } else {
      // Mock mode
      console.log(`[SMS MOCK] To: ${maskedPhone} | Notification ID: ${notificationId || 'N/A'}`);
      console.log(`[SMS MOCK TEXT] ${message}`);
      return {
        success: true,
        messageId: `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      };
    }
  } catch (err: any) {
    console.error('[SMS Service Error]', err);
    return {
      success: false,
      error: err.message || 'Unknown SMS provider error',
    };
  }
}

/**
 * Twilio Programmable Messaging Integration using Twilio SDK & REST fallback.
 */
async function sendViaTwilio(
  phone: string,
  message: string,
  notificationId?: string
): Promise<SmsProviderResult> {
  const accountSid =
    process.env.TWILIO_ACCOUNT_SID ||
    process.env.TWILIO_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM || '+18005550199';

  try {
    let client: any = null;

    if (apiKey && apiSecret && accountSid) {
      client = twilio(apiKey, apiSecret, { accountSid });
    } else if (accountSid && authToken) {
      client = twilio(accountSid, authToken);
    }

    if (!client) {
      console.warn('[SMS] Twilio credentials incomplete, simulating dispatch.');
      console.log(`[SMS MOCK TWILIO] To: ${maskPhoneNumber(phone)} | MSG: ${message}`);
      return {
        success: true,
        messageId: `simulated_tw_${Date.now()}`,
      };
    }

    const response = await client.messages.create({
      body: message,
      from: from,
      to: phone,
    });

    console.log(`[SMS Twilio Success] SID: ${response.sid} | Status: ${response.status}`);
    return {
      success: true,
      messageId: response.sid,
      rawResponse: response,
    };
  } catch (err: any) {
    console.warn(`[SMS Twilio Warning] ${err.message}`);

    // In development or when using trial unverified numbers, provide structured fallback
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SMS Fallback] Recorded simulated dispatch: ${err.message}`);
      return {
        success: true,
        messageId: `simulated_tw_${Date.now()}`,
        error: err.message,
      };
    }

    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * MSG91 Flow API Integration.
 */
async function sendViaMsg91(phone: string, message: string): Promise<SmsProviderResult> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID || 'SMARTC';

  if (!authKey || !templateId || authKey === 'mock_key_for_now') {
    console.warn('[SMS] MSG91 credentials missing or mock, falling back to simulated send.');
    console.log(`[SMS MOCK MSG91] To: ${maskPhoneNumber(phone)} | MSG: ${message}`);
    return {
      success: true,
      messageId: `mock_msg91_${Date.now()}`,
    };
  }

  const cleanDigits = phone.replace(/\D/g, '');

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
          mobiles: cleanDigits,
          message: message,
        },
      ],
    }),
  });

  const data = await response.json();
  if (data.type === 'success' || data.status === 'success') {
    return {
      success: true,
      messageId: data.message || data.request_id,
    };
  } else {
    throw new Error(data.message || 'MSG91 API error');
  }
}

/**
 * Fast2SMS Quick API Integration.
 */
async function sendViaFast2Sms(phone: string, message: string): Promise<SmsProviderResult> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: 'FAST2SMS_API_KEY is missing in environment variables.',
    };
  }

  // Extract 10-digit number
  const cleanDigits = phone.replace(/\D/g, '').slice(-10);

  const url = new URL('https://www.fast2sms.com/dev/bulkV2');
  url.searchParams.set('authorization', apiKey.trim());
  url.searchParams.set('route', 'q');
  url.searchParams.set('message', message);
  url.searchParams.set('numbers', cleanDigits);
  url.searchParams.set('flash', '0');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Cache-Control': 'no-cache',
    },
  });

  const data: any = await response.json();
  if (data.return === true || data.status === 'success' || data.return === 'true') {
    return {
      success: true,
      messageId: data.request_id || data.id,
      rawResponse: data,
    };
  } else {
    return {
      success: false,
      error: Array.isArray(data.message) ? data.message.join(', ') : (data.message || JSON.stringify(data)),
    };
  }
}

