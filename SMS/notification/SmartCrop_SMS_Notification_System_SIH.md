# SmartCrop — SMS / Notification Distress Alert System
## SIH PS-02 Implementation Plan

**Purpose:** Implement a backend-only notification system that automatically alerts farmers when the SmartCrop platform detects agricultural distress. There is **no SMS frontend**. The farmer receives the alert directly on their registered phone number, while the existing SmartCrop notification page can optionally show the same event inside the app.

---

## 1. What We Are Building

SmartCrop already has the central distress loop:

```text
MONITOR → DETECT → PREDICT → EXPLAIN → INTERVENE
```

The SMS system closes the loop:

```text
Farm / External Data
       ↓
Distress Risk Engine
       ↓
Risk Score + Reason
       ↓
Threshold / Emergency Rule
       ↓
Notification Service
       ↓
SMS Provider
       ↓
Farmer's Phone
```

Example:

```text
Rainfall deviation: -35%
Market price: -22%
Loan due: 8 days

             ↓

Distress Score = 81 / 100
Risk = HIGH

             ↓

Automatic SMS

"SmartCrop Alert:
Your farm has been marked HIGH RISK due to
low rainfall and falling crop prices.
Please check today's advisory.
Contact your agriculture officer if needed."
```

The important point for the SIH demo is that **the farmer does not need to open the website to receive a critical alert**.

This directly supports the problem statement's requirement for proactive distress intervention and low-bandwidth accessibility.

---

## 2. Why SMS Should Be Backend-Only

Do not build an SMS screen for farmers.

The farmer already has:

- Phone number
- Language preference
- Farmer profile
- Crop information
- Location
- Risk score
- Existing notification system

The backend can therefore decide:

1. Is the farmer at risk?
2. Is the alert important enough to send?
3. What caused the risk?
4. What language should be used?
5. Which message template should be used?
6. Has this alert already been sent?
7. Which SMS provider should deliver it?

The only farmer-facing component required is the **actual SMS received on the phone**.

The existing `/notifications` page can remain an optional in-app history/backup view.

---

# 3. Recommended Architecture

Use the existing SmartCrop stack instead of introducing another backend.

```text
                    ┌─────────────────────┐
                    │  Weather / Soil /    │
                    │  NDVI / Mandi / Loan │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │  Distress Risk       │
                    │  Engine              │
                    │  0–100 Score         │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Alert Decision Layer │
                    │                      │
                    │ HIGH ≥ 70            │
                    │ CRITICAL ≥ 85        │
                    │ Disaster = immediate │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Notification Service │
                    │                      │
                    │ Deduplication        │
                    │ Language             │
                    │ Templates             │
                    │ Retry logic           │
                    └──────────┬──────────┘
                               ↓
                 ┌──────────────────────────┐
                 │ SMS Provider             │
                 │ MSG91 / Twilio / Exotel  │
                 └────────────┬─────────────┘
                              ↓
                       📱 Farmer Phone


              In parallel:
                              ↓
                    ┌─────────────────────┐
                    │ MySQL notifications │
                    │ + delivery status    │
                    └─────────────────────┘
                              ↓
                    Existing Notifications
                         / Officer UI
```

---

# 4. Provider Recommendation

The PRD already allows:

- Twilio
- MSG91
- Exotel

For an India-focused SIH prototype, **MSG91 or Exotel** is a practical choice because the system is intended for Indian farmers and Indian mobile numbers.

However, keep the provider behind a small abstraction:

```text
SmartCrop Notification Service
             ↓
       SMS Provider Interface
        ↙       ↓       ↘
     MSG91    Exotel   Twilio
```

This means the rest of the application does not depend directly on one vendor.

For the hackathon, implement **one provider only**.

---

# 5. Core Trigger Logic

The SMS system should NOT send a message every time the risk score changes.

Otherwise a farmer could receive:

```text
72 HIGH RISK
73 HIGH RISK
74 HIGH RISK
75 HIGH RISK
76 HIGH RISK
```

within a short period.

Instead, use **threshold crossing + deduplication**.

## Recommended rules

| Condition | Action |
|---|---|
| Risk < 50 | No distress SMS |
| Risk 50–69 | In-app advisory only |
| Risk crosses 70 | Send HIGH-RISK SMS |
| Risk crosses 85 | Send CRITICAL SMS |
| Risk remains high | Do not resend continuously |
| Risk falls below threshold then rises above it again | Send new alert |
| Severe disaster warning | Send immediate SMS |
| Officer manually sends emergency alert | Send SMS immediately |

