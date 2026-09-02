# 🌱 SmartCrop — Smart Crop Advisory & Farmer Distress Early-Warning System

[![Next.js](https://img.shields.io/badge/Next.js-16.3.2_(Turbopack)-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![AWS RDS](https://img.shields.io/badge/AWS-RDS_MySQL_8.0-orange?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/rds/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI_2.5-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Sarvam AI](https://img.shields.io/badge/Sarvam_AI-Indic_NLP_&_TTS-purple?style=flat-square)](https://www.sarvam.ai/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-v6.6-brightgreen?style=flat-square&logo=mapbox)](https://maplibre.org/)

**SmartCrop** is a multilingual, low-bandwidth crop advisory and farmer distress early-warning platform built for **Smart India Hackathon (SIH)** in direct response to **PS-02**.

> *"Treat this as two connected modules: an advisory engine (rainfall/soil/crop data in, plain-language recommendation out, in the farmer's language) and a distress-risk scorer (a simple weighted rule or small model combining 2-3 signals like erratic rainfall, price crash, and loan due dates)."*

Every feature in this README is presented as belonging to **Module 1 (Advisory Engine)**, **Module 2 (Distress-Risk Scorer)**, the shared data layer, or an explicitly-justified **Differentiator**. Anything that doesn't fit is in [Scope Notes](#-scope-notes).

---

## 📑 Table of Contents

- [Implementation Notes Compliance](#-implementation-notes-compliance)
- [Module 1: Advisory Engine](#-module-1-advisory-engine)
- [Module 2: Distress-Risk Scorer](#-module-2-distress-risk-scorer)
- [How the Two Modules Connect](#-how-the-two-modules-connect)
- [Differentiators (Within PS-02 Scope)](#-differentiators-within-ps-02-scope)
- [Farmer Portal](#-farmer-portal)
- [Agriculture Officer Portal](#-agriculture-officer-portal)
- [Multilingual System](#-multilingual-system)
- [Security & Authentication](#-security--authentication)
- [Application Routes](#-application-routes)
- [Backend REST API](#-backend-rest-api)
- [Technology Stack](#-technology-stack)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Verification & Testing](#-verification--testing)
- [Scope Notes](#-scope-notes)

---

## ✅ Implementation Notes Compliance

| Instruction | Requirement | Status in this build |
|---|---|---|
| "two connected modules" | Exactly two modules, sharing data | ✅ Advisory Engine + Distress-Risk Scorer, both read from the same `farms`/`crops`/`weather_observations`/`mandi_prices` tables |
| Advisory engine: "rainfall/soil/crop data in" | Three specific inputs | ✅ Weather API, soil type/moisture, crop stage data |
| Advisory engine: "plain-language recommendation out" | Prose recommendation, not raw numbers | ✅ AI Plain-Language Risk Diagnostics + agronomist chat output |
| Advisory engine: "in the farmer's language" | Localized, voice + text | ✅ Sarvam AI Indic TTS/STT + 22+ language client dictionaries — see [Differentiators](#-differentiators-within-ps-02-scope) |
| Distress scorer: "a simple weighted rule or small model" | Simple is explicitly acceptable | ⚠️ `risk_scores` (`rainfall_risk`, `market_risk`, `loan_risk`, `score`) is the correct simple-weighted-rule shape — keep the Gemini layer as the *explanation* of the score, not the scorer itself |
| Distress scorer: "combining 2-3 signals" | 2 or 3 signals, not more | ✅ Exactly 3: rainfall, market, loan |
| "erratic rainfall" | Deviation from expected, not raw reading | ⚠️ Confirm `rainfall_risk` is computed from deviation vs. forecast/seasonal norm |
| "price crash" | A price *drop*, not current price | ⚠️ Confirm `market_risk` is computed from decline vs. MSP/trend |
| "loan due dates" | Proximity to due date, not loan amount/origination | ✅ Farmer self-declares `loan_due_date` at onboarding — no bank integration needed, this is a self-reported data point like soil type or land area, and it's honestly the more realistic MVP version since real KCC/NABARD API access isn't available at hackathon stage |

---

## 🔧 Module 1: Advisory Engine

**Per the PS:** rainfall/soil/crop data in → plain-language recommendation out, in the farmer's language.

**Inputs:**
- Weather API (temperature, rainfall, forecast rainfall, humidity)
- Soil data (type, moisture — from `farms`/`crops` records)
- Crop data (variety, season, growth stage, sowing/harvest dates)

**Processing:**
- Autonomous Agentic Pipeline (`GET /api/agentic`) — ingests GPS + soil chemistry + weather deficit + mandi prices, synthesizes advisory
- Alternative Crop Recommendation (`POST /api/ai/alternative-crop`) — climate-resilient substitution suggestions (e.g. Groundnut, Finger Millet, Mustard) with water-saving and yield comparisons
- AI Plain-Language Risk Diagnostics (`POST /api/ai/risk-explanation`) — converts sensor data into farmer-readable text

**Output:**
- Plain-language recommendation delivered as **text + voice**, in the farmer's selected regional language, via the AI Agronomist Chat (`/ai-chat`, `POST /api/ai/chat`) and the Farmer Command Center (`/dashboard`)

---

## 📊 Module 2: Distress-Risk Scorer

**Per the PS:** a simple weighted rule or small model, combining 2–3 signals — erratic rainfall, price crash, loan due dates.

| Signal | What it should measure | Table / field |
|---|---|---|
| Erratic rainfall | Deviation of actual rainfall from expected/seasonal norm | `risk_scores.rainfall_risk`, sourced from `weather_observations` |
| Price crash | Mandi price decline vs. MSP or recent trend | `risk_scores.market_risk`, sourced from `mandi_prices` |
| Loan due-date proximity | Closeness of `loan_due_date` (farmer-declared) to today | `risk_scores.loan_risk`, sourced from `farmers.loan_due_date` |

**Weighting:** combine the three into a single `risk_scores.score` (0–100), e.g. `score = w1*rainfall_risk + w2*market_risk + w3*loan_risk`. Bands: High (>70) / Moderate (31–70) / Low (≤30).

**Output — "proactively flag farmers who may need govt./NGO intervention":**
- Officer Command Center (`/officer-dashboard`) — jurisdictional distress overview
- High-Risk Farmer Directory (`/officer-dashboard/farmers`) — filterable by score, block, crop, driver
- 10-Section Distress Analytics (`/officer-dashboard/analytics`) — trend, distribution, 3-signal breakdown, block-level heatmap across all 26 Mayurbhanj blocks, combined risk matrix, priority interventions
- Priority Actions — direct call, advisory dispatch, assign field visit — the literal "alert routing to local agri-officers" outcome

---

## 🔗 How the Two Modules Connect

The PS calls for "**two connected** modules," not two silos. They share:
- The same farm/crop/weather/market data tables (`farms`, `crops`, `weather_observations`, `mandi_prices`)
- The same farmer record (`farmers`, including self-declared `loan_due_date`)
- A farmer flagged High-risk by Module 2 sees a plain-language explanation of *why*, generated by Module 1's risk-explanation endpoint — the scorer's output feeds back into the advisory engine's language layer rather than being a disconnected number.

```
┌──────────────────────────┐        ┌──────────────────────────┐
│   MODULE 1: ADVISORY      │        │  MODULE 2: DISTRESS       │
│   ENGINE                  │        │  SCORER                   │
│                           │        │                           │
│ IN: weather API,          │◄──────►│ IN: rainfall deviation,   │
│     soil/crop data        │  shared│     price crash,          │
│                           │  data  │     loan due-date         │
│ OUT: plain-language        │        │     proximity             │
│      recommendation,      │        │ OUT: weighted score →     │
│      farmer's language    │        │      routed alert to      │
│                           │        │      local agri-officer   │
└──────────────────────────┘        └──────────────────────────┘
```

---

## 🌟 Differentiators (Within PS-02 Scope)

Each item below sits inside Module 1 or Module 2 — none of them is a new module or a different problem domain. They're depth, not scope creep.

| Differentiator | Why it's in-scope, not scope creep |
|---|---|
| **Voice-enabled AI Agronomist (Sarvam AI Indic TTS/STT)** | The PS's own wording is "voice + text, works on basic smartphones." This *is* the outcome — most teams will only ship text. |
| **Full 22+ Indic language support** | Same "in the farmer's language" clause, just implemented deeper than the minimum. |
| **MapLibre geospatial distress heatmap (26 Mayurbhanj blocks)** | A richer rendering of Module 2's output — still the same score, just visualized spatially for the officer. |
| **Multi-channel SMS + in-app notification pipeline** | This is the literal "alert routing to local agri-officers" outcome named in the PS. |
| **Government Schemes Hub** | The PS Background explicitly names "delayed government scheme access" as part of the farmer's problem — this hub answers a sentence that's actually in the PS. |
| **10-section distress analytics** | Deeper development of "predictive distress-risk score," still one module, not a new one. |

---

## 🧑‍🌾 Farmer Portal

- **Command Center (`/dashboard`)** — live telemetry feeding Module 1
- **AI Crop Voice Assistant (`/ai-chat`)** — Module 1 output, voice + text
- **Crop Health & Diagnostics (`/risk-details`)** — Module 2 output, farmer-facing
- **Phenology & Task Manager (`/crop-monitoring`, `/crop-details`)** — crop-stage input to Module 1
- **Alternative Crop Substitution (`/alternative-crop`)** — Module 1 output
- **Full Agronomic Production Guide (`/full-crop-guide`)** — supporting knowledge base
- **Live Mandi Rates (`/market`)** — market price input, also feeds Module 2's price-crash signal
- **Government Schemes Hub (`/schemes`, `/schemes/[schemeId]`)** — differentiator, addresses the Background's "delayed government scheme access" pain point
- **Farmer Profile (`/farmer-profile`)** — land, soil, language, and self-declared `loan_due_date`

## 🧑‍💼 Agriculture Officer Portal

- **Command Center (`/officer-dashboard`)** — Module 2 output at jurisdiction level
- **10-Section Distress Analytics (`/officer-dashboard/analytics`)** — full 3-signal breakdown, trend, heatmap, combined matrix
- **Geospatial Distress Map** — Module 2 output, spatially rendered, all 26 Mayurbhanj blocks
- **High-Risk Farmer Directory** — Module 2 output, filterable
- **Field Interventions & Advisory Dispatch** — the intervention/routing step the PS asks for
- **Officer Settings** — jurisdiction and alert-threshold configuration

---

## 🌐 Multilingual System

Directly serves Module 1's "in the farmer's language" requirement:
- Client UI dictionaries — instant rendering for navigation and labels, 22+ Indian languages
- Google Translate DOM layer — full-page fallback translation
- Sarvam AI Indic NLP — machine translation + text-to-speech for the advisory output itself

---

## 🛡️ Security & Authentication

| Path Prefix | Minimum Required Role | Unauthenticated | Unauthorized Role |
|---|---|---|---|
| `/dashboard`, `/farmer-profile`, `/crop-*`, `/risk-details` | `farmer` or `administrator` | Redirect to `/authentication` | Redirect to `/unauthorized` |
| `/officer-dashboard/*` | `officer` or `administrator` | Redirect to `/authentication` | Redirect to `/unauthorized` |
| `/admin/*` | `administrator` | Redirect to `/authentication` | Redirect to `/unauthorized` |

Signed JWTs (`smartcrop_token`), bcrypt password hashing, `HttpOnly`/`SameSite=Lax` session cookies.

---

## 🧭 Application Routes

```
/                          -> Landing & role discovery
/authentication            -> Sign in / registration
/onboarding                -> Farmer registration (land, soil, crop, loan_due_date)
/dashboard                 -> Farmer Command Center [Module 1]
/crop-monitoring           -> Crop lifecycle & soil health [Module 1 input]
/crop-details              -> Crop calendar & irrigation guide [Module 1 input]
/risk-details              -> Distress diagnostics [Module 2 output]
/recommended-actions       -> Advisory interventions [Module 1 output]
/alternative-crop          -> Crop substitution advisory [Module 1 output]
/full-crop-guide           -> Production handbook [Module 1 support]
/market                    -> Mandi rates & comparison [Module 1 + 2 input]
/schemes                   -> Government schemes hub [Differentiator]
/schemes/[schemeId]        -> Scheme details & eligibility
/ai-chat                   -> AI agronomist, voice + text [Module 1 output / Differentiator]
/farmer-profile            -> Farmer profile & land records
/notifications             -> Alert feed [Module 2 output]
/officer-dashboard         -> Officer command center [Module 2 output]
/officer-dashboard/analytics -> Distress analytics [Module 2 / Differentiator]
/officer-dashboard/map     -> Geospatial distress map [Module 2 / Differentiator]
/officer-dashboard/farmers -> High-risk farmer directory [Module 2]
/officer-dashboard/interventions -> Field interventions [Module 2 routing]
/officer-dashboard/settings -> Officer configuration
/admin/dashboard           -> Admin console (user approvals)
/unauthorized              -> Access denied view
```

---

## ⚡ Backend REST API

**Module 2 — Officer Analytics** (`/api/officer/analytics/*`): overview, distress-trend, risk-distribution, distress-factors, heatmap, weather-stress, market-stress, combined-risk, priority-interventions

**Module 1 — AI & NLP**: `POST /api/ai/chat`, `GET /api/agentic`, `POST /api/ai/alternative-crop`, `POST /api/ai/risk-explanation`, `POST /api/translate`, `POST /api/sarvam`

**Auth & Users**: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/profile`, `POST /api/users/[id]/approve`, `POST /api/users/[id]/reject`

**Notifications (Module 2 routing / Differentiator)**: `POST /api/notifications/emit`, `POST /api/notifications/sms`, `POST /api/risk/check-all`, `POST /api/disaster/check`

**Farmer Services (Module 1 data)**: `GET /api/farmer/dashboard`, `GET /api/farmer/risk`, `GET /api/farmer/recommendations`, `GET /api/farmer/[id]`, `POST /api/farmer/register`, `GET /api/geocode`

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16.3.2 (App Router / Turbopack), React 19.2.8 |
| Styling | Tailwind CSS v4, Framer Motion |
| Data Visualization | Recharts, MapLibre GL |
| AI & NLP | Google Gemini 2.5 Flash, Sarvam AI Indic NLP |
| Database | AWS RDS MySQL 8.0 |
| Authentication | Signed JWTs (HS256), bcryptjs |

---

## 🗄️ Database Schema

```sql
users (id, email, name, phone, username, password, role, account_status, profile_id, metadata, created_at)
farmers (id, user_id, name, phone, email, password_hash, district, village, state, land_area, soil_type, loan_amount, loan_due_date, language, created_at)
farms (id, farmer_id, name, latitude, longitude, area, soil_type, village, district, state, created_at)
crops (id, farm_id, farmer_id, name, variety, season, stage, sowing_date, harvest_date, health_status, created_at)
risk_scores (id, farm_id, farmer_id, rainfall_risk, market_risk, loan_risk, score, calculated_at, created_at)
crop_risk (id, crop_id, overall_risk, pest_risk, weather_risk, market_risk, soil_moisture_risk, risk_factors, recommendations, created_at)
mandi_prices (id, crop_name, market_name, district, state, modal_price, min_price, max_price, msp, recorded_at)
weather_observations (id, farm_id, district, temperature, rainfall, forecast_rainfall, humidity, recorded_at)
notifications (id, farmer_id, title, message, category, priority, is_read, source_feature, created_at)
officer_interventions (id, farmer_id, officer_id, type, notes, outcome, risk_level, status, scheduled_at, created_at)
```

`risk_scores` (`rainfall_risk`, `market_risk`, `loan_risk`, `score`) is the literal implementation of the PS's "simple weighted rule ... combining 2-3 signals." `farmers.loan_due_date` is farmer-declared at onboarding and retained only as a read-only input to `loan_risk` — no loan origination, underwriting, or disbursal tables exist in this schema.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18.18.0+ (v20+ recommended)
- npm / yarn / pnpm
- Git

### Installation
```bash
git clone https://github.com/Suguda-Thakur-Marndi/SIH.git
cd SIH
npm install
```

Create `.env.local` (see [Environment Variables](#-environment-variables)), then:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

Production build:
```bash
npm run build
npm run start
```

---

## 🔑 Environment Variables

```ini
# AWS RDS MySQL
DB_HOST=your_rds_host
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_rds_password
DB_NAME=sih

# Auth
JWT_SECRET=your_jwt_secret_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key
SARVAM_API_KEY=your_sarvam_api_key

# SMS Gateway (optional, already implemented)
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_msg91_template_id
MSG91_SENDER_ID=SMARTC

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Verification & Testing

```bash
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript typecheck
npm run build       # Production build
```

---

## 📌 Scope Notes

**Removed — belong to a different problem domain, not PS-02:**
- Custom Hiring Center (CHC) equipment rental marketplace
- Bank & Insurance Institutional Portal (loan facility creation, underwriting, KCC disbursal)
- PMFBY crop insurance policy/claims
- Government machinery pool / CHC allocation
- `bank_partner` RBAC role
- `loans`, `financial_facilities`, `equipment` DB tables (the loan **signal** field stayed on `farmers`/`risk_scores` — only the loan **transaction** tables were dropped, since the PS asks for loan due-date *proximity as a distress signal*, not loan management)

**Worth re-checking against the Implementation Notes specifically:**
- Verify the actual `score` calculation in code is a transparent weighted formula (e.g. `score = w1*rainfall_risk + w2*market_risk + w3*loan_risk`) rather than something opaque — this is explicitly what the PS wants and the easiest thing to explain to judges in two sentences.
- Confirm `rainfall_risk` measures **deviation/erraticness**, not raw rainfall amount.
- Confirm `market_risk` measures a **decline/crash**, not the current price level.

**Kept as supporting infrastructure, not a PS-02 deliverable:**
- Admin console (`/admin/dashboard`)
- Government macro overview (lightweight, read-only)

**Still a gap — explicitly named in the PS, not yet addressed:**
- Low-bandwidth optimization and confirmed basic-smartphone support — neither implemented nor documented anywhere in the current build. This is worth building over cutting more text, since it's the one outcome most competing teams won't bother with.
