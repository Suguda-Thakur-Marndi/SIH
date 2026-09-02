# 🌱 SmartCrop — Database Storage & SMS Alert Flow

This document explains **how SmartCrop stores data in AWS RDS MySQL** (farmers, crops, weather, mandi prices, loans, risk scores) and **how that stored data automatically triggers an SMS** to the farmer's registered mobile number via **Fast2SMS (primary)** with **MSG91 (fallback)**.

Source: `1788356390351_database_schema.sql` (AWS RDS MySQL 8.0, database `sih`) and `README.md`.

---

## 1. How Data Is Stored

### 1.1 `farmers` — the anchor record

Every alert ultimately resolves to a row in `farmers`. This is where the **phone number** and **language** live — the two fields the SMS pipeline needs.

| Column | Type | Purpose |
|---|---|---|
| `id` | varchar(30) | Primary key, referenced by almost every other table |
| `name` | varchar(150) | Farmer's name |
| `phone` | varchar(15) **UNIQUE** | Destination number for SMS dispatch |
| `district`, `village`, `state` | varchar | Location, used for district-level disaster warnings |
| `language` | varchar(30) | Determines which `sms_templates` row is used |
| `land_area` | decimal(6,2) | Farm size |
| `loan_amount`, `loan_due_date` | decimal / date | Feeds the Loan-Risk signal |
| `sms_alerts_enabled` | tinyint(1), default `1` | **Kill switch** — if `0`, no SMS is sent to this farmer regardless of risk |

> Because `phone` is `UNIQUE`, one farmer = one mobile number = one SMS destination.

### 1.2 Data that *feeds* the alert decision

These tables hold the raw signals ("crop, weather, etc.") that get evaluated:

| Table | Key columns | Feeds |
|---|---|---|
| `weather_observations` | `farm_id`, `temperature`, `rainfall`, `humidity`, `forecast_rainfall`, `recorded_at` | Rainfall-deficit signal (40% weight) |
| `crops` | `farmer_id`, `name`, `stage`, `sowing_date` | Crop phenology context |
| `mandi_prices` | `crop_id`, `district`, `modal_price`, `price`, `msp`, `price_date` | Market/price-crash signal (35% weight) |
| `loans` | `farmer_id`, `outstanding_amount`, `due_date`, `status` | Loan-proximity signal (25% weight) |
| `disaster_warnings` | `district`, `warning_type` (`CYCLONE`/`FLOOD`/`HEATWAVE`/`EXTREME_RAINFALL`), `message`, `processed_at` | Emergency override alerts |

### 1.3 Computed risk

| Table | Key columns | Purpose |
|---|---|---|
| `crop_risk` | `farmer_id`, `crop_id`, `risk_score`, `risk_level`, `weather_score`, `soil_score`, `crop_health_score`, `market_score`, `financial_score` | Per-crop composite score |
| `risk_scores` | `farmer_id`, `score`, `rainfall_risk`, `market_risk`, `loan_risk`, `reasons` (json) | The **3-signal distress index** used for SMS-trigger thresholds |
| `risk_history` | `farmer_id`, `crop_id`, `risk_score`, `calculated_at` | Historical trend, powers the 7-day velocity projection |

### 1.4 The notification / SMS ledger

The **`notifications`** table is the single source of truth for every alert ever sent, in-app or SMS:

| Column | Type | Purpose |
|---|---|---|
| `id`, `farmer_id`, `user_id` | varchar(30) | Who the alert belongs to |
| `type`, `category` | varchar(50) | e.g. `DISTRESS_ALERT`, `WEATHER`, `PRICE_CRASH`, `LOAN_DUE`, `DISASTER` |
| `priority` | enum(`critical`,`warning`,`info`) | Drives urgency + which risk band triggered it |
| `title`, `message`, `voice_text` | text | Localized advisory content |
| `language` | varchar(10) | Which language the message was rendered in |
| `channel` | enum(`SMS`,`IN_APP`,`VOICE`,`PUSH`), default `IN_APP` | Set to `SMS` for dispatch rows |
| `status` | enum(`PENDING`,`SENT`,`DELIVERED`,`FAILED`), default `PENDING` | Dispatch lifecycle |
| `provider` | varchar(50) | `fast2sms` or `msg91` — whichever actually sent it |
| `provider_message_id` | varchar(100) | Gateway's own message ID, for delivery tracking |
| `risk_score`, `reason` | tinyint / text | The score + human-readable reason that triggered this alert |
| `retry_count`, `last_error` | tinyint / text | Fast2SMS→MSG91 fallback bookkeeping |
| `sent_at`, `delivered_at`, `failed_at` | timestamp | Full audit trail |

### 1.5 `sms_templates` — localized message bodies

```sql
CREATE TABLE sms_templates (
  id varchar(30) NOT NULL,
  template_key varchar(50) NOT NULL,      -- e.g. 'RAINFALL_ALERT', 'PRICE_CRASH', 'LOAN_DUE'
  language enum('en','hi','od') NOT NULL, -- English, Hindi, Odia
  body text NOT NULL,                     -- <=160 char template with placeholders
  updated_at timestamp ...,
  PRIMARY KEY (id),
  UNIQUE KEY uq_template_lang (template_key, language)
);
```