Example:

```text
Day 1 → 62 → No SMS
Day 2 → 68 → No SMS
Day 3 → 72 → HIGH-RISK SMS
Day 4 → 75 → No duplicate SMS
Day 5 → 81 → No duplicate SMS
Day 6 → 87 → CRITICAL SMS
```

---

# 6. What Should Trigger an SMS?

There should be two categories.

## A. Distress Risk Alerts

Generated by the SmartCrop Risk Engine.

### Example signals

```text
Rainfall deviation
Market price decline
Loan due-date proximity
Soil moisture decline
NDVI decline
```

The SIH PRD specifically identifies rainfall deviation, market price drop and loan due-date proximity as the core hackathon distress signals.

A sample weighted score can be:

```text
Rainfall Risk     = 30 points
Market Risk       = 25 points
Loan Risk         = 20 points
Soil Risk         = 15 points
NDVI Risk         = 10 points

Maximum           = 100
```

The exact weights should remain configurable.

---

## B. Disaster Alerts

These should bypass the normal risk threshold.

Examples:

```text
Cyclone warning
Flood warning
Extreme rainfall
Heatwave
Severe weather event
```

If an authoritative disaster feed indicates an emergency for the farmer's location:

```text
DISASTER DETECTED
       ↓
Immediate SMS
       ↓
Farmer
       +
Officer Dashboard
```

This matches the PRD requirement that disaster warnings be proactively pushed through SMS/voice rather than waiting for the farmer to open the app.

---

# 7. Notification Database Design

The existing project already has a `notifications` table.

Do not create an unnecessary second notification system.

Extend the existing notification data model if required.

Recommended fields:

```text
notifications
-------------------------------
id
user_id
farmer_id
type
title
message
priority
channel
status
provider
provider_message_id
risk_score
reason
sent_at
delivered_at
failed_at
created_at
```

### Important fields

`channel`

```text
SMS
IN_APP
VOICE
PUSH
```

For this implementation:

```text
channel = SMS
```

`status`

```text
PENDING
SENT
DELIVERED
FAILED
```

`priority`

```text
LOW
MEDIUM
HIGH
CRITICAL
```

`type`

```text
DISTRESS
DISASTER
WEATHER
MARKET
LOAN
OFFICER
GENERAL
```

---

# 8. Do Not Store SMS Provider Credentials in the Database

Provider credentials must stay in environment variables.

Example:

```env
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=your_key
MSG91_TEMPLATE_ID=your_template_id
MSG91_SENDER_ID=SMARTC
```

If using another provider:

```env
SMS_PROVIDER=exotel
EXOTEL_API_KEY=...
EXOTEL_API_TOKEN=...
```

Never expose these values through:

```text
NEXT_PUBLIC_*
```

They are server-side secrets.

---

# 9. Recommended Backend Files

Fit this into the existing Next.js structure.

```text
app/
└── api/
    ├── notifications/
    │   ├── route.ts
    │   ├── emit/
    │   │   └── route.ts
    │   └── read-all/
    │       └── route.ts
    │
    ├── risk/
    │   └── route.ts
    │
    └── disaster/
        └── route.ts

lib/
├── db.ts
├── smartcrop-auth.ts
├── sarvam-ai.ts
│
└── notifications/
    ├── sms.ts
    ├── service.ts
    ├── templates.ts
    ├── rules.ts
    └── types.ts
```

### Responsibility

`lib/notifications/sms.ts`

Communicates with MSG91/Exotel/Twilio.

`lib/notifications/templates.ts`

Creates farmer messages.

`lib/notifications/rules.ts`

Decides whether an alert should be sent.

`lib/notifications/service.ts`

Coordinates the complete notification workflow.

---

# 10. Notification Service Flow

The service should work approximately like this:

```text
risk calculation
      ↓
risk score generated
      ↓
is score >= threshold?
      ↓
     YES
      ↓
has equivalent alert already been sent?
      ↓
   NO       YES
    ↓         ↓
create       skip
notification
    ↓
generate localized message
    ↓
send SMS
    ↓
save provider response
    ↓
update status
```

Pseudo-code:

```ts
async function processRiskAlert(farmer, risk) {
  const priority = getRiskPriority(risk.score);

  if (!priority) {
    return;
  }

  const alreadySent = await hasRecentEquivalentAlert(
    farmer.id,
    "DISTRESS",
    priority
  );

  if (alreadySent) {
    return;
  }

  const message = await buildLocalizedRiskMessage(
    farmer,
    risk
  );

  const notification = await createNotification({
    farmerId: farmer.id,
    type: "DISTRESS",
    channel: "SMS",
    priority,
    message,
    riskScore: risk.score,
  });

  await sendSms({
    phone: farmer.phone,
    message,
    notificationId: notification.id,
  });
}
```

---

# 11. Message Generation

Do not allow an LLM to invent critical agricultural facts.

The existing PRD explicitly states that agronomic and financial facts must come from curated data/rules and that the LLM should explain verified information rather than decide it.

Therefore:

```text
Risk Engine
    ↓
Verified reasons
    ↓
Message Template
    ↓
Sarvam translation if required
    ↓
SMS
```

Not:

```text
LLM
 ↓
Invent warning
 ↓
SMS
```

---

# 12. SMS Template Strategy

Use predefined templates.

## English

```text
SmartCrop Alert: Your farm is at HIGH RISK ({{score}}/100).
Main concerns: {{reason1}}, {{reason2}}.
Please open SmartCrop for today's recommended actions.
```

## Hindi

```text
SmartCrop चेतावनी: आपके खेत का जोखिम स्तर HIGH ({{score}}/100) है।
मुख्य कारण: {{reason1}}, {{reason2}}।
आज की सलाह के लिए SmartCrop देखें।
```

## Odia

Use the same verified message structure translated into Odia through the project's existing Indic-language infrastructure.

The project already has Sarvam AI integration for Indic translation and TTS, so the SMS layer should reuse that capability instead of introducing a separate translation system.

---

# 13. Keep SMS Short

SMS should not contain the complete advisory.

Use:

```text
Alert
+
Risk score
+
Top 1–2 reasons
+
Immediate action
+
App/officer reference
```

Example:

```text
SmartCrop Alert:
Risk 81/100 HIGH.
Low rainfall and falling mandi price detected.
Check today's advisory in SmartCrop or contact your agriculture officer.
```

The full explanation can remain in:

```text
/risk-details
/recommended-actions
/notifications
```

---

# 14. Language Selection

The farmer profile already contains language information.

Example:

```text
farmer.language = "od"
```

Notification flow:

```text
Farmer Profile
     ↓
language = Odia
     ↓
Verified English/template content
     ↓
Sarvam translation
     ↓
Odia SMS
```

For reliability, cache commonly used translated templates rather than translating every identical message repeatedly.

For example:

```text
HIGH_RISK_TEMPLATE_ODIA
CRITICAL_RISK_TEMPLATE_ODIA
CYCLONE_TEMPLATE_ODIA
FLOOD_TEMPLATE_ODIA
HEATWAVE_TEMPLATE_ODIA
```

---

# 15. Phone Number Validation

Before sending:

```text
Farmer phone exists?
       ↓
Valid Indian mobile number?
       ↓
Farmer opted into alerts?
       ↓
YES → send
NO  → skip
```

Recommended normalized format:

```text
+91XXXXXXXXXX
```

Do not send SMS to malformed numbers.

For the hackathon database, synthetic phone numbers can be used for demo records, but the actual SMS demo should use a number that the SMS provider permits.

---

# 16. Deduplication

This is one of the most important parts.

Suppose the scheduled job runs every hour.

Without deduplication:

```text
09:00 → risk 81 → SMS
10:00 → risk 81 → SMS
11:00 → risk 82 → SMS
12:00 → risk 82 → SMS
```

Bad UX.

Instead:

```text
09:00 → risk 81 → SMS
10:00 → risk 81 → SKIP
11:00 → risk 82 → SKIP
12:00 → risk 82 → SKIP
```

Send another message only if:

```text
risk crosses into a higher severity
OR
a new major event occurs
OR
a configured cooldown expires
OR
an officer manually triggers an alert
```

Recommended cooldown:

```text
HIGH alert: 24 hours
CRITICAL alert: 12 hours
DISASTER alert: immediate, with provider/rule-based deduplication
```

---

# 17. Scheduled Risk Checking

The current PRD uses **GitHub Actions cron** for scheduled jobs.

Use the same approach.

Example architecture:

```text
GitHub Actions
      ↓
Scheduled request
      ↓
/api/risk/check-all
      ↓
Fetch monitored farmers
      ↓
Calculate risk
      ↓
Detect threshold crossing
      ↓
Notification Service
      ↓
SMS
```

