# 🌱 SmartCrop — AI‑Powered Smart Agriculture & Agri‑FinTech Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-16.3.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![AWS RDS](https://img.shields.io/badge/AWS-RDS_MySQL-orange?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/rds/)
[![Sarvam AI](https://img.shields.io/badge/Sarvam_AI-Indic_NLP-purple?style=flat-square)](https://www.sarvam.ai/)

**SmartCrop** is an enterprise‑grade agricultural intelligence, climate‑risk mitigation, farm‑credit enablement, and government monitoring ecosystem built for the **Smart India Hackathon (SIH)**. The platform bridges the gap between **Smallholder Farmers**, **Agriculture Extension Officers**, **Institutional Banks / Insurers**, and **Government Policy Makers**.

---

## 📑 Table of Contents
- [Core Value Proposition & User Roles](#core-value-proposition--user-roles)
- [Security, Middleware & Authentication Architecture](#security-middleware--authentication-architecture)
- [Multilingual & AI Engine (Sarvam AI)](#multilingual--ai-engine-sarvam-ai)
- [Application Routes & Navigation Directory](#application-routes--navigation-directory)
- [Backend REST API Endpoints](#backend-rest-api-endpoints)
- [SMS Mock & Notification System](#sms-mock--notification-system)
- [System Architecture & Technology Stack](#system-architecture--technology-stack)
- [Database Schema (AWS RDS MySQL)](#database-schema-aws-rds-mysql)
- [Folder & Directory Structure](#folder--directory-structure)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Environment Variables Configuration](#environment-variables-configuration)
- [Verification & Quality Assurance](#verification--quality-assurance)
- [Contributing & Acknowledgements](#contributing--acknowledgements)

---

## 🎯 Core Value Proposition & User Roles

### 🧑‍🌾 1. Farmer Portal
- Real‑time farm dashboard (weather, soil telemetry, crop lifecycle)
- AI‑driven risk scoring & prescriptive mitigation
- Crop monitoring calendar, alternative‑crop recommendations, live mandi rates
- Custom Hiring Center (CHC) equipment marketplace & booking engine
- Financial facilities (KCC loans, subvention calculator) & insurance (PMFBY)
- Farmer profile management (land parcels, soil health cards)

### 🧑‍💼 2. Agriculture Extension Officer Portal
- District‑wide distress heatmap & high‑risk farmer triage
- Assigned farmer directory with geo‑tagging
- Field inspection scheduling, emergency advisories, relief fund triggers

### 🏦 3. Bank & Insurance Partner Portal
- Credit facility creation, publishing, status toggling
- Loan application pipeline, underwriting metrics, policy tracking
- Real‑time portfolio analytics & verification dashboard

### 🏛️ 4. Government & Administrative Console
- Macro analytics (state/district crop distribution, yield forecasts)
- CHC equipment allocation & DBT subsidy auditing
- Scheme impact assessment and direct benefit transfer monitoring

---

## 🛡️ Security, Middleware & Authentication Architecture

- **RBAC** enforced via Next.js proxy middleware (`proxy.ts`).
- **Dual‑cookie + JWT** session management (`smartcrop_token`, `smartcrop_session`).
- Protected routes redirect unauthenticated users to `/authentication` and unauthorized users to `/unauthorized`.
- API routes validate JWT and role before processing.

---

## 🌐 Multilingual & AI Engine (Sarvam AI)
- Support for 22 Indian languages via Sarvam AI REST gateway.
- Endpoints: `/api/translate`, `/api/sarvam` (text‑to‑speech & translation).
- All UI strings are externalized to `lib/language-context.tsx` for easy locale switching.

---

## 🗺️ Application Routes & Navigation Directory
*(Only the most important routes are listed; full list can be found in `app/` folder)*

### Public & Discovery
| Route | Description |
| :--- | :--- |
| `/` | Landing page – product overview |
| `/authentication` | Sign‑in / registration with role picker |
| `/market` | Live APMC mandi commodity prices |
| `/schemes` | Government subsidy directory |
| `/full-crop-guide` | End‑to‑end agronomic guide |
| `/alternative-crop` | AI‑driven climate‑resilient crop suggestions |
| `/ai-chat` | Multilingual conversational agronomist |

### Farmer Portal (requires `farmer` or `administrator`)
| Route | Description |
| :--- | :--- |
| `/dashboard` | Central telemetry & risk index |
| `/farmer-profile` | Profile, land parcels, logout |
| `/crop-monitoring` | Satellite NDVI & soil metrics |
| `/crop-details` | Stage timeline & irrigation needs |
| `/risk-details` | Pest / weather / soil distress scores |
| `/recommended-actions` | Prescriptive advisory steps |
| `/equipment` | CHC equipment catalogue & booking |
| `/financial-support` | KCC loan discovery & application |
| `/insurance` | PMFBY policy matching & claim tracking |
| `/notifications` | Real‑time alerts (weather, credit) |

### Officer & Government Portals (requires `administrator`)
| Route | Description |
| :--- | :--- |
| `/admin/dashboard` | District distress command centre |
| `/agriculture-officer-dashboard` | Field officer workspace |
| `/government/dashboard` | State‑level CHC analytics |
| `/bank-portal` | Bank partner landing |
| `/bank-portal/dashboard` | Credit portfolio overview |
| `/bank-portal/facilities` | Manage credit facilities |
| `/bank-portal/facilities/add` | New facility wizard |
| `/bank-portal/register` | Bank registration |

---

## 📨 SMS Mock & Notification System
### Mock SMS script (`mock_sms.js`)
```js
// Pure JS mock that prints a formatted distress SMS to the console.
```
Used for local development and testing of the SMS workflow.

### Test‑SMS API (`app/api/test-sms/route.ts`)
- Exposes a `GET` endpoint that triggers the mock SMS flow.
- Determines priority via `getRiskPriority` (see `SMS/notification/lib/notifications/rules.ts`).
- Sends the message through the same `sendSms` adapter used in production.

### Notification Rules (`SMS/notification/lib/notifications/rules.ts`)
- **Priority calculation** based on risk score.
- **Cooldown windows** per priority to avoid spamming (CRITICAL = 12 h, HIGH = 24 h, etc.).
- `hasRecentEquivalentAlert` checks the `notifications` table for recent alerts.

These additions enable developers to validate the end‑to‑end alert pipeline without provisioning a real SMS provider.

---

## ⚡ System Architecture & Technology Stack
```
┌─────────────────────────────────────────────────────────────────────┐
│ Frontend: Next.js 16 (Turbopack) + React 19 + Tailwind CSS v4      │
│ Motion & Micro‑interactions: Framer Motion                         │
│ Icons: Lucide, Recharts                                            │
└───────────────────────────────────┬─────────────────────────────┘
                                    │
                      (Next.js Proxy Middleware)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Backend: Edge / Node.js API Routes, JWT Auth, RBAC, Dual Cookies   │
│ Database: AWS RDS MySQL (connection pool via `lib/db.ts`)          │
│ AI Services: Sarvam AI (Indic NLP & TTS)                         │
│ BaaS / External: InsForge (optional realtime gateway)          │
└─────────────────────────────────────────────────────────────────────┘
```
- **Framework**: [Next.js 16.3.2](https://nextjs.org/)
- **UI**: [React 19](https://reactjs.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: AWS RDS MySQL (`mysql2/promise` pool)
- **AI**: Sarvam AI for translation & TTS
- **State Management**: Zustand + React Context

---

## 🗄️ Database Schema (AWS RDS MySQL)
Key tables (simplified):
- `users` – auth credentials, role (`farmer`, `administrator`, `bank`)
- `farmer_profiles` – land parcels, soil data, KYC
- `crops` – crop cycles, growth stage, health index
- `risk_scores` – multi‑factor risk metrics
- `financial_facilities` – loan products, subvention, interest rates
- `notifications` – SMS/Email alerts, priority, status, timestamps
- `equipment` & `equipment_rentals` – CHC inventory & bookings
- `mandi_prices` – regional market price feeds
- `banks` & `bank_users` – institution directory and authorized officers
- `insurance_policies` – PMFBY policy linkage

The schema is defined in `prisma/schema.prisma` and synced via `prisma migrate`.

---

## 📁 Folder & Directory Structure
```
SIH/
├─ app/                     # Next.js App Router (pages & API)
│   ├─ admin/dashboard/
│   ├─ agriculture-officer-dashboard/
│   ├─ bank-portal/
│   ├─ crop-details/
│   ├─ crop-monitoring/
│   ├─ dashboard/
│   ├─ equipment/
│   ├─ farmer-profile/
│   ├─ financial-support/
│   ├─ full-crop-guide/
│   ├─ government/dashboard/
│   ├─ insurance/
│   ├─ market/
│   ├─ notifications/
│   ├─ officer-dashboard/
│   ├─ onboarding/
│   ├─ recommended-actions/
│   ├─ risk-details/
│   ├─ schemes/
│   ├─ unauthorized/
│   └─ api/                 # Backend route handlers
├─ components/              # Reusable UI components by domain
│   ├─ admin/
│   ├─ bank-insurance/
│   ├─ dashboard/
│   ├─ farmer/
│   ├─ government/
│   ├─ officer/
│   └─ LanguageSelector.tsx
├─ lib/                     # Utilities & DB connection
│   ├─ db.ts                # MySQL pool
│   ├─ smartcrop-auth.ts    # Auth helpers
│   ├─ sarvam-ai.ts         # AI gateway client
│   └─ language-context.tsx
├─ SMS/notification/        # SMS mock, templates, rules
│   ├─ lib/notifications/
│   │   ├─ sms.ts
│   │   ├─ templates.ts
│   │   └─ rules.ts
│   └─ mock_sms.js
├─ prisma/                  # Prisma schema & migrations
├─ public/                  # Static assets & favicons
├─ styles/                  # Global Tailwind CSS & custom styles
├─ .env.local               # Local env variables (not committed)
├─ next.config.ts
├─ tailwind.config.js
├─ package.json
└─ README (1).md           # This documentation file
```

---

## 🚀 Getting Started & Local Setup
### Prerequisites
- Node.js **20.x** or higher
- npm **10.x** or higher
- MySQL instance (AWS RDS recommended) – create a database named `sih`

### 1. Clone & Install
```bash
git clone <repository-url>
cd SIH
npm install
```
### 2. Environment Variables
Create a `.env.local` file in the project root:
```env
DB_HOST=your-rds-endpoint
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_password
DB_NAME=sih

JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

SARVAM_API_KEY=your_sarvam_key

NEXT_PUBLIC_INSFORGE_PROJECT_URL=https://...   # optional
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_anon_key     # optional
```
### 3. Run Development Server
```bash
npm run dev
```
Open <http://localhost:3000> in a browser.

---

## 🔧 Verification & Quality Assurance
```bash
# TypeScript type checking (no errors expected)
npx tsc --noEmit

# Lint (ESLint)
npx eslint . --ext .ts,.tsx,.js

# Build for production (ensure no compile errors)
npm run build
```
Run the test‑SMS endpoint to see the mock SMS in action:
```bash
curl http://localhost:3000/api/test-sms
```
Check the console output for the formatted SMS message.

---

## 🙏 Contributing & Acknowledgements
- Developed with ❤️ for the **Smart India Hackathon (SIH)**.
- Contributions are welcome – please fork the repo, create a feature branch, and open a PR.
- Follow the existing code style (Prettier + ESLint) and write unit tests for new functionality.

---

*Last updated: 2026‑08‑30*

[![Next.js](https://img.shields.io/badge/Next.js-16.3.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![AWS RDS](https://img.shields.io/badge/AWS-RDS_MySQL-orange?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/rds/)
[![Sarvam AI](https://img.shields.io/badge/Sarvam_AI-Indic_NLP-purple?style=flat-square)](https://www.sarvam.ai/)

**SmartCrop** is an enterprise-grade agricultural intelligence, climate risk mitigation, farm credit enablement, and government monitoring ecosystem built for the **Smart India Hackathon (SIH)**. The platform bridges the gap between **Smallholder Farmers**, **Agriculture Extension Officers**, **Institutional Banks / Insurers**, and **Government Policy Makers**.

---

## 📑 Table of Contents

- [Core Value Proposition & User Roles](#-core-value-proposition--user-roles)
- [Security, Middleware & Authentication Architecture](#-security-middleware--authentication-architecture)
- [Multilingual & AI Engine (Sarvam AI)](#-multilingual--ai-engine-sarvam-ai)
- [Application Routes & Navigation Directory](#-application-routes--navigation-directory)
- [Backend REST API Endpoints](#-backend-rest-api-endpoints)
- [System Architecture & Technology Stack](#-system-architecture--technology-stack)
- [Database Schema (AWS RDS MySQL)](#-database-schema-aws-rds-mysql)
- [Folder & Directory Structure](#-folder--directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Variables Configuration](#-environment-variables-configuration)
- [Verification & Quality Assurance](#-verification--quality-assurance)

---

## 🎯 Core Value Proposition & User Roles

### 🧑‍🌾 1. Farmer Portal
- **Real-Time Farm Dashboard**: Weather observations, soil moisture/temperature telemetry, active crop lifecycle tracking, and localized alerts.
- **AI-Driven Crop Health & Risk Engine**: Multi-factor risk scoring (pest, drought, flood, nutrient deficiency) with prescriptive mitigation strategies.
- **Crop Monitoring & Phenology Calendar**: Stage-by-stage growth timeline, irrigation reminders, and daily agronomy task checklist.
- **Alternative Crop Recommendation**: AI recommendation engine suggesting climate-resilient alternative crops tailored to soil chemistry and monsoon predictions.
- **Live Mandi Rates**: Real-time APMC commodity prices and trend charts across Odisha and national markets.
- **Custom Hiring Center (CHC) Equipment Hub**: Tractor, Harvester, Drone, and implement rentals with instant booking.
- **Financial Facilities & KCC Loans**: Direct discovery, interest subvention calculator, and 1-click application submission.
- **PMFBY Crop Insurance**: Policy matching, premium estimation, and insurance claim tracking.
- **Farmer Profile Management**: Land parcel records, soil health card parameters, and quick Sign Out.

### 🧑‍💼 2. Agriculture Extension Officer Portal
- **Agricultural Distress Command Center**: District-wide distress heatmap and high-stress farmer triage.
- **Assigned Farmers Directory**: Geo-tagged farmer mapping with real-time risk stratification (High, Moderate, Low).
- **Field Inspection & Interventions**: Schedule farm inspections, log crop diagnostics, trigger emergency advisories, and fast-track relief funds.

### 🏦 3. Bank & Insurance Partner Portal
- **Credit & Loan Facility Management**: Create, customize, and publish loan products with interest subvention details.
- **Loan Applications Pipeline**: Review applicant risk profiles, land records, credit scores, and approve/reject loan requests.
- **Institutional Risk & Insurance Dashboard**: Underwriting metrics, active policy tracking, and PMFBY claim adjudication.

### 🏛️ 4. Government & Administrative Console
- **Regional Macro Analytics**: District and state-level crop distribution, yield projections, and stress indices.
- **CHC Equipment Allocation**: Public machinery pool management and custom hiring center dispatching.
- **Scheme Impact Assessment**: Direct Benefit Transfer (DBT) fund disbursement tracking and subsidy delivery auditing.

---

## 🛡️ Security, Middleware & Authentication Architecture

### 1. Role-Based Access Control (RBAC) & Next.js Proxy Middleware
Protected routes are strictly enforced via the root Next.js proxy middleware ([`proxy.ts`](file:///c:/Users/sugud/OneDrive/Documents/SIH/proxy.ts)) compatible with Next.js 16.3.2 Turbopack:

| Path Prefix | Minimum Required Role | Unauthenticated Behavior | Unauthorized Role Behavior |
| :--- | :--- | :--- | :--- |
| `/dashboard`, `/farmer-profile`, `/crop-*`, `/risk-details` | `farmer` or `administrator` | Redirect to `/authentication?redirectUrl=...` | Redirect to `/unauthorized` |
| `/admin/*`, `/officer-dashboard/*`, `/government/*` | `administrator` / `admin` | Redirect to `/authentication?redirectUrl=...` | Redirect to `/unauthorized` |
| `/bank/*`, `/bank-portal/*`, `/bank-insurance/*` | `bank` or `administrator` | Redirect to `/authentication?redirectUrl=...` | Redirect to `/unauthorized` |
| `/api/officer/*`, `/api/government/*` | `administrator` | HTTP `401 Unauthorized` | HTTP `403 Forbidden` |
| `/api/banks/*`, `/api/facilities/create` | `bank` or `administrator` | HTTP `401 Unauthorized` | HTTP `403 Forbidden` |

### 2. Dual Cookie & JWT Session Management
- **Token Handling**: Standard signed JSON Web Tokens (`smartcrop_token`) and persistent state cookies (`smartcrop_session`) set with `SameSite=Lax` and `HttpOnly` security flags.
- **Centralized Sign Out**: All profile headers, navigation sidebars, and dashboard action bars feature an instant **Logout / Sign Out** button that calls `smartCropAuth.signOut()` to clear client state, destroy session cookies, and route the user back to `/authentication`.

---

## 🌐 Multilingual & AI Engine (Sarvam AI)

SmartCrop provides comprehensive Indic language support across all UI interfaces and conversational advisory bots:
- **Languages Supported**: 22 Scheduled Indian Languages including **English**, **Hindi (हिन्दी)**, **Odia (ଓଡ଼ିଆ)**, **Bengali (বাংলা)**, **Telugu (తెలుగు)**, **Tamil (தமிழ்)**, **Marathi (मराठी)**, **Gujarati (ગુજરાતી)**, and **Punjabi (ਪੰਜਾਬੀ)**.
- **Sarvam AI Gateway**: Native REST integration ([`lib/sarvam-ai.ts`](file:///c:/Users/sugud/OneDrive/Documents/SIH/lib/sarvam-ai.ts)) for Indic machine translation (`/api/translate`) and natural text-to-speech voice generation (`/api/sarvam`).

---

## 🗺️ Application Routes & Navigation Directory

### 🌐 1. Public & Discovery Pages
| Route | URL Link | Description |
| :--- | :--- | :--- |
| **Landing / Home** | `http://localhost:3000/` | Interactive product overview & ecosystem entry |
| **Authentication** | `http://localhost:3000/authentication` | Unified Sign in & Registration with role picker |
| **Farmer Onboarding** | `http://localhost:3000/onboarding` | Step-by-step land parcel, soil, and crop registration |
| **Mandi Market Rates** | `http://localhost:3000/market` | Live APMC mandi commodity prices & trend charts |
| **Government Schemes** | `http://localhost:3000/schemes` | Central & State agricultural subsidy directory |
| **Scheme Detail** | `http://localhost:3000/schemes/pm-kisan` | Dynamic subsidy milestone checklist & eligibility |
| **Full Crop Guide** | `http://localhost:3000/full-crop-guide` | Complete agronomic sowing-to-harvest cultivation guide |
| **Alternative Crops** | `http://localhost:3000/alternative-crop` | AI climate-resilient alternative crop suggestions |
| **AI Agronomist Chat** | `http://localhost:3000/ai-chat` | Voice & text AI assistant in Indic languages |
| **Unauthorized View** | `http://localhost:3000/unauthorized` | Security barrier for insufficient permissions |

### 🌾 2. Farmer Portal *(Requires `farmer` or `administrator`)*
| Route | URL Link | Description |
| :--- | :--- | :--- |
| **Farmer Dashboard** | `http://localhost:3000/dashboard` | Main telemetry, farm health index & danger alerts |
| **Farmer Profile** | `http://localhost:3000/farmer-profile` | Personal details, plot boundaries, and Logout |
| **Crop Monitoring** | `http://localhost:3000/crop-monitoring` | Satellite NDVI, soil metrics & interactive calendar |
| **Crop Details** | `http://localhost:3000/crop-details` | Stage timeline, irrigation needs & pest protocols |
| **Risk Diagnostics** | `http://localhost:3000/risk-details` | Pest, weather & soil moisture distress scores |
| **Recommended Actions** | `http://localhost:3000/recommended-actions` | Priority prescriptive advisory interventions |
| **Equipment Marketplace**| `http://localhost:3000/equipment` | CHC Machinery rental catalog & booking engine |
| **Financial Support** | `http://localhost:3000/financial-support` | KCC crop loans & low-interest credit schemes |
| **Support Application** | `http://localhost:3000/financial-support/detail` | Credit application & subvention calculator |
| **Application Receipt** | `http://localhost:3000/financial-support/acknowledgement` | Submission confirmation & tracking token |
| **Crop Insurance** | `http://localhost:3000/insurance` | PMFBY policy matching, claims & premium calculator |
| **Notifications** | `http://localhost:3000/notifications` | Real-time weather warnings & credit alerts |

### 🧑‍💼 3. Agriculture Officer & Government Portals *(Requires `administrator`)*
| Route | URL Link | Description |
| :--- | :--- | :--- |
| **Admin Command Center**| `http://localhost:3000/admin/dashboard` | District distress heatmap & high-risk triage |
| **Officer Dashboard** | `http://localhost:3000/agriculture-officer-dashboard` | Field officer workspace & advisory broadcaster |
| **District Overview** | `http://localhost:3000/officer-dashboard` | Block-wise monitoring across Mayurbhanj |
| **High-Risk Directory** | `http://localhost:3000/officer-dashboard/farmers` | Distress scores, crop status & intervention tools |
| **Government CHC Hub** | `http://localhost:3000/government/dashboard` | State machinery allocation & DBT subsidy stats |

### 🏦 4. Bank Partner Portal *(Requires `bank` or `administrator`)*
| Route | URL Link | Description |
| :--- | :--- | :--- |
| **Bank Portal** | `http://localhost:3000/bank-portal` | Bank partner landing & quick actions |
| **Bank Dashboard** | `http://localhost:3000/bank-portal/dashboard` | Credit portfolio overview & verification badge |
| **Credit Facilities** | `http://localhost:3000/bank-portal/facilities` | Manage, publish, draft or suspend credit schemes |
| **Create Facility** | `http://localhost:3000/bank-portal/facilities/add` | New credit facility creation wizard |
| **Bank Registration** | `http://localhost:3000/bank-portal/register` | Financial institution verification & onboarding |
| **Bank Underwriting** | `http://localhost:3000/bank-insurance/dashboard` | Credit risk scoring & PMFBY insurance claims |

---

## ⚡ Backend REST API Endpoints

### 🔐 Authentication & Session
- `POST /api/auth/login` — Authenticate user (Email/Phone + Password) with signed JWT and cookies
- `POST /api/auth/register` — Register a new Farmer, Officer, or Bank user
- `POST /api/auth/logout` — Invalidate user session and clear browser cookies
- `GET /api/profile` — Fetch current authenticated user profile & farm holdings
- `GET /api/db-check` — Real-time AWS RDS MySQL health test

### 🌾 Farmer & Agronomy
- `GET /api/farmer/dashboard` — Aggregated telemetry, weather forecast & distress score
- `POST /api/farmer/register` — Onboard new farmer profile & land details
- `GET /api/farmer/risk` — Multi-factor distress risk score breakdown
- `GET /api/farmer/recommendations` — Prescriptive mitigation action items
- `GET /api/equipment` — Custom Hiring Center (CHC) equipment inventory
- `POST /api/equipment/[id]/book` — Book machinery rental slot

### 🤖 AI Advisory & Indic NLP (Sarvam AI)
- `POST /api/ai/chat` — Conversational multilingual agricultural assistant
- `POST /api/ai/risk-explanation` — Natural language risk diagnostic generator
- `POST /api/ai/alternative-crop` — Recommendation engine for alternate crops
- `POST /api/translate` — Indic text translation across 22 scheduled Indian languages
- `POST /api/sarvam` — Sarvam AI translation & Text-to-Speech (TTS) voice generation

### 🧑‍💼 Extension Officer APIs
- `GET /api/officer/dashboard` — Jurisdiction statistics & pending field tasks
- `GET /api/officer/farmers` — Filtered list of monitored farmers under jurisdiction
- `GET /api/officer/farmers/[farmerId]` — Detailed farmer history & inspection records

### 🏦 Banking & Credit Facilities
- `GET /api/facilities` — List all active and published financial facilities
- `POST /api/facilities/create` — Create a new credit facility
- `PATCH /api/facilities/[facilityId]/status` — Toggle facility lifecycle status
- `GET /api/banks/[bankId]/dashboard` — Bank-specific portfolio analytics
- `GET /api/banks/[bankId]/facilities` — Retrieve facilities created by a bank

### 🔔 Notifications & Alerts
- `GET /api/notifications` — Retrieve user notifications
- `POST /api/notifications/emit` — Broadcast emergency weather/distress alert
- `POST /api/notifications/read-all` — Mark all notifications as read

---

## 🛠️ System Architecture & Technology Stack

```text
┌────────────────────────────────────────────────────────────────────────┐
│               Frontend: Next.js 16 (Turbopack) + React 19              │
│       Tailwind CSS v4 • Framer Motion • Lucide Icons • Recharts        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         (Next.js Proxy Middleware)
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Backend API Route Handlers (Edge & Node.js Runtime)        │
│              JWT Auth • RBAC • Dual Cookies • Input Validation         │
└───────────────┬───────────────────┬────────────────────┬───────────────┘
                │                   │                    │
                ▼                   ▼                    ▼
┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────────┐
│  AWS RDS MySQL Pool   │ │   Sarvam AI API   │ │   InsForge BaaS        │
│  (Connection Manager) │ │ (Indic NLP & TTS) │ │ (Realtime & Gateway)   │
└───────────────────────┘ └───────────────────┘ └────────────────────────┘
```

- **Framework**: [Next.js 16.3.2](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Motion & Micro-interactions**: [Framer Motion](https://www.framer.com/motion/)
- **Database Engine**: [AWS RDS MySQL](https://aws.amazon.com/rds/) via singleton connection pool (`mysql2/promise`)
- **Indic NLP Gateway**: [Sarvam AI](https://www.sarvam.ai/) REST API
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & React Context

---

## 🗄️ Database Schema (AWS RDS MySQL)

The system utilizes structured relational tables in AWS RDS MySQL (`sih` database):

1. **`users`**: Authentication credentials, role mapping (`farmer`, `administrator`, `bank`), account status.
2. **`farmer_profiles` / `farmers`**: Land acreage, soil classification, irrigation type, KYC status, contact info.
3. **`crops`**: Active crop cycles, sowing date, growth stage, health index, yield forecast.
4. **`crop_risk` & `risk_scores`**: Multi-dimensional risk ratings (pest, weather, soil moisture).
5. **`financial_facilities`**: Loan products, subvention percentage, interest rates, tenure, collateral limits.
6. **`bank_applications` & `loans`**: Loan application tracking and adjudication history.
7. **`banks` & `bank_users`**: Financial institution directory & authorized credit officers.
8. **`officer_interventions`**: Scheduled field visits, emergency advisories, calls.
9. **`notifications`**: Role-based broadcast alerts with priority and read receipts.
10. **`equipment` & `equipment_rentals`**: Farm machinery specs, hourly pricing, and bookings.
11. **`mandi_prices`**: Regional APMC commodity pricing feeds.

---

## 📁 Folder & Directory Structure

```text
SIH/
├── app/                                # Next.js App Router (Pages & API Handlers)
│   ├── admin/dashboard/                # Admin Distress Command Center
│   ├── agriculture-officer-dashboard/  # Officer Dashboard View
│   ├── alternative-crop/               # AI Alternate Crop Recommendation Page
│   ├── authentication/                 # Login & Registration Portal
│   ├── bank-insurance/dashboard/       # Bank & Insurance Console
│   ├── bank-portal/                    # Bank Portal, Facilities & Registration
│   ├── crop-details/                   # Crop Analytics & Calendar Page
│   ├── crop-monitoring/                # Real-Time Sensor & Satellite Monitoring
│   ├── dashboard/                      # Main Farmer Dashboard
│   ├── equipment/                      # Equipment Rental Marketplace
│   ├── farmer-profile/                 # Farmer Profile Management
│   ├── financial-support/              # Loan & Grant Applications
│   ├── full-crop-guide/                # Agricultural Manual
│   ├── government/dashboard/           # Policy & Regional CHC Analytics
│   ├── insurance/                      # Crop Insurance Portal
│   ├── market/                         # Mandi Market Rates
│   ├── notifications/                  # Alerts & Notification Center
│   ├── officer-dashboard/              # Extension Officer Dashboard & Inspection
│   ├── onboarding/                     # First-Time User Onboarding
│   ├── recommended-actions/            # Actionable Advisory Steps
│   ├── risk-details/                   # Climate & Pest Risk Breakdown
│   ├── schemes/                        # Government Schemes Hub & Dynamic Details
│   ├── unauthorized/                   # Security Access Control Warning View
│   ├── api/                            # Backend REST Route Handlers
│   ├── layout.tsx                      # Root Application Layout
│   └── page.tsx                        # Home / Landing Page
│
├── Bank Portal/                        # Bank UI Components & Modular Views
├── components/                         # Reusable UI & Domain Components
│   ├── admin/                          # Admin Dashboard Components
│   ├── bank-insurance/                 # Bank & Insurance Widgets
│   ├── dashboard/                      # Farmer Widgets & Charts
│   ├── farmer/                         # Farmer Management Components
│   ├── government/                     # Government Hub Components
│   ├── officer/                        # Officer Inspection Views
│   └── LanguageSelector.tsx            # Indic Language Switcher Dropdown
├── farmer deshboard/                   # Core Farmer Dashboard Visuals & Navbar
├── farmer profile/                     # Farmer Profile Views & Task Manager
├── Crop Details/                       # Crop Calendar & Health Metrics
├── lib/                                # Utilities & Database Connection
│   ├── db.ts                           # AWS RDS MySQL Connection Pool (Singleton)
│   ├── smartcrop-auth.ts               # Client Auth & Role Utilities
│   ├── sarvam-ai.ts                    # Sarvam AI REST Client (Translation & TTS)
│   └── language-context.tsx            # Multilingual Localization Engine
├── scripts/                            # Verification & Diagnostic Test Scripts
├── public/                             # Static Assets, Icons & Images
├── proxy.ts                            # Next.js 16 Security & RBAC Middleware
├── package.json                        # Dependencies & Project Scripts
├── next.config.ts                      # Next.js Build Configuration
└── README.md                           # Comprehensive Documentation
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) version **20.x** or higher
- [npm](https://www.npmjs.com/) version **10.x** or higher

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd SIH
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and populate your credentials:

```env
# AWS RDS MySQL Database Configuration
DB_HOST=sih-mysql.cley86o8g8vx.eu-north-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_rds_password
DB_NAME=sih

# Authentication & Secret Keys
JWT_SECRET=your_jwt_secret_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Sarvam AI Indic NLP Gateway
SARVAM_API_KEY=your_sarvam_api_key

# Optional / External BaaS Gateway
NEXT_PUBLIC_INSFORGE_PROJECT_URL=https://856k6wi6.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Quality Assurance

Run the test and build verification suite:

```bash
# Verify TypeScript Types (0 errors)
npx tsc --noEmit

# Verify Production Build
npm run build
```

---

## 👥 Contributors & Acknowledgements

Developed with ❤️ for the **Smart India Hackathon (SIH)**.
