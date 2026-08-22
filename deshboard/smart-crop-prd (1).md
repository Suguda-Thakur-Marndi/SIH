# Product Requirements Document
## Smart Crop — Advisory & Farmer Distress Early-Warning Platform

**PS ID:** PS-02 | **Category:** Software | **Theme:** Agriculture, FoodTech & Rural Development
**Version:** 1.0 | **Status:** Draft (Hackathon Build)

---

## 1. Problem Statement

Farmers often lack timely, localized advisory on crop health, weather risk, and market prices — leading to crop loss, debt distress, and delayed government scheme access. Existing tools are either too generic (not hyperlocal) or too fragmented (weather app ≠ market app ≠ scheme portal), so at-risk farmers fall through the cracks until it's too late for intervention.

## 2. Product Positioning

> **Not:** "A platform with crop monitoring + crop recommendation + equipment rental + insurance + schemes."
> **Is:** **An early-warning and intervention platform for agricultural distress.**

The system doesn't just tell farmers what is happening — it detects who is heading toward distress, explains why, predicts what may happen next, and connects them to the right intervention before the situation becomes severe.

**Core loop:**
```
MONITOR → DETECT → PREDICT → EXPLAIN → INTERVENE → PREVENT
```

Every feature below is framed as a **monitoring input** or an **intervention mechanism** feeding this loop — not a standalone module.

## 3. Goals & Success Metrics (Hackathon Demo)

| Goal | Metric |
|---|---|
| Prove hyperlocal advisory works | Advisory generated in farmer's language for a real district |
| Prove distress prediction is explainable | Risk score + top 3 contributing factors shown clearly |
| Prove intervention loop closes | Officer receives alert → takes action on a high-risk farmer |
| Prove low-bandwidth accessibility | Voice + SMS delivery path demoed, not just app UI |

## 4. Users / Personas

| Persona | Need | Primary Surface |
|---|---|---|
| 👨‍🌾 **Farmer** | Know crop health, risk, and what to do today | Mobile app (Next.js PWA) |
| 🧑‍🌾 **Agriculture Officer** | Identify and reach high-risk farmers fast | Command Center dashboard |
| 🏦 **Bank / Insurer** | Register and track eligible farmers for crop insurance | Insurance dashboard |
| 🏛️ **Government** | Manage equipment inventory and scheme data | Government dashboard |

## 5. Core Features

Each feature is tagged **[Monitor]**, **[Predict]**, or **[Intervene]** to keep the distress loop explicit.

### 5.1 🌦️ Advisory Engine — `[Monitor]`
- Weather forecast & rainfall deviation (IMD / OpenWeatherMap)
- Soil health: pH, moisture, organic carbon (SoilGrids, Weatherbit)
- Crop health via NDVI trend (Sentinel Hub / satellite data)
- Plain-language advisory generated from rules, explained via LLM — **LLM never invents agronomic facts**
- Delivered as voice + text in the farmer's regional language

### 5.2 🚨 Distress Risk Engine — `[Predict]` (Centerpiece feature)
- Combines 3 core signals: rainfall deviation, market price drop, loan due-date proximity
- Weighted rule-based score (0–100) for hackathon MVP; ML model as stretch goal
- Full breakdown shown: which factor contributed how much, and why
- Risk trend over time (e.g. `60 → 67 → 72 → 81`)
- Score crossing threshold (>70) auto-triggers farmer alert + officer dashboard entry

### 5.3 🌱 Crop Recommendation — `[Intervene]`
- Suggested when current crop risk is high or farmer is planning next season
- Inputs: soil, weather, season, water availability, market trend, crop duration
- Output: ranked suitability score (e.g. Groundnut 88%, Maize 81%) with reasoning
- Each recommendation links directly to a full crop guide (below) — never just a crop name