A practical demo schedule could be:

```text
Every 6 hours
```

For the hackathon, you can also run the job manually to demonstrate the alert immediately.

---

# 18. Recommended Internal Endpoint

Add a protected backend endpoint:

```text
POST /api/risk/check-all
```

Purpose:

```text
1. Fetch monitored farmers
2. Gather latest available signals
3. Calculate risk
4. Store RiskScore
5. Detect threshold crossing
6. Trigger notifications
```

This endpoint should be protected.

Do not make it publicly callable without authentication or a secret.

For a cron job, use a server-side secret such as:

```env
CRON_SECRET=...
```

Then:

```text
Authorization: Bearer <CRON_SECRET>
```

---

# 19. Existing `/api/notifications/emit`

The README already lists:

```text
POST /api/notifications/emit
```

Use this existing route as the central notification entry point where practical.

Recommended behavior:

```text
POST /api/notifications/emit
        ↓
Validate request
        ↓
Determine notification type
        ↓
Create DB notification
        ↓
Dispatch SMS if channel = SMS
        ↓
Return status
```

This avoids creating several competing notification systems.

---

# 20. Officer Notification

The same distress event should create two separate delivery paths:

```text
                    DISTRESS EVENT
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
        Farmer SMS               Officer Alert
              ↓                       ↓
        Farmer phone            Command Center
```

Example:

```text
Farmer:
"Your farm is at HIGH RISK (81/100)..."

Officer:
"Farmer Ramesh — HIGH RISK 81/100.
Primary factors: rainfall -35%, mandi price -22%.
Recommended action: contact farmer / schedule visit."
```

The farmer message should be simple.

The officer message can contain more technical information.

---

# 21. Complete SIH Demo Flow

Use this as the main hackathon demonstration.

## Step 1 — Farmer Profile

Create a demo farmer:

```text
Name: Ramesh
District: Mayurbhanj
Village: Demo Village
Language: Odia
Crop: Paddy
Land: 2.5 acres
Loan due: 8 days
```

## Step 2 — Simulate Monitoring Data

```text
Rainfall deviation: -35%
Soil moisture: LOW
NDVI: -18%
Mandi price: -22%
Loan due: 8 days
```

## Step 3 — Risk Engine

Calculate:

```text
81 / 100
HIGH RISK
```

## Step 4 — Trigger

The system sees:

```text
previous risk = 65
current risk  = 81
```

Therefore:

```text
Threshold crossed!
```

## Step 5 — Notification Service

Creates:

```text
notification.type = DISTRESS
notification.priority = HIGH
notification.channel = SMS
```

## Step 6 — SMS

Farmer receives:

```text
SmartCrop Alert:
Your farm risk is HIGH (81/100).
Low rainfall and falling mandi prices are contributing to the risk.
Please check today's advisory or contact your agriculture officer.
```

## Step 7 — Farmer Website

The same event appears at:

```text
/notifications
```

and:

```text
/risk-details
```

## Step 8 — Officer Dashboard

Officer sees:

```text
HIGH-RISK FARMERS

Ramesh
Mayurbhanj
Paddy
Risk: 81
Rainfall: High Risk
Market: High Risk
Loan: Medium Risk

[Call] [SMS] [Assign Visit]
```

This demonstrates the complete:

```text
DETECT → ALERT → EXPLAIN → INTERVENE
```

story to SIH judges.

---

# 22. Disaster Alert Flow

For disaster warnings, do not wait for the distress score.

```text
IMD / disaster source
        ↓
Warning for district
        ↓
Find farmers in affected region
        ↓
Check notification deduplication
        ↓
Translate template
        ↓
Send SMS
        ↓
Store delivery status
        ↓
Update officer dashboard
```

Example:

```text
SmartCrop Disaster Alert:
Heavy rainfall/flood conditions are expected in your area.
Please follow local safety instructions and protect farm equipment where possible.
```

Only include safety instructions that come from an authoritative source or your curated disaster rules.

---

# 23. SMS Delivery Status

Do not assume that:

```text
API request succeeded = farmer received SMS
```

There are different states:

```text
PENDING
   ↓
SENT
   ↓
DELIVERED
```

or:

```text
SENT
  ↓
FAILED
```

If the provider supports delivery webhooks, add:

```text
POST /api/notifications/webhook
```

The provider can call this endpoint when delivery status changes.

