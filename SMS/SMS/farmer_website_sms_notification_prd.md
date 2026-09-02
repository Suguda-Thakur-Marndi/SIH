# PRD — Farmer Website SMS Notification System

**Document:** Product Requirements Document  
**Module:** SMS Notifications  
**Version:** 1.0  
**Status:** Implementation Ready  
**Primary Provider:** Twilio Programmable Messaging  
**Target Platform:** Existing Farmer Website  
**Primary Goal:** Send SMS notifications to farmers using the phone number already stored in the website database.

---

## 1. Overview

The farmer website already stores user/farmer profile information, including mobile phone numbers. This module will connect the existing backend/database to Twilio so the website can send SMS notifications directly to the phone number associated with a user.

The system must **never ask an administrator or frontend user to manually enter a farmer's phone number when a database user ID is available**. The backend must retrieve the phone number from the authenticated user's profile or the selected farmer record and send the SMS through Twilio.

### Core flow

```text
Farmer/User Profile
        |
        | userId
        v
Website Backend
        |
        | Query database
        v
Farmer phone number
        |
        | Validate + normalize
        v
SMS Notification Service
        |
        | Twilio API
        v
Twilio
        |
        v
Farmer's mobile phone
```

---

# 2. Goals

## 2.1 Primary goals

1. Send SMS messages to phone numbers stored in the existing website database.
2. Use the farmer/user ID as the primary lookup value instead of trusting a phone number supplied by the frontend.
3. Integrate Twilio Programmable Messaging with the existing backend.
4. Keep all Twilio credentials server-side.
5. Record SMS attempts and Twilio message status in the database.
6. Provide reusable backend functions/API routes so other modules can trigger SMS.
7. Support notification types such as:
   - Crop/weather alerts
   - Insurance updates
   - Government scheme notifications
   - Application/status updates
   - Important farmer alerts
   - AI-generated recommendations, when explicitly triggered by the application
8. Prevent duplicate or accidental SMS sends.
9. Provide clear error handling and delivery status.
10. Keep the implementation compatible with the existing website architecture rather than creating a separate application.

---

# 3. Non-Goals

This version does **not** require:

- A separate SMS frontend application.
- A separate farmer database.
- Storing Twilio credentials in the database.
- Sending SMS directly from browser/client-side code.
- Replacing the existing authentication system.
- Replacing the existing user profile system.
- Building a complete two-way SMS chatbot.
- Bulk marketing campaigns.
- Automatic AI-generated messages without application-level approval/rules.

Two-way SMS/webhook functionality can be added later.

---

# 4. Existing Data Source

The system must use the existing user/farmer profile database.

The implementation team must inspect the current schema before adding new fields.

At minimum, the existing user/farmer record is expected to contain something equivalent to:

```text
User
├── id
├── name
├── phone / phoneNumber
├── email
├── ...
```

### Important requirement

Do **not** create a duplicate `farmer_phone_numbers` table if the existing profile already contains the user's phone number.

Use the existing profile field.

If the current database does not contain a phone number field, add one to the existing user/farmer profile model rather than creating an unrelated duplicate source of truth.

---

# 5. Recommended Database Additions

The existing user table/profile remains the source of truth for phone numbers.

A separate SMS log should be added so the system can track communication history.

## 5.1 `sms_notifications` table

Recommended structure:

```text
sms_notifications
-----------------------------
id
user_id
phone_number
message
notification_type
status
twilio_message_sid
twilio_error_code
twilio_error_message
attempt_count
created_at
sent_at
delivered_at
failed_at
```

### Field requirements

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | UUID/int | Yes | SMS record ID |
| `user_id` | FK | Yes | Existing farmer/user ID |
| `phone_number` | string | Yes | Snapshot of destination number at send time |
| `message` | text | Yes | SMS content |
| `notification_type` | string/enum | Yes | e.g. WEATHER, INSURANCE, CROP_ALERT |
| `status` | enum/string | Yes | QUEUED, SENT, DELIVERED, FAILED |
| `twilio_message_sid` | string | No | Twilio message identifier |
| `twilio_error_code` | string | No | Twilio error code |
| `twilio_error_message` | text | No | Error returned by Twilio |
| `attempt_count` | integer | Yes | Number of send attempts |
| `created_at` | timestamp | Yes | Record creation time |
| `sent_at` | timestamp | No | Time request was accepted by Twilio |
| `delivered_at` | timestamp | No | Delivery confirmation time |
| `failed_at` | timestamp | No | Failure time |