### 5.4 📅 Crop Guide & Farming Calendar — `[Intervene]`
- Stage-by-stage plan: land prep → sowing → irrigation → nutrients → weeding → pest/disease → harvest
- Tied to actual sowing date to show "today's activity"
- Sourced from a curated knowledge base, not LLM-generated timing

### 5.5 💰 Mandi Price Comparison — `[Intervene]`
- Live prices across nearby mandis (AGMARKNET / data.gov.in / e-NAM)
- MSP comparison with % deviation
- Transport-adjusted net realization calculator
- "Best mandi to sell" recommendation

### 5.6 🌪️ Disaster Warning — `[Monitor]` + `[Intervene]`
- Cyclone / flood / heavy rain / heatwave alerts sourced from IMD warnings
- Pushed proactively via SMS/voice — does not wait for farmer to open the app
- Includes safety instructions specific to disaster type
- Officer dashboard shows affected-farmer count by area for coordinated response

### 5.7 🚜 Equipment Rental Marketplace — `[Intervene]`
- Browse government/farmer-owned equipment with distance and rate
- Booking calendar with availability conflict checks
- Simple booking → confirmation flow (payment mocked for demo)

### 5.8 🛡️ Insurance Registration — `[Intervene]`
- Eligibility check based on PMFBY-style public rules
- Registration flows into a bank/insurer approval queue
- Status tracking visible to farmer (Not Registered → Pending → Approved)
- Surfaced proactively when risk score is high, not buried in a menu

### 5.9 🏛️ Government Schemes — `[Intervene]`
- Curated scheme database (eligibility, required documents, apply link)
- Auto-matched to farmer profile (location, crop, land size, category)

### 5.10 🗣️ Multilingual Voice/Text Delivery — cross-cutting
- Bhashini for translation + TTS (2–3 languages for demo, e.g. English/Hindi/Odia)
- SMS/IVR fallback path for low-connectivity farmers — this is a first-class delivery channel, not an afterthought

### 5.11 👨‍🌾 Farmer Profile — data foundation
- Land, crop, sowing date, language, loan amount & due date
- Synthetic/demo data acceptable for hackathon

### 5.12 📊 Officer / Bank / Government Dashboards — `[Intervene]`
- Officer: risk-sorted farmer list, district map, one-click call/SMS/assign-visit
- Bank: insurance approval queue
- Government: equipment inventory + scheme database management

## 6. AI Components & Priority

| Component | Role | Priority |
|---|---|---:|
| **Distress Prediction** | Rule-based (hackathon) / ML (stretch) risk score | ⭐⭐⭐⭐⭐ |
| **Crop Recommendation** | Suitability ranking from soil/climate/market data | ⭐⭐⭐⭐ |
| **Crop Health Trend** | NDVI trend detection for abnormal decline | ⭐⭐⭐⭐ |
| **LLM Advisory Explainer** | Turns verified data into farmer-friendly language | ⭐⭐⭐ |
| **Farmer AI Assistant** | Answers "why is my risk high / what should I do" from live data | ⭐⭐⭐ |

**Principle:** Data tells us what is happening. AI predicts what may happen next. The intervention engine decides what action to take. The LLM explains — it never decides agronomic or financial facts on its own.

## 7. Tech Stack

| Layer | Tech | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router) + TypeScript** | Unified frontend + backend via Route Handlers |
| Styling | **TailwindCSS** | |
| Forms/validation | **React Hook Form + Zod** | Type-safe end to end |
| State | **Zustand** | Lightweight |
| Charts | **Recharts** | Risk breakdown, NDVI trend, price comparison |
| Auth | **Supabase Auth** (phone/OTP) | Farmers login by phone, not email |
| ORM | **Prisma** | Type-safe schema → client generation |
| Database | **PostgreSQL (Supabase or Neon)** | Free tier |
| Cache | **Upstash Redis** | Cache weather/mandi responses, cut API calls |
| File storage | **Supabase Storage** | Equipment photos, farmer docs |
| ML microservice (optional) | **Python + FastAPI + scikit-learn** | Only if going beyond rule-based risk scoring |
| App hosting / deployment | **AWS Amplify Hosting** (+ CloudFront CDN) | Native Next.js SSR support; free tier: 1,000 build min + 15GB served/mo — this is the only AWS piece in the stack |
| Scheduled jobs | **GitHub Actions (cron)** | Daily weather/mandi data refresh — host-agnostic, doesn't depend on Amplify |
| Translation/TTS | **Bhashini** | Free, India-specific |
| SMS/Voice | **Twilio / MSG91 / Exotel** | Trial credits for demo |
| Geocoding | **OpenStreetMap + Nominatim** | Free, no key |