Example:

```text
SMS Provider
     ↓
DELIVERED
     ↓
/api/notifications/webhook
     ↓
notifications.status = DELIVERED
```

For the hackathon MVP, `SENT` status is enough if webhook setup becomes too time-consuming.

---

# 24. Failure Handling

SMS failure must not crash the risk engine.

Bad:

```text
SMS failed
   ↓
Risk calculation failed
   ↓
Entire pipeline stops
```

Correct:

```text
Risk calculated successfully
        ↓
Notification created
        ↓
SMS attempt
        ↓
SMS FAILED
        ↓
Record failure
        ↓
Officer still sees risk
```

The distress prediction system and notification delivery system should be loosely coupled.

---

# 25. Retry Strategy

For temporary provider failures:

```text
Attempt 1 → failed
     ↓
retry
     ↓
Attempt 2 → failed
     ↓
retry
     ↓
Attempt 3 → failed
     ↓
FAILED
```

Do not retry indefinitely.

Recommended:

```text
Maximum retries = 3
```

Store:

```text
retry_count
last_error
last_attempt_at
```

if your existing notification table supports it.

---

# 26. Security

The notification service is sensitive because it can send messages to real people.

Apply the following:

### Never expose provider API keys

```text
MSG91_AUTH_KEY
EXOTEL_API_KEY
TWILIO_AUTH_TOKEN
```

must be server-side only.

### Protect internal endpoints

```text
/api/risk/check-all
/api/notifications/emit
/api/notifications/webhook
```

must have appropriate authentication/secret validation.

### RBAC

The existing project already uses role-based access control.

Farmers:

```text
Can see their notifications
```

Officers:

```text
Can see alerts for their jurisdiction
Can manually send authorized alerts
```

Admins:

```text
Can manage notification configuration
```

---

# 27. Do Not Let the LLM Trigger SMS Directly

Avoid:

```text
AI says something is dangerous
        ↓
SMS
```

Instead:

```text
Verified data
     ↓
Risk / disaster rule
     ↓
Structured alert event
     ↓
Notification service
     ↓
SMS
```

The LLM/Sarvam layer can help with:

```text
Translation
Plain-language explanation
Voice generation
```

But it should not independently decide:

```text
"Send an emergency alert."
```

This follows the project's core safety and explainability principle.

---

# 28. Suggested Notification Event Object

Internally, use a structured event:

```ts
type NotificationEvent = {
  farmerId: string;
  type:
    | "DISTRESS"
    | "DISASTER"
    | "WEATHER"
    | "MARKET"
    | "LOAN";

  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

  score?: number;

  reasons: string[];

  language: string;

  channel: "SMS" | "IN_APP" | "VOICE";

  metadata?: Record<string, unknown>;
};
```

This keeps the system extensible.

Later the same event can support:

```text
SMS
Voice
Push
In-app
Officer dashboard
```

without changing the risk engine.

---

# 29. API Design

Recommended APIs:

| Endpoint | Purpose |
|---|---|
| `GET /api/notifications` | Farmer retrieves notification history |
| `POST /api/notifications/emit` | Create/send a notification |
| `POST /api/notifications/read-all` | Mark in-app notifications read |
| `POST /api/risk/check-all` | Scheduled distress evaluation |
| `POST /api/notifications/webhook` | Provider delivery status |
| `POST /api/disaster/check` | Process disaster warnings |

The README already contains the first three notification endpoints, so build on that structure rather than replacing it.

---

# 30. Minimal MVP Implementation

Do NOT overbuild this for SIH.

Implement only:

```text
1. Farmer phone number
2. Farmer language
3. Risk score
4. Threshold detection
5. Notification DB record
6. One SMS provider
7. SMS template
8. Deduplication
9. Manual/demo trigger
10. Officer alert
```

This is enough to demonstrate the concept convincingly.

---

# 31. Stretch Features

Only implement these if the core flow works.

### Voice call

```text
Risk Engine
    ↓
Bhashini/Sarvam TTS
    ↓
Voice provider
    ↓
Farmer
```

### Multiple SMS providers

```text
Primary provider
      ↓
failure
      ↓
backup provider
```

### Push notifications

For smartphone users:

```text
SMS + Push
```

### Delivery analytics

```text
Sent
Delivered
Failed
Response rate
```

### Smart notification prioritization

Instead of sending every alert:

```text
CRITICAL → SMS + Voice + Officer
HIGH     → SMS + In-app + Officer
MEDIUM   → In-app
LOW      → In-app only
```

---

# 32. Recommended Development Order

Build in this exact order.

## Phase 1 — Database

Confirm the existing `notifications` table.

Add missing fields required for:

```text
channel
priority
status
provider
provider_message_id
risk_score
sent_at
```

Do not create duplicate tables if equivalent fields already exist.

## Phase 2 — SMS Provider

Create:

```text
lib/notifications/sms.ts
```

and test:

```text
sendSms(phone, message)
```

with one controlled phone number.

## Phase 3 — Templates

Create:

```text
lib/notifications/templates.ts
```

with:

```text
HIGH_RISK
CRITICAL_RISK
CYCLONE
FLOOD
HEATWAVE
```

## Phase 4 — Notification Service

Create:

```text
lib/notifications/service.ts
```

Connect:

```text
template
+
deduplication
+
SMS provider
+
database
```

## Phase 5 — Risk Trigger

Connect:

```text
/api/risk
```

to:

```text
notification service
```

when the threshold is crossed.

## Phase 6 — Cron

Connect GitHub Actions to:

```text
/api/risk/check-all
```

## Phase 7 — Demo

Use a synthetic farmer and simulate:

```text
65 → 81
```

Then show the SMS arriving.

---

# 33. What the Judges Should See

The strongest demo is NOT:

> "We have an SMS API."

The story should be:

> "Our platform continuously monitors the farmer's agricultural and financial signals. When those signals indicate increasing distress, our risk engine produces an explainable risk score. If the farmer crosses a danger threshold, the intervention engine automatically sends a localized SMS even if the farmer has no internet connection. At the same time, the agriculture officer receives the farmer in the high-risk queue."

Then demonstrate:

```text
Rainfall ↓
     +
Market price ↓
     +
Loan due soon
     ↓
Risk = 81/100
     ↓
Automatic trigger
     ↓
Localized SMS
     ↓
Officer alert
     ↓
Intervention
```

This is much closer to the PS-02 problem statement than presenting SMS as a standalone feature.

---

# 34. Final Architecture for the SIH Presentation

```text
                         SMARTCROP
                            │
              ┌─────────────┴─────────────┐
              │                           │
       Monitoring Layer             Farmer Profile
              │                           │
   ┌──────────┼──────────┐                │
   ↓          ↓          ↓                ↓
Weather     NDVI       Mandi           Loan Data
   │          │          │                │
   └──────────┼──────────┴────────────────┘
              ↓
       DISTRESS ENGINE
              ↓
      Explainable Score
          0 – 100
              ↓
       ┌──────┴──────┐
       │             │
    < 70          >= 70
       │             │
   Monitor       ALERT EVENT
                     │
             ┌───────┴────────┐
             ↓                ↓
        Farmer SMS       Officer Alert
             │                │
             ↓                ↓
       Farmer Phone      Command Center
             │
             ↓
       Recommended
          Action
             │
             ↓
        INTERVENTION
```

---

# 35. Final Recommendation

For the SIH MVP, keep the notification system **simple, deterministic, explainable and backend-driven**.

The ideal implementation is:

```text
Next.js API
    +
AWS RDS MySQL
    +
Existing Risk Engine
    +
Existing Notifications API
    +
Sarvam AI for language
    +
MSG91/Exotel for SMS
    +
GitHub Actions for scheduled checks
```

No separate SMS frontend is necessary.

The farmer's phone is the frontend for the SMS channel.

The website remains the detailed interface for:

```text
WHY am I at risk?
WHAT is happening?
WHAT should I do?
WHO can help me?
```

while SMS answers the most important low-bandwidth question:

```text
"Something is wrong. Please take action now."
```

---

## SIH MVP Success Criteria

The feature is complete when this single scenario works end-to-end:

```text
1. Farmer has a registered phone number.
2. Farmer has crop + location + language data.
3. Monitoring/risk data produces a score.
4. Score crosses 70.
5. Backend detects the threshold crossing.
6. Backend creates a notification record.
7. Backend generates the farmer's localized SMS.
8. SMS provider sends the message.
9. Farmer receives the SMS without opening SmartCrop.
10. Officer sees the same farmer in the high-risk queue.
11. Duplicate SMS is prevented on the next risk check.
```

That is the complete **MONITOR → DETECT → PREDICT → EXPLAIN → ALERT → INTERVENE** loop required for the hackathon.