### Why store `phone_number` in the SMS log?

The user profile can change later. The SMS record should preserve the destination used for that specific send for auditing/debugging.

The profile remains the source of truth for future messages.

---

# 6. User Consent / Notification Preferences

The system should support notification preferences.

Recommended fields in the existing profile or a notification-preferences table:

```text
sms_enabled
weather_sms_enabled
crop_sms_enabled
insurance_sms_enabled
scheme_sms_enabled
```

Minimum requirement:

```text
sms_enabled
```

Before sending a non-critical SMS:

```text
if user.sms_enabled !== true:
    do not send
```

The exact preference structure should follow the existing website's user/profile architecture.

---

# 7. Twilio Configuration

Twilio credentials must be stored as backend environment variables.

Example:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

If the project uses a Twilio-supported sender ID instead of a phone number, use the appropriate sender configuration.

### Security requirements

Never:

- Put Twilio credentials in React/Next.js client code.
- Prefix secrets with `NEXT_PUBLIC_`.
- Store the API secret in the database.
- Commit `.env` files containing credentials.
- Return Twilio credentials in API responses.
- Log the API secret.
- Send the API secret to the browser.

Add environment files to `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
```

Twilio recommends API keys for production applications and recommends keeping credentials in environment variables. Restricted API keys provide fine-grained access to Twilio resources.

---

# 8. Twilio API Key Permissions

Use a **Restricted API Key** for production.

The key should receive only the permissions required by the SMS service.

For this project, configure the appropriate **Messaging** permission needed to create/send Message resources.

Do not use a full-access credential when a restricted key can satisfy the application requirements.

---

# 9. Backend Architecture

The SMS system should be implemented as a reusable backend service.

Recommended structure for a Next.js-style project:

```text
app/
├── api/
│   └── notifications/
│       └── sms/
│           └── route.ts
│
lib/
├── twilio/
│   ├── client.ts
│   └── sms.ts
│
├── notifications/
│   ├── sms-service.ts
│   ├── notification-types.ts
│   └── notification-templates.ts
│
└── validation/
    └── phone.ts

prisma/
├── schema.prisma
└── migrations/

types/
└── notifications.ts
```

If the existing project uses a different backend structure, preserve its conventions instead of blindly creating this exact tree.

---

# 10. Twilio Client

Create one server-side Twilio client.

Conceptually:

```ts
import twilio from "twilio";

export const twilioClient = twilio(
  process.env.TWILIO_API_KEY,
  process.env.TWILIO_API_SECRET,
  {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
  }
);
```

The client must only be imported by server-side code.

---

# 11. SMS Service

Create a reusable service:

```text
sendSmsToUser(userId, message, notificationType)
```

### Required flow

```text
1. Receive userId
2. Authenticate/authorize caller
3. Query existing user profile
4. Read phone number
5. Check SMS preferences
6. Validate phone number
7. Normalize phone number
8. Create SMS log with QUEUED status
9. Send through Twilio
10. Save Twilio Message SID
11. Update status
12. Return safe result
```

### Example interface

```ts
type SendSmsInput = {
  userId: string;
  message: string;
  notificationType: NotificationType;
};

type SendSmsResult = {
  success: boolean;
  notificationId: string;
  status: "QUEUED" | "SENT" | "FAILED";
};
```

---

# 12. Phone Number Handling

The backend must retrieve the phone number from the database.

### Correct

```text
Frontend
   |
   | userId = 123
   v
Backend
   |
   | SELECT phone FROM users WHERE id = 123
   v
+919876543210
   |
   v
Twilio
```

### Incorrect

```text
Frontend
   |
   | userId = 123
   | phone = +919876543210
   v
Backend
```