> **Note:** AWS (Amplify + CloudFront) is used only for app deployment/hosting. Database, auth, cache, and storage stay on Supabase/Upstash's free tiers, which are perpetual rather than the 12-month AWS free-tier window.

## 8. System Architecture

```
                         👨‍🌾 FARMER
                              │
                     ┌────────┴────────┐
                     │  Next.js (TS)   │  ← AWS Amplify Hosting
                     │  App + API      │     (+ CloudFront CDN)
                     └────────┬────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ↓                                           ↓
┌──────────────────┐                       ┌──────────────────┐
│ DATA & MONITORING│                       │  DISTRESS ENGINE │
│ Weather / Soil /  │──────────────────────→│  Risk Score      │
│ NDVI / Mandi /    │                       │  + Explanation    │
│ Farmer Profile     │                       └────────┬─────────┘
└──────────────────┘                                 ↓
                                            ┌────────────────────┐
                                            │   INTERVENTION      │
                                            │  Advisory │ CropRec │
                                            │  Market   │ Rental  │
                                            │  Insurance│ Schemes │
                                            └────────┬────────────┘
                                                     ↓
                                    Farmer Alert (SMS/Voice/Push)
                                                     +
                                       Officer / Bank Dashboard
```

**Data flow:** external APIs → Route Handlers (`/app/api/*`) → Prisma → Supabase Postgres, with Upstash Redis caching hot reads (weather, mandi prices) to stay within free-tier rate limits. AWS Amplify + CloudFront handle deployment and delivery of the Next.js app itself.

## 9. Data Model (Prisma — core entities)

```prisma
model Farmer {
  id          String   @id @default(cuid())
  name        String
  phone       String   @unique
  district    String
  village     String
  language    String
  landArea    Float
  loanAmount  Float?
  loanDueDate DateTime?
  crops       Crop[]
  riskScores  RiskScore[]
  insurance   Insurance[]
  bookings    Booking[]
}

model Crop {
  id         String   @id @default(cuid())
  farmerId   String
  farmer     Farmer   @relation(fields: [farmerId], references: [id])
  name       String
  stage      String
  sowingDate DateTime
}

model RiskScore {
  id           String   @id @default(cuid())
  farmerId     String
  farmer       Farmer   @relation(fields: [farmerId], references: [id])
  score        Int
  rainfallRisk Int
  marketRisk   Int
  loanRisk     Int
  reasons      String[]
  createdAt    DateTime @default(now())
}

model MandiPrice {
  id         String   @id @default(cuid())
  crop       String
  mandi      String
  district   String
  modalPrice Float
  date       DateTime
}

model Equipment {
  id        String    @id @default(cuid())
  name      String
  ownerType String
  dailyRate Float
  available Boolean
  bookings  Booking[]
}

model Booking {
  id          String    @id @default(cuid())
  farmerId    String
  farmer      Farmer    @relation(fields: [farmerId], references: [id])
  equipmentId String
  equipment   Equipment @relation(fields: [equipmentId], references: [id])
  startDate   DateTime
  endDate     DateTime
  status      String
}

model Insurance {
  id       String @id @default(cuid())
  farmerId String
  farmer   Farmer @relation(fields: [farmerId], references: [id])
  crop     String
  status   String
}

model Scheme {
  id            String @id @default(cuid())
  name          String
  state         String
  eligibility   String
  documents     String[]
  applicationUrl String
}
```