One `template_key` has one row per language — the dispatcher looks up `(template_key, farmers.language)` to pick the right text.

---

## 2. End-to-End Flow: Data Change → SMS on Phone

```
 ┌──────────────────────┐
 │  New data lands in:   │   weather_observations / mandi_prices / loans / disaster_warnings
 └──────────┬────────────┘
            │
            ▼
 ┌──────────────────────────────────────────────┐
 │ POST /api/risk/check-all  (scheduled cron)     │
 │  - reads latest weather, mandi, loan rows      │
 │  - computes: 0.40×rainfall + 0.35×market       │
 │              + 0.25×loan  →  risk_scores        │
 │  - writes crop_risk + risk_scores + risk_history│
 └──────────┬───────────────────────────────────┘
            │  score crosses a threshold band
            │  (71–85 HIGH, 86–100 CRITICAL)
            ▼
 ┌──────────────────────────────────────────────┐
 │ POST /api/notifications/emit                    │
 │  - looks up farmer.language + sms_alerts_enabled │
 │  - picks matching sms_templates row              │
 │  - INSERTs a `notifications` row:                │
 │      channel = 'SMS', status = 'PENDING'         │
 └──────────┬───────────────────────────────────┘
            │
            ▼
 ┌──────────────────────────────────────────────┐
 │ POST /api/notifications/sms                    │
 │  - reads farmers.phone                          │
 │  - SMS_PROVIDER=fast2sms → tries Fast2SMS first  │
 │      (route=dlt, sender_id, entity_id,           │
 │       dlt_template_id)                           │
 │  - on failure → falls back to MSG91              │
 │  - UPDATEs notifications:                        │
 │      status='SENT', provider='fast2sms'|'msg91', │
 │      provider_message_id, sent_at                │
 │  - on total failure → status='FAILED',           │
 │      last_error, failed_at, retry_count++         │
 └──────────┬───────────────────────────────────┘
            │
            ▼
   📱  SMS arrives on farmer's registered `phone`
       in their stored `language`, ≤160 chars,
       e.g. "Rainfall deficit 42% this week for
       your Paddy crop. Irrigate within 48h. — SmartCrop"
```

### 2.1 What actually triggers a message

| Trigger source | Table read | Condition | `notifications.type` |
|---|---|---|---|
| Rainfall deficit | `weather_observations` | 14-day rainfall anomaly crosses threshold | `WEATHER_ALERT` |
| Irrigation window | `weather_observations` + `crops.stage` | 48h forecast vs. soil moisture mismatch | `IRRIGATION_ADVISORY` |
| Price crash | `mandi_prices` | modal price falls below MSP by X% | `PRICE_CRASH` |
| Loan due date | `farmers.loan_due_date` / `loans.due_date` | days-remaining enters warning window | `LOAN_DUE` |
| Composite distress | `risk_scores.score` | score ≥ 71 (HIGH) or ≥ 86 (CRITICAL) | `DISTRESS_ALERT` |
| Officer manual dispatch | Officer clicks "1-click SMS" in `/officer-dashboard/farmers` | — | `OFFICER_ADVISORY` |
| Natural calamity | `disaster_warnings` | new row for farmer's `district` | `DISASTER` (always `critical`, bypasses normal thresholds) |

### 2.2 Why the farmer *doesn't* get spammed

- `notifications` has `idx_dedup` on `(farmer_id, type, priority, created_at)` — the emit endpoint checks this before inserting, so the same alert type isn't re-sent within a cooldown window.
- `farmers.sms_alerts_enabled = 0` is checked before every SMS dispatch — a hard opt-out.
- `retry_count` caps automatic retries so a permanently-invalid number doesn't loop forever.

---

## 3. Minimal Column Set an SMS Dispatch Needs

To send one SMS, the pipeline only needs to join three tables:

```sql
SELECT f.phone, f.language, n.message, n.id AS notification_id
FROM notifications n
JOIN farmers f ON f.id = n.farmer_id
WHERE n.channel = 'SMS'
  AND n.status = 'PENDING'
  AND f.sms_alerts_enabled = 1;
```

Then, after calling Fast2SMS/MSG91:

```sql
UPDATE notifications
SET status = 'SENT',
    provider = 'fast2sms',
    provider_message_id = ?,
    sent_at = NOW()
WHERE id = ?;
```

---

## 4. Summary

- **Storage**: raw signals (`weather_observations`, `mandi_prices`, `loans`, `disaster_warnings`) → computed risk (`crop_risk`, `risk_scores`, `risk_history`) → alert record (`notifications`) → localized text (`sms_templates`).
- **Delivery**: `notifications.channel='SMS'` + `farmers.phone` + `farmers.language` → Fast2SMS (DLT route, primary) → MSG91 (fallback) → `notifications.status` updated to `SENT`/`FAILED` with full audit trail.
- **Trigger surface**: any INSERT/UPDATE to weather, mandi price, loan, or disaster data can move `risk_scores.score` across a threshold, which is what actually fires the SMS — not the raw data itself.