The backend must not blindly trust a phone number submitted by the client.

### Validation

Before sending:

- Ensure the number exists.
- Remove invalid whitespace/characters.
- Normalize to E.164 format where applicable.
- Verify that the country code is present.
- Reject malformed numbers.
- Do not silently modify a number in a way that could send to a different recipient.

For India, the expected format should generally be:

```text
+91XXXXXXXXXX
```

The exact validation should use a proper phone-number library where possible.

---

# 13. SMS API Endpoint

Create a protected endpoint:

```http
POST /api/notifications/sms
```

### Request

```json
{
  "userId": "USER_ID",
  "message": "Rain is expected tomorrow. Please protect your crop.",
  "notificationType": "WEATHER_ALERT"
}
```

### Backend behavior

The backend:

1. Authenticates the request.
2. Authorizes the caller.
3. Looks up `userId`.
4. Retrieves the phone number.
5. Checks SMS preferences.
6. Validates the message.
7. Creates an SMS notification record.
8. Calls Twilio.
9. Saves the Twilio Message SID/status.
10. Returns a safe response.

### Successful response

```json
{
  "success": true,
  "notificationId": "sms_123",
  "status": "SENT"
}
```

Do not return Twilio secrets or internal credentials.

---

# 14. Authorization

SMS sending is a potentially billable external action.

Every endpoint that can trigger SMS must be protected.

Possible allowed callers:

- Authenticated backend services
- Authorized admin users
- Trusted application modules
- Scheduled notification jobs

A normal farmer/user should not be able to arbitrarily call:

```text
POST /api/notifications/sms
```

to send unlimited SMS messages.

The authorization model must follow the website's existing authentication/role system.

---

# 15. Notification Types

Create a centralized notification type enum.

Example:

```ts
enum NotificationType {
  WEATHER_ALERT = "WEATHER_ALERT",
  CROP_ALERT = "CROP_ALERT",
  INSURANCE_UPDATE = "INSURANCE_UPDATE",
  SCHEME_UPDATE = "SCHEME_UPDATE",
  APPLICATION_UPDATE = "APPLICATION_UPDATE",
  SYSTEM_ALERT = "SYSTEM_ALERT",
}
```

Additional types can be added later.

---

# 16. Message Templates

Do not scatter SMS text throughout the application.

Create centralized templates.

Example:

```ts
const templates = {
  WEATHER_ALERT: (name: string) =>
    `Hello ${name}, rain is expected in your area. Please take precautions for your crop.`,

  INSURANCE_UPDATE: (name: string, status: string) =>
    `Hello ${name}, your crop insurance application status is ${status}.`,
};
```

Templates should support variables.

Example:

```text
{{farmerName}}
{{cropName}}
{{status}}
{{date}}
{{applicationId}}
```

---

# 17. Example Use Cases

## 17.1 Weather alert

```text
Weather service
      ↓
Find affected farmers
      ↓
Get user IDs
      ↓
SMS service
      ↓
Database phone numbers
      ↓
Twilio
      ↓
Farmers receive SMS
```

## 17.2 Insurance update

```text
Insurance application updated
        ↓
Get farmer/user ID
        ↓
Get phone from user profile
        ↓
Generate approved notification
        ↓
Send SMS
        ↓
Save Twilio SID/status
```

## 17.3 Government scheme notification

```text
New scheme/update
        ↓
Determine eligible farmers
        ↓
Get user IDs
        ↓
Send SMS individually
        ↓
Record results
```

---

# 18. Duplicate Prevention

The system must avoid accidentally sending the same notification multiple times.

Recommended fields:

```text
notification_type
user_id
event_id
```

For event-based notifications, create an idempotency key:

```text
eventId + userId + notificationType
```

Before sending, check whether the same event has already been successfully processed.

Example:

```text
WEATHER_EVENT_928 + USER_123 + WEATHER_ALERT
```

If it already exists as successfully sent:

```text
Do not send again.
```

---

# 19. Rate Limiting

SMS must be rate-limited.

Recommended protections:

- Maximum requests per user/time period.
- Maximum requests per API route.
- Maximum bulk-send batch size.
- Queue large batches instead of sending everything in one HTTP request.
- Prevent frontend retry loops from creating duplicate SMS.

For bulk notifications:

```text
Notification Job
      ↓
Queue
      ↓
Worker
      ↓
SMS Service
      ↓
Twilio
```

Do not implement large bulk sends as one long-running browser request.

---

# 20. SMS Status Lifecycle

Use a status lifecycle such as:

```text
QUEUED
   ↓
SENT
   ↓
DELIVERED
```

Failure:

```text
QUEUED
   ↓
FAILED
```

Possible statuses:

```text
QUEUED
SENT
DELIVERED
FAILED
UNDELIVERED
```

The exact mapping should follow the Twilio response/status webhook implementation.

---

# 21. Twilio Status Webhook — Recommended Phase 2

For accurate delivery tracking, add a Twilio status callback.

Example:

```http
POST /api/webhooks/twilio/sms
```

Twilio sends message-status information to the webhook.

The backend should:

1. Verify the webhook.
2. Read the Twilio Message SID.
3. Find the matching `sms_notifications` row.
4. Update its status.
5. Store failure information if applicable.

Example:

```text
Twilio
  |
  | status callback
  v
/api/webhooks/twilio/sms
  |
  v
sms_notifications
```

---

# 22. Error Handling

Handle at least:

### User not found

```json
{
  "success": false,
  "error": "USER_NOT_FOUND"
}
```

### Phone number missing

```json
{
  "success": false,
  "error": "PHONE_NUMBER_NOT_FOUND"
}
```

### Invalid phone number

```json
{
  "success": false,
  "error": "INVALID_PHONE_NUMBER"
}
```

### SMS disabled

```json
{
  "success": false,
  "error": "SMS_NOT_ENABLED"
}
```

### Twilio failure

```json
{
  "success": false,
  "error": "SMS_SEND_FAILED",
  "notificationId": "sms_123"
}
```

Do not expose raw Twilio credentials or sensitive internal stack traces to the frontend.

---

# 23. Logging

Log useful operational information:

```text
notificationId
userId
notificationType
Twilio Message SID
status
timestamp
error code
```

Do not log:

```text
TWILIO_API_SECRET
TWILIO_AUTH_TOKEN
full credentials
```

Phone numbers should be masked in application logs where practical:

```text
+91******3210
```

---

# 24. Frontend Requirements

The frontend should not communicate directly with Twilio.

Correct:

```text
Frontend
   ↓
Website API
   ↓
SMS Service
   ↓
Twilio
```

Incorrect:

```text
Frontend
   ↓
Twilio API
```

The frontend may provide UI for:

- Notification preferences
- SMS enabled/disabled
- Admin notification testing
- SMS history/status, if authorized

---

# 25. Admin/Test SMS UI

For development and testing, an authorized admin can have:

```text
Select Farmer
      ↓
Database retrieves phone number
      ↓
Message preview
      ↓
Send Test SMS
      ↓
Confirmation
```

The admin should select the farmer/user from the database rather than manually entering a phone number.

Example:

```text
Farmer:
[ Select Farmer ▼ ]

Phone:
+91******3210

Message:
[ Test SMS from Farmer Platform ]

[ Send Test SMS ]
```

The displayed phone number should be masked where appropriate.

---

# 26. Environment Configuration

Create/update:

```env
# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_API_KEY=
TWILIO_API_SECRET=
TWILIO_PHONE_NUMBER=

# Optional
TWILIO_SMS_STATUS_CALLBACK_URL=
```

For production, configure these through the hosting platform's secret/environment-variable manager rather than committing them to Git.

---

# 27. `.env.example`