## 10. API Surface (Route Handlers)

| Route | Purpose |
|---|---|
| `/api/weather` | Rainfall, forecast, warnings (IMD/OpenWeatherMap) |
| `/api/soil` | pH, moisture, organic carbon (SoilGrids/Weatherbit) |
| `/api/ndvi` | Crop health trend |
| `/api/mandi` | Live prices, MSP comparison |
| `/api/risk` | Compute + fetch distress score |
| `/api/croprec` | Crop suitability recommendations |
| `/api/rental` | Equipment listing + booking |
| `/api/insurance` | Eligibility + registration |
| `/api/schemes` | Scheme matching |
| `/api/notify` | SMS/voice/push dispatch |
| `/api/disaster` | Cyclone/flood/heatwave warnings |

## 11. Information Architecture (Page Structure)

### Farmer
```
LOGIN → 🏠 DASHBOARD
  ├── 🚨 Risk Details → Recommended Actions
  ├── 📊 Crop Monitoring (Weather / Soil / NDVI)
  ├── 🌱 My Crop → Farming Calendar → Crop Guide
  ├── 🌱 Alternative Crops → Crop Guide
  ├── 💰 Market → Mandi Comparison
  └── MORE
       ├── 🚜 Equipment Rental
       ├── 🛡️ Insurance
       ├── 🏛️ Government Schemes
       ├── 🌪️ Disaster Alerts
       ├── 🔔 Notifications
       └── 👤 Profile
```

### Officer
```
LOGIN → 🚨 COMMAND CENTER
  ├── High-Risk Farmers → Farmer Details
  ├── 🗺️ Distress Map
  ├── 📊 Analytics
  └── 🔔 Intervention / Alerts
```

### Government / Bank
```
LOGIN → DASHBOARD
  ├── Equipment (Inventory / Rentals)
  ├── Farmers (Registered / Requests)
  ├── Schemes
  └── Insurance (Registration Queue / Status)
```

**Priority screens for demo:** Farmer Dashboard → Crop Monitoring → Risk Explanation → Crop Intervention → Officer Command Center. These five tell the full story end to end.

## 12. Non-Functional Requirements

- **Low bandwidth first:** SMS/IVR/voice must work without a smartphone data connection
- **Explainability:** every risk score must show its contributing factors — no black-box output
- **Data integrity:** agronomic/financial facts (fertilizer amounts, MSP, crop timing) come from curated data or rules, never from LLM generation
- **Cost:** entire stack must run on free tiers for demo/prototype

## 13. Hackathon MVP Scope

**Core (~70% effort):** Weather + Soil + NDVI monitoring, Distress Risk Engine with explanation, Farmer alerts, Officer Command Center.

**Intervention (~30% effort):** Alternative crop recommendation, crop calendar, mandi/net-realization comparison, one equipment-rental flow, one insurance flow, scheme matching.

**Out of scope for demo:** Full payment processing, live IVR call infrastructure (SMS + mocked voice script acceptable), production-grade ML model (rule-based scoring is sufficient and more explainable to judges).

## 14. Demo Narrative

1. Farmer profile: Paddy, Mayurbhanj, 2.5 acres, Odia, loan due in 8 days
2. System pulls: rainfall ↓35%, soil moisture low, NDVI ↓18%, price ↓22%
3. Distress Engine outputs: **81/100 🔴 HIGH RISK** with full breakdown
4. Farmer receives voice/SMS alert in Odia + sees "why" and "what to do today"
5. System suggests Groundnut (88% suitable) with full farming plan
6. Officer Command Center shows Ramesh in the high-risk queue → calls/SMS/assigns field visit
7. Bank dashboard shows Ramesh flagged for insurance registration follow-up
