import { SmsProviderResult } from './types';

/**
 * Normalizes phone numbers to standard 10-digit Indian mobile format for DLT gateways.
 * Strips +91, 91, 0, spaces, and non-digit characters.
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const digitsOnly = rawPhone.replace(/\D/g, '');

  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly.substring(2);
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return digitsOnly.substring(1);
  }

  return digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
}

/**
 * Masks phone number for secure logging: e.g. 98****4567
 */
export function maskPhoneNumber(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized || normalized.length < 4) return '******';
  const prefix = normalized.substring(0, 2);
  const suffix = normalized.substring(normalized.length - 4);
  return `${prefix}****${suffix}`;
}

/**
 * Validates whether the given string is a valid 10-digit Indian mobile number.
 */
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return /^[6-9]\d{9}$/.test(normalized);
}

/**
 * Dispatches SMS via Fast2SMS Bulk V2 API using route=dlt (TRAI regulatory route).
 */
export async function sendViaFast2Sms(
  to: string,
  message: string,
  dltTemplateId?: string
): Promise<SmsProviderResult> {
  const apiKey =
    process.env.FAST2SMS_API_KEY ||
    process.env.NEXT_PUBLIC_FAST2SMS_API_KEY ||
    '';

  const senderId = process.env.FAST2SMS_SENDER_ID || 'SMARTC';
  const entityId = process.env.FAST2SMS_ENTITY_ID || '';
  const templateId =
    dltTemplateId ||
    process.env.FAST2SMS_DLT_TEMPLATE_ID ||
    process.env.FAST2SMS_MESSAGE_ID ||
    '1107161523900000123';

  const cleanPhone = normalizePhoneNumber(to);
  const maskedPhone = maskPhoneNumber(to);

  if (!apiKey || apiKey === 'your_fast2sms_api_key') {
    console.warn('[Fast2SMS] FAST2SMS_API_KEY is missing or placeholder. Simulating dispatch.');
    console.log(`[Fast2SMS MOCK] To: ${maskedPhone} | Sender: ${senderId} | DLT: ${templateId} | Text: ${message.slice(0, 80)}...`);
    return {
      success: true,
      messageId: `simulated_fast2sms_${Date.now()}`,
    };
  }

  const truncatedMessage = message.length > 160 ? message.slice(0, 157) + '...' : message;

  try {
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    const payload: Record<string, string | number> = {
      route: 'dlt',
      sender_id: senderId,
      message: templateId,
      variables_values: truncatedMessage,
      numbers: cleanPhone,
      flash: 0,
    };

    if (entityId) {
      payload.entity_id = entityId;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: apiKey.trim(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: any = await response.json();
    const isSuccess = data.return === true || data.return === 'true' || (typeof data.return === 'boolean' && data.return);

    if (isSuccess) {
      const msgId = data.request_id || (Array.isArray(data.message) ? data.message[0] : data.message) || `f2s_${Date.now()}`;
      console.log(`[Fast2SMS Success] ID: ${msgId} | To: ${maskedPhone}`);
      return {
        success: true,
        messageId: String(msgId),
        rawResponse: data,
      };
    } else {
      const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Fast2SMS returned failure status';
      console.warn(`[Fast2SMS Rejected] ${errorMsg}`);
      return {
        success: false,
        error: errorMsg,
        rawResponse: data,
      };
    }
  } catch (err: any) {
    console.error('[Fast2SMS Error]', err);
    return {
      success: false,
      error: err.message || 'Network error communicating with Fast2SMS API',
    };
  }
}

/**
 * Dispatches SMS via MSG91 Flow API (Fallback).
 */
export async function sendViaMsg91(
  phone: string,
  message: string,
  templateIdOverride?: string
): Promise<SmsProviderResult> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = templateIdOverride || process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID || 'SMARTC';

  const cleanPhone = normalizePhoneNumber(phone);
  const formattedPhone = `91${cleanPhone}`;
  const maskedPhone = maskPhoneNumber(cleanPhone);

  if (!authKey || !templateId || authKey === 'your_msg91_auth_key' || authKey === 'mock_key_for_now') {
    console.warn('[MSG91] MSG91 credentials missing or placeholder. Simulating fallback send.');
    console.log(`[MSG91 MOCK] To: ${maskedPhone} | MSG: ${message.slice(0, 80)}...`);
    return {
      success: true,
      messageId: `simulated_msg91_${Date.now()}`,
    };
  }

  try {
    const truncatedMessage = message.length > 160 ? message.slice(0, 157) + '...' : message;

    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        authkey: authKey.trim(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        template_id: templateId.trim(),
        sender: senderId,
        short_url: '0',
        recipients: [
          {
            mobiles: formattedPhone,
            message: truncatedMessage,
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.type === 'success' || data.status === 'success') {
      const msgId = data.message || data.request_id || `msg91_${Date.now()}`;
      return {
        success: true,
        messageId: String(msgId),
        rawResponse: data,
      };
    } else {
      return {
        success: false,
        error: data.message || 'MSG91 API rejected dispatch',
        rawResponse: data,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error communicating with MSG91 API',
    };
  }
}

/**
 * Dispatches SMS via Twilio API.
 */
export async function sendViaTwilio(
  phone: string,
  message: string,
  _notificationId?: string
): Promise<SmsProviderResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM || '+18005550199';

  const cleanPhone = normalizePhoneNumber(phone);
  const formattedE164 = `+91${cleanPhone}`;
  const maskedPhone = maskPhoneNumber(cleanPhone);

  if (!accountSid || !authToken || accountSid.startsWith('your_')) {
    console.warn('[Twilio] Twilio credentials incomplete. Simulating dispatch.');
    console.log(`[Twilio MOCK] To: ${maskedPhone} | From: ${from} | MSG: ${message.slice(0, 80)}...`);
    return {
      success: true,
      messageId: `simulated_twilio_${Date.now()}`,
    };
  }

  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const encodedBody = new URLSearchParams({
      To: formattedE164,
      From: from,
      Body: message.length > 160 ? message.slice(0, 157) + '...' : message,
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
      return {
        success: true,
        messageId: data.sid,
        rawResponse: data,
      };
    } else {
      throw new Error(data.message || 'Twilio API error');
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Twilio network error',
    };
  }
}

/**
 * Core send SMS function supporting Fast2SMS (Primary), MSG91 (Fallback), Twilio, and Mock mode.
 */
export async function sendSms(
  phone: string,
  message: string,
  notificationId?: string,
  dltTemplateId?: string
): Promise<SmsProviderResult> {
  const provider = (process.env.SMS_PROVIDER || 'fast2sms').toLowerCase().trim();
  const cleanPhone = normalizePhoneNumber(phone);

  if (!isValidPhoneNumber(cleanPhone)) {
    return {
      success: false,
      error: `INVALID_PHONE_NUMBER: '${phone}' is not a valid 10-digit Indian mobile number.`,
    };
  }

  try {
    // 1. Manual Overrides
    if (provider === 'msg91') {
      return await sendViaMsg91(cleanPhone, message, dltTemplateId);
    } else if (provider === 'twilio') {
      return await sendViaTwilio(cleanPhone, message, notificationId);
    } else if (provider === 'mock') {
      console.log(`[SMS MOCK] To: ${maskPhoneNumber(cleanPhone)} | MSG: ${message}`);
      return {
        success: true,
        messageId: `mock_${Date.now()}`,
      };
    }

    // 2. Default: Fast2SMS Primary
    const fast2smsRes = await sendViaFast2Sms(cleanPhone, message, dltTemplateId);
    if (fast2smsRes.success) {
      return fast2smsRes;
    }

    // 3. Automatic MSG91 Fallback
    const msg91Auth = process.env.MSG91_AUTH_KEY;
    const msg91Tpl = process.env.MSG91_TEMPLATE_ID;

    if (msg91Auth && msg91Tpl && msg91Auth !== 'your_msg91_auth_key') {
      console.warn(`[SMS Service] Fast2SMS dispatch failed (${fast2smsRes.error}). Retrying with MSG91 fallback...`);
      const msg91Res = await sendViaMsg91(cleanPhone, message, dltTemplateId);
      if (msg91Res.success) {
        console.log(`[SMS Service] MSG91 fallback successful for ${maskPhoneNumber(cleanPhone)}`);
        return msg91Res;
      }
      return {
        success: false,
        error: `Fast2SMS: ${fast2smsRes.error} | MSG91 Fallback: ${msg91Res.error}`,
      };
    }

    return fast2smsRes;
  } catch (err: any) {
    console.error('[SMS Service Error]', err);
    return {
      success: false,
      error: err.message || 'Unknown SMS provider error',
    };
  }
}