Commit only an example file:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
TWILIO_SMS_STATUS_CALLBACK_URL=https://your-domain.com/api/webhooks/twilio/sms
```

Never commit the real `.env`.

---

# 28. Security Requirements

## Mandatory

- Server-side Twilio integration only.
- Restricted Twilio API key in production.
- Secrets stored in environment variables/secrets manager.
- Authentication on SMS APIs.
- Authorization before sending.
- Rate limiting.
- Input validation.
- Phone-number validation.
- Message-length validation.
- Idempotency for event-triggered messages.
- Twilio webhook verification.
- No credentials in logs.
- No credentials in frontend bundles.
- No credentials in Git.

---

# 29. India-Specific SMS Requirements

The target website is intended for farmers in India, so India-specific telecommunications requirements must be considered before production SMS deployment.

Twilio currently states that domestic SMS in India requires company/Sender ID registration through the Indian mobile operators' DLT process, and approved DLT templates/Sender IDs must be used for applicable domestic traffic.

Therefore the implementation must include a **Twilio India compliance configuration step before production launch**.

The project team must collect/configure the required values applicable to the approved sender and message templates, such as:

```text
Entity ID
Sender ID / Header
DLT Template ID
PE-TM chain details where applicable
```

Do not assume that a normal Twilio phone number will work as the domestic Indian sender for all use cases.

The compliance process must be completed independently of the application code.

---

# 30. Message Content Rules

SMS messages should be:

- Short.
- Clear.
- Farmer-friendly.
- Available in the appropriate language where required.
- Free from unnecessary technical terminology.
- Appropriate for the notification category.

Example:

```text
Hello Ramesh, heavy rain is expected tomorrow.
Please protect your paddy crop and check field drainage.
```

For production India traffic, the message content must match the applicable approved template requirements.

Do not dynamically generate arbitrary text for a DLT-template-based SMS if that would cause the final message to differ from the approved template structure.

---

# 31. SMS Character Handling

The implementation should account for SMS character encoding.

English/GSM messages can generally fit more characters per SMS segment than Unicode messages.

Regional-language SMS may use Unicode encoding and therefore may consume more SMS segments.

The application should:

- Display an approximate character count.
- Warn administrators about unusually long messages.
- Avoid unnecessary message length.
- Prefer concise templates.

---

# 32. Testing Strategy

## Unit tests

Test:

```text
getUserPhoneNumber()
validatePhoneNumber()
normalizePhoneNumber()
checkSmsPreference()
createSmsLog()
sendSms()
handleTwilioError()
```

## Integration tests

Test:

```text
Database
   ↓
User lookup
   ↓
SMS service
   ↓
Twilio test/send environment
```

## API tests

Test:

```text
POST /api/notifications/sms
```

Cases:

1. Valid user + valid phone.
2. User does not exist.
3. Phone missing.
4. Invalid phone.
5. SMS disabled.
6. Unauthorized request.
7. Duplicate event.
8. Twilio failure.
9. Rate limit exceeded.

---

# 33. Development Test Flow

Use a single verified/test phone number first.

```text
1. Configure Twilio credentials.
2. Configure SMS-capable sender.
3. Select a test farmer.
4. Confirm database phone number.
5. Send a test SMS.
6. Check Twilio response.
7. Check SMS log.
8. Verify phone receipt.
9. Test failure handling.
10. Test status callback if implemented.
```

Do not begin bulk messaging until individual SMS sending is verified.

---

# 34. Example End-to-End Implementation

```text
Admin/System
     |
     | userId = 123
     v
POST /api/notifications/sms
     |
     v
Authentication
     |
     v
Authorization
     |
     v
Database
     |
     | User 123
     | phone = +919876543210
     v
Notification Preferences
     |
     v
Phone Validation
     |
     v
Create SMS Log
     |
     | QUEUED
     v
Twilio SMS Service
     |
     v
Twilio Messaging API
     |
     v
Farmer Phone
     |
     v
Twilio Message SID
     |
     v
Update SMS Log
     |
     | SENT
     v
Status Callback
     |
     | DELIVERED / FAILED
     v
