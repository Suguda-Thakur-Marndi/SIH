# SmartCrop SMS & AI Notification Engine

This directory contains the production-ready SMS notification subsystem for the SmartCrop platform. It integrates a local MySQL database with Gemini AI and Fast2SMS to provide highly tailored, automated distress alerts to farmers.

## Architecture

The SMS engine operates on three main pillars:
1. **Database Integration (`lib/db.ts`)**: Connects to the primary MySQL database to fetch registered `farmer_profiles`, their `risk_scores`, and registered `Agriculture Officers` (users with role `administrator`).
2. **AI Engine (`ai_distress_agent.ts`)**: When a farm hits a critical distress threshold (>= 85/100), the system pulls the specific risk vectors (weather, disease, soil, market) and sends them to the Gemini AI (`lib/gemini.ts`). The AI formulates a clean, 160-character summary of the problem and the recommended action.
3. **Dual SMS Dispatcher (`lib/notifications/sms.ts`)**: Uses the Fast2SMS Quick Route API to instantly deliver the AI-generated message to the farmer's registered phone number. Simultaneously, it constructs a secondary SMS detailing the farmer's distress issue and contact number, and dispatches it to all active Agriculture Officers in the district for rapid escalation.

## Key Files

- `ai_distress_agent.ts`: The primary AI worker script. It queries the DB for distress scores >= 85, invokes Gemini for message formulation, and dispatches the SMS.
- `check_and_send_db_distress.ts`: A secondary worker script that uses deterministic logic (instead of AI) to identify the highest risk factor and send a pre-formatted SMS.
- `lib/notifications/sms.ts`: Contains the Fast2SMS API integration and logging logic.
- `lib/notifications/rules.ts`: Fallback local risk rules (used when DB is offline for testing).

## Important Security Changes

> [!WARNING]
> **No Mock/Test Numbers:** As of the latest update, all hardcoded test phone numbers (e.g., `8004252399`) have been strictly removed from this repository to prevent accidental SMS spam.

The engine will **ONLY** send SMS messages to phone numbers that are actively registered in the `farmer_profiles` or `users` table in your MySQL database. If the database is empty or unreachable, the scripts will intentionally exit without sending any messages.

## How to Run the AI Distress Agent

You can trigger the AI SMS check manually from the terminal (ensure your database is running and `.env.local` is configured with `GEMINI_API_KEY` and `FAST2SMS_API_KEY`):

```powershell
$env:TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS"}'; npx ts-node SMS/SMS/ai_distress_agent.ts
```

### Automated Scheduling
In a production environment, you should hook this script up to a Cron Job, a Vercel scheduled function, or a GitHub Action to run automatically every day at 8:00 AM or 6:00 PM.

## How the AI Generates the Message
1. The script fetches the farmer's `overall_score`, `weather_risk`, `pest_risk`, `soil_risk`, and `market_risk`.
2. It sends this context to Gemini with strict guidelines:
   - Must start with "SmartCrop Notice:"
   - Must be under 160 characters to fit in a single SMS.
   - Must not use spam-flagged words (e.g., "Urgent", "Loan", "Critical Alert").
3. Gemini returns a tailored response like: *"SmartCrop Notice: Farm distress index level is 88 of 100. High weather risk detected due to drought conditions. Please check your SmartCrop app."*
4. Fast2SMS delivers this to the registered farmer's phone.