Database
```

---

# 35. Acceptance Criteria

The module is complete when all of the following are true:

### Database

- [ ] Existing farmer/user phone number is used as the source of truth.
- [ ] SMS notification history is stored.
- [ ] Twilio Message SID is stored.
- [ ] SMS status is stored.
- [ ] Failure information is stored.

### Backend

- [ ] Twilio client is server-side only.
- [ ] Restricted API key is supported.
- [ ] SMS endpoint exists.
- [ ] Authentication is enforced.
- [ ] Authorization is enforced.
- [ ] Phone number is retrieved using user ID.
- [ ] Phone number is validated.
- [ ] SMS preferences are checked.
- [ ] Duplicate sending is prevented.
- [ ] Rate limiting exists.
- [ ] Errors are handled safely.

### Twilio

- [ ] Account SID configured.
- [ ] API key configured.
- [ ] API secret configured.
- [ ] SMS-capable sender configured.
- [ ] Messaging permissions configured.
- [ ] Destination region enabled.
- [ ] India DLT/Sender ID/template requirements completed where applicable.

### Frontend

- [ ] Admin/system can trigger a test SMS.
- [ ] Farmer selection uses database records.
- [ ] Phone number is not manually required when the farmer already exists.
- [ ] SMS result is shown clearly.
- [ ] Sensitive Twilio credentials are never exposed.

### Production

- [ ] `.env` is not committed.
- [ ] Secrets are stored securely.
- [ ] Webhook verification is implemented if status callbacks are enabled.
- [ ] Logging does not expose secrets.
- [ ] SMS sending has been tested with a real authorized test number.
- [ ] India-specific messaging compliance is completed before production traffic.

---

# 36. Suggested Implementation Order

Implement in this order:

```text
Phase 1
├── Inspect existing user/profile database
├── Identify phone number field
└── Identify authentication system

Phase 2
├── Create SMS notification database table
├── Add SMS preference
└── Add migration

Phase 3
├── Configure Twilio environment variables
├── Create Restricted API key
└── Install Twilio SDK

Phase 4
├── Create Twilio client
├── Create phone validation utility
└── Create SMS service

Phase 5
├── Create protected SMS API
├── Add authorization
├── Add rate limiting
└── Add idempotency

Phase 6
├── Add SMS templates
├── Connect insurance/crop/weather modules
└── Add admin test UI

Phase 7
├── Add Twilio status webhook
├── Track delivery
└── Improve error handling

Phase 8
├── India DLT/Sender ID/template configuration
├── Production testing
└── Production deployment
```

---

# 37. Future Extensions

The architecture should allow future support for:

- Two-way SMS.
- Farmer replies.
- SMS OTP/verification.
- Scheduled SMS.
- Weather-triggered alerts.
- Insurance reminders.
- Government scheme alerts.
- Multilingual SMS.
- Notification queues.
- Delivery analytics.
- Retry policies.
- WhatsApp notifications.
- Email/push notification fallback.

These should be implemented as extensions of the notification service rather than tightly coupling Twilio code to individual website modules.

---

# 38. Final Architecture

```text
                         FARMER WEBSITE
                              |
                +-------------+-------------+
                |                           |
          Existing Database             Frontend
                |                           |
                |                       Admin/User UI
                |                           |
                +-------------+-------------+
                              |
                         Backend API
                              |
                     Notification Service
                              |
              +---------------+---------------+
              |                               |
        User/Profile DB                 SMS Log DB
              |                               |
              | phone number                   |
              +---------------+---------------+
                              |
                         Twilio Client
                              |
                    Twilio Messaging API
                              |
                         SMS Provider
                              |
                              v
                     FARMER MOBILE PHONE
```

---

# 39. Key Design Decision

**The database user ID is the primary identifier. The phone number is retrieved by the backend from the existing user profile.**

Never make the frontend the source of truth for the destination phone number.

```text
userId
  ↓
Database
  ↓
phoneNumber
  ↓
validation
  ↓
Twilio
  ↓
SMS
```

This keeps the system consistent with the existing farmer profile and prevents users or client-side code from arbitrarily changing SMS destinations.

---

# 40. References

Twilio documentation used for this PRD:

- Twilio SMS API / sending messages
- Twilio API Keys
- Twilio Restricted API Keys
- Twilio India SMS guidelines and DLT requirements

Implementation teams should verify current Twilio documentation and Indian telecom requirements immediately before production deployment because messaging regulations and provider requirements can change.
