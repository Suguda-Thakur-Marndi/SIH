# 🌱 SmartCrop — AI-Powered Smart Agriculture & Agri-FinTech Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-16.3.2_(Turbopack)-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![AWS RDS](https://img.shields.io/badge/AWS-RDS_MySQL_8.0-orange?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/rds/)
[![InsForge BaaS](https://img.shields.io/badge/InsForge-Postgres_BaaS-0052CC?style=flat-square)](https://insforge.dev/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI_2.5-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Sarvam AI](https://img.shields.io/badge/Sarvam_AI-Indic_NLP_&_TTS-purple?style=flat-square)](https://www.sarvam.ai/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-v6.6-brightgreen?style=flat-square&logo=mapbox)](https://maplibre.org/)
[![Clerk Auth](https://img.shields.io/badge/Clerk-NextAuth_OIDC-6C47FF?style=flat-square&logo=clerk)](https://clerk.com/)
[![ESLint & Types](https://img.shields.io/badge/ESLint_&_TS-0_Errors_|_0_Warnings-emerald?style=flat-square)](https://eslint.org/)

**SmartCrop** is an enterprise-grade agricultural intelligence, climate distress prediction, farm credit facilitation, and government monitoring platform built for the **Smart India Hackathon (SIH)**. The ecosystem seamlessly unifies four critical stakeholder domains: **Smallholder Farmers**, **Agriculture Extension Officers**, **Institutional Banks & Insurers**, and **Government Policy Makers**.

---

## 📑 Table of Contents

- [Key Highlights & Capabilities](#-key-highlights--capabilities)
- [Core Stakeholder Portals](#-core-stakeholder-portals)
- [AI Agronomist & Decision Support Engines](#-ai-agronomist--decision-support-engines)
- [Agriculture Officer Distress Analytics System](#-agriculture-officer-distress-analytics-system)
- [Spatial District Distress Telemetry Map (MapLibre GL)](#-spatial-district-distress-telemetry-map-maplibre-gl)
- [Multilingual & Real-Time Indic Voice System](#-multilingual--real-time-indic-voice-system)
- [Security, Middleware & Authentication Architecture](#-security-middleware--authentication-architecture)
- [Application Routes Directory (65+ Routes)](#-application-routes-directory-65-routes)
- [Backend REST API Endpoints](#-backend-rest-api-endpoints)
- [System Architecture & Technology Stack](#-system-architecture--technology-stack)
- [Database Architecture (Dual RDS MySQL + InsForge BaaS)](#-database-architecture-dual-rds-mysql--insforge-baas)
- [Folder & Directory Structure](#-folder--directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Variables Configuration](#-environment-variables-configuration)
- [Automated Verification & Test Suite](#-automated-verification--test-suite)

---

## 🌟 Key Highlights & Capabilities

- 🤖 **Voice-Enabled AI Agronomist**: Conversational Krishi assistant powered by Google Gemini 2.5 and Sarvam AI Indic NLP with two-way speech recognition and voice synthesis.
- ⚡ **Multi-Hazard Distress Scoring**: Real-time algorithmic triage combining 3 independent distress signals: **Monsoon Rainfall Deficit**, **APMC Mandi Price Volatility**, and **Loan Repayment Proximity**.
- 🗺️ **High-Performance Geospatial Heatmap**: GPU-accelerated MapLibre GL vector maps featuring live farmer clusters, GPS field-unit tracking, and block-level vulnerability indices.
- 🌾 **Climate-Resilient Alternative Crop Advisory**: AI-driven crop substitution recommendations (e.g. Groundnut, Finger Millet, Mustard) with water saving %, yield estimates, and ROI comparisons.
- 💳 **End-to-End Agri-FinTech Hub**: Integrated Kisan Credit Card (KCC) loans, interest subvention calculators, and PMFBY crop insurance claim processing.
- 📱 **Multi-Channel Notification Pipeline**: Automated SMS and in-app alerts dispatched when distress thresholds or weather warnings escalate.
- 🌐 **Full 22+ Scheduled Indian Languages**: Native localization with client-side UI dictionaries, Sarvam AI neural translations, and Google Translate DOM integration.

---

## 🎯 Core Stakeholder Portals

### 🧑‍🌾 1. Farmer Portal
- **Command Center (`/dashboard`)**: Live weather telemetry, soil moisture/temperature parameters, active crop stage tracking, and localized danger alerts.
- **AI Crop Voice Assistant (`/ai-chat`)**: Hands-free voice agronomist answering pest management, fertilizer dosing, and irrigation queries.
- **Crop Health & Diagnostics (`/risk-details`)**: Multi-factor distress breakdown with prescriptive agronomic mitigation steps.
- **Phenology & Task Manager (`/crop-monitoring`, `/crop-details`)**: Phenological stage calendar, irrigation schedules, and daily farm tasks.
- **Alternative Crop Substitution (`/alternative-crop`)**: Comparison engine evaluating drought-resilient crops against traditional water-heavy crops.
- **Full Agronomic Production Guide (`/full-crop-guide`)**: Illustrated knowledge base with disease identification and voice playback.
- **Live Mandi Rates & Logistics (`/market`)**: Real-time APMC commodity prices, MSP comparisons, and logistics cost calculators.
- **Custom Hiring Center (CHC) Rentals (`/equipment`)**: Subsidized hourly/daily booking of tractors, harvesters, power tillers, and spraying drones.
- **Financial Facilities & KCC (`/financial-support`)**: Interest subvention discovery and 1-click loan applications.
- **PMFBY Crop Insurance (`/insurance`)**: Policy discovery, premium estimation, loss reporting, and claim tracking.
- **Farmer Profile Dossier (`/farmer-profile`)**: RoR land parcel records, soil type data, linked bank accounts, and active KYC.

### 🧑‍💼 2. Agriculture Extension Officer Portal
- **Command Center (`/officer-dashboard`)**: High-level jurisdictional distress metrics, emergency alerts, and recent farmer telemetry.
- **10-Section Distress Analytics Engine (`/officer-dashboard/analytics`)**: Deep analytics answering *Where is distress? How is it changing? Why is it happening? Who needs intervention?*
- **Geospatial Distress Map (`/officer-dashboard/map`)**: Real-time map with clustering, live GPS location tracking, and 1-click farmer triage flyouts.
- **High-Risk Farmer Triage Directory (`/officer-dashboard/farmers`)**: Filterable queue by risk score (>70 critical), block/village, crop, and distress driver.
- **Field Interventions & Advisory Dispatch (`/officer-dashboard/interventions`)**: Log field inspections, dispatch SMS advisories, and track mitigation outcomes.
- **Officer Configuration (`/officer-dashboard/settings`)**: Officer credentials, jurisdiction assignment (Mayurbhanj District), alert thresholds, and security controls.

### 🏦 3. Bank & Insurance Institutional Portal
- **Loan Facilities Management (`/bank-portal/facilities`)**: Create, publish, draft, or suspend agricultural credit schemes with subvention terms.
- **Credit Pipeline & Underwriting (`/bank-portal/dashboard`)**: Review farmer creditworthiness, verify land records, and approve/reject loan requests.
- **Institutional Risk Dashboard (`/bank-insurance/dashboard`)**: Portfolio underwriting metrics, active policy tracking, and PMFBY claim adjudication.

### 🏛️ 4. Government & Central Administration Console
- **Macro Agriculture Overview (`/government/dashboard`)**: State and district-level crop distribution, yield forecasts, and drought stress indices.
- **Public Machinery Pool Management**: Custom Hiring Center allocation and machinery availability monitoring.
- **Admin Management Console (`/admin/dashboard`)**: Multi-tenant user approvals, role assignments, and audit logging.

---

## 🤖 AI Agronomist & Decision Support Engines

SmartCrop integrates Google Gemini 2.5, Sarvam AI Indic NLP, and an autonomous Agentic Geolocation Pipeline:

```
                                  ┌────────────────────────┐
                                  │  Farmer Voice / Query  │
                                  └───────────┬────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌──────────────────────────┐                   ┌──────────────────────────┐
         │  Web Speech API (Audio)  │                   │   Text Query (Multilingual)
         └────────────┬─────────────┘                   └─────────────┬────────────┘
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              ▼
                             ┌─────────────────────────────────┐
                             │    Next.js AI Orchestrator      │
                             │       (/api/ai/chat)            │
                             └────────────────┬────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌──────────────────────────┐                   ┌──────────────────────────┐
         │  Google Gemini 2.5 Flash │                   │     Sarvam AI Indic NLP  │
         │  - Agronomic Reasoning   │                   │  - 22+ Indic Translations│
         │  - Fertilizer Dosages    │                   │  - Indic Text-to-Speech  │
         │  - Multi-Factor Triage   │                   │  - Native Odia/Hindi TTS │
         └──────────────────────────┘                   └──────────────────────────┘
```

1. **Conversational AI Agronomist (`/ai-chat`, `POST /api/ai/chat`)**:
   - Diagnoses pest attacks, nutrient deficiencies, and water stress with exact dosages per acre for Mayurbhanj, Odisha.
2. **Autonomous Agentic Pipeline (`GET /api/agentic`)**:
   - Ingests GPS coordinates, retrieves soil NPK/pH chemistry, weather deficit indices, and APMC market prices to synthesize automated advisory.
3. **Alternative Crop Recommendation Engine (`POST /api/ai/alternative-crop`)**:
   - Recommends climate-resilient alternative crops (Finger Millet, Black Gram, Mustard) based on soil type and monsoon rainfall trends.
4. **AI Plain-Language Risk Diagnostics (`POST /api/ai/risk-explanation`)**:
   - Translates complex sensor data and credit indices into actionable explanations.

---

## 📊 Agriculture Officer Distress Analytics System

Implemented strictly per [`officer-analytics-prd.md`](officer-analytics-prd.md):

| Section | Component | Description & Functionality |
|---|---|---|
| **§1. Global Filters** | Multi-Filter Bar | Independent query loading by District, Block, Crop, Risk Level, Risk Factor, and Time Range (`7d`, `14d`, `30d`, `90d`). |
| **§2. Overview KPIs** | [`KPICards.tsx`](Agriculture%20officer%20dashboard/analytics/components/KPICards.tsx) | Critical High-Risk count with period-over-period delta %, Moderate-Risk count, Active Alerts, and Pending Interventions. |
| **§3. Distress Trend** | [`DistressTrendChart.tsx`](Agriculture%20officer%20dashboard/analytics/components/DistressTrendChart.tsx) | Daily average risk score area chart vs high-risk bar volume with a visible `>70` critical threshold line. |
| **§4. Risk Distribution** | [`RiskDistribution.tsx`](Agriculture%20officer%20dashboard/analytics/components/RiskDistribution.tsx) | High (>70), Moderate (31–70), and Low (≤30) risk bands clickable to filter the high-risk directory. |
| **§5. Distress Factors** | [`DistressFactorsExpanded.tsx`](Agriculture%20officer%20dashboard/analytics/components/DistressFactorsExpanded.tsx) | 3-signal breakdown percentages (Weather, Market, Loan) with on-demand expansion metrics. |
| **§6. Distress Heatmap** | [`DistressHeatmap.tsx`](Agriculture%20officer%20dashboard/analytics/components/DistressHeatmap.tsx) | Block-level severity grid across Mayurbhanj blocks (Baripada, Betnoti, Badasahi, Kuliana, Udala, Karanjia, Rairangpur, Jashipur). |
| **§7. Weather Stress** | [`WeatherStressPanel.tsx`](Agriculture%20officer%20dashboard/analytics/components/WeatherStressPanel.tsx) | Rainfall deviation %, affected farmer counts, and 7-day expected vs actual precipitation series. |
| **§8. Market Stress** | [`MarketStressPanel.tsx`](Agriculture%20officer%20dashboard/analytics/components/MarketStressPanel.tsx) | Mandi price drops vs MSP, affected farmer counts, and dual-stress (weather + market) overlap insights. |
| **§9. Combined Risk** | [`CombinedRiskMatrix.tsx`](Agriculture%20officer%20dashboard/analytics/components/CombinedRiskMatrix.tsx) | Single, double, and all-three concurrent signal distress matrix. |
| **§10. Priority Actions** | [`PriorityTable.tsx`](Agriculture%20officer%20dashboard/analytics/components/PriorityTable.tsx) | Interactive dialogs for **Direct Call (`tel:`)**, **SMS Advisory Broadcast**, **Assign Field Visit**, and **View Dossier**. |

---

## 🗺️ Spatial District Distress Telemetry Map (MapLibre GL)

Located at [`/officer-dashboard/map`](app/officer-dashboard/map/page.tsx):
- **MapLibre GL Vector Engine**: GPU-accelerated vector mapping with dynamic point clustering and zoom expansions.
- **Geocoding & Hub Navigation**: Real-time geocoding search across India with instant fly-to navigation for all Mayurbhanj blocks and administrative centers.
- **Live Field GPS Tracking**: Geolocation `watchPosition` tracking officer field unit movement in real time with pulsating beacon indicators.
- **Farmer Distress Nodes**: Color-coded risk markers (Red >70, Amber 31-70, Green ≤30) with rich popups showing land area, crops, phone, and 1-click intervention routing.

---

## 🌐 Multilingual & Real-Time Indic Voice System

SmartCrop features a hybrid multilingual engine designed for rural accessibility across all 22+ Scheduled Indian Languages:

### 1. Dual-Layer Translation Architecture
- **Layer 1: Instant Client UI Dictionary**: Pre-compiled translation dictionary (`UI_DICTIONARY` in [`lib/language-context.tsx`](lib/language-context.tsx)) for zero-latency instant rendering of navigational elements, labels, buttons, and headings.
- **Layer 2: Real-Time Full-DOM Google Translate Engine**: Automatic full-page DOM translation powered by Google Translate runtime scripts in [`app/layout.tsx`](app/layout.tsx).
- **Layer 3: Indic Neural NLP (Sarvam AI)**: Server-side machine translation (`/api/translate`) and natural Text-to-Speech voice synthesis (`/api/sarvam`) for conversational AI agronomist advisory.

### 2. Supported Languages (22+ Indian Languages + English)
| Code | Language | Native Name | Code | Language | Native Name |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `en` | English | English | `hi` | Hindi | हिन्दी |
| `or` | Odia | ଓଡ଼ିଆ | `bn` | Bengali | বাংলা |
| `te` | Telugu | తెలుగు | `ta` | Tamil | தமிழ் |
| `mr` | Marathi | मराठी | `gu` | Gujarati | ગુજરાતી |
| `pa` | Punjabi | ਪੰਜਾਬੀ | `kn` | Kannada | ಕನ್ನಡ |
| `ml` | Malayalam | മലയാളം | `as` | Assamese | অসমীয়া |
| `ur` | Urdu | اردو | `ne` | Nepali | नेपाली |
| `sa` | Sanskrit | संस्कृतम् | `mai`| Maithili | मैथिली |
| `sd` | Sindhi | सिन्धी / سنڌي | `ks` | Kashmiri | कॉशुर / کٲشُر |
| `kok`| Konkani | कोंकणी | `mni`| Manipuri | ꯃꯤꯇꯩꯂꯣꯟ |
| `brx`| Bodo | बर' | `doi`| Dogri | डोगरी |
| `sat`| Santali | ᱥᱟᱱᱛᱟᱲᱤ | — | — | — |

---

## 🛡️ Security, Middleware & Authentication Architecture

Protected routes are strictly enforced via the root Next.js proxy middleware ([`proxy.ts`](proxy.ts)) with genuine cryptographic JWT tokens and bcrypt password hashing:

| Path Prefix | Minimum Required Role | Unauthenticated Behavior | Unauthorized Role Behavior |
| :--- | :--- | :--- | :--- |
| `/dashboard`, `/farmer-profile`, `/crop-*`, `/risk-details` | `farmer` or `administrator` | Redirect to `/authentication` | Redirect to `/unauthorized` |
| `/officer-dashboard`, `/officer-dashboard/*` | `officer` or `administrator` | Redirect to `/authentication` | Redirect to `/unauthorized` |
| `/bank-portal`, `/bank-portal/*`, `/bank-insurance/*` | `bank_partner` or `administrator` | Redirect to `/authentication` | Redirect to `/unauthorized` |
| `/government/*` | `government` or `administrator` | Redirect to `/authentication` | Redirect to `/unauthorized` |

---

## 🧭 Application Routes Directory (65+ Routes)

```
Frontend Routes:
├─ /                                     -> Root Landing & Role Discovery
├─ /authentication                       -> Unified Multi-Role Authentication (Farmer / Admin / Bank)
├─ /onboarding                           -> Step-by-Step Farmer Registration Flow
├─ /dashboard                            -> Farmer Command Center & Live Telemetry
├─ /crop-monitoring                      -> Real-Time Crop Lifecycle & Soil Health
├─ /crop-details                         -> Crop Calendar, Soil & Irrigation Guide
├─ /risk-details                         -> 3-Signal Multi-Hazard Distress Diagnostics
├─ /recommended-actions                  -> Agronomic Interventions & Mitigation Checklist
├─ /alternative-crop                     -> Climate-Resilient Crop Substitution Advisory
├─ /full-crop-guide                      -> Comprehensive Agronomic Production Handbook
├─ /market                               -> APMC Mandi Rates & Price Trend Analytics
├─ /schemes                              -> Central & State Government Schemes Hub
├─ /schemes/[schemeId]                   -> Government Scheme Details & Eligibility
├─ /equipment                            -> Subsidized CHC Machinery Rentals
├─ /equipment/[equipmentId]              -> Machinery Details & Reservation
├─ /financial-support                    -> Kisan Credit Card (KCC) & Credit Discovery
├─ /financial-support/list               -> Available Credit Schemes Directory
├─ /financial-support/detail             -> Credit Facility Terms & Application
├─ /financial-support/acknowledgement    -> Official Loan Application Receipt
├─ /insurance                            -> PMFBY Crop Insurance & Claims Management
├─ /insurance_2                          -> Alternative Insurance Portal View
├─ /farmer-profile                       -> Farmer Dossier, RoR Land Records & Tasks
├─ /notifications                        -> Multi-Channel Notification & Alert Center
├─ /notifications/[id]                   -> Notification Detail & Action Dispatch
├─ /ai-chat                              -> AI Voice Agronomist Interactive Voice Assistant
├─ /officer-dashboard                    -> Extension Officer Command Center
├─ /officer-dashboard/analytics          -> 10-Section Distress Analytics Engine
├─ /officer-dashboard/map                -> Spatial District Distress Telemetry Map
├─ /officer-dashboard/farmers            -> High-Risk Farmers Triage Directory
├─ /officer-dashboard/farmers/[farmerId] -> Individual Farmer Deep Dossier & History
├─ /officer-dashboard/interventions      -> Field Visit & Advisory Dispatch Log
├─ /officer-dashboard/settings           -> Officer Profile, Notifications & Security
├─ /bank-portal                          -> Bank Partner Portal Landing
├─ /bank-portal/dashboard                -> Bank Portfolio Overview & Loan Pipeline
├─ /bank-portal/facilities               -> Credit Products Management
├─ /bank-portal/facilities/add           -> Add Credit Facility Wizard
├─ /bank-portal/facilities/manage        -> Manage Active Facility Terms
├─ /bank-portal/register                 -> Bank Officer Registration
├─ /bank-insurance/dashboard             -> Institutional Insurance & Credit Dashboard
├─ /government/dashboard                 -> Government State & District Macro Agricultural Overview
├─ /admin/dashboard                      -> Central Admin Management Console
└─ /unauthorized                         -> Role Access Violation Notice
```

---

## ⚡ Backend REST API Endpoints

### 1. Officer Analytics (`/api/officer/analytics/*`)
- `GET /api/officer/analytics/overview` — 4 KPI cards + period-over-period delta calculations.
- `GET /api/officer/analytics/distress-trend` — Daily time series + dynamic trend insights.
- `GET /api/officer/analytics/risk-distribution` — High, Moderate, Low tier counts.
- `GET /api/officer/analytics/distress-factors` — 3-signal percentage breakdown.
- `GET /api/officer/analytics/distress-factors/[factor]` — On-demand factor expansion metrics.
- `GET /api/officer/analytics/heatmap` — Block-level severity aggregation for Mayurbhanj.
- `GET /api/officer/analytics/weather-stress` — Rainfall variance & expected-vs-actual series.
- `GET /api/officer/analytics/market-stress` — Mandi price declines & dual-stress overlaps.
- `GET /api/officer/analytics/combined-risk` — Single, double, and all-three signal matrix.
- `GET /api/officer/analytics/priority-interventions` — Prioritized action queue joined with `loans`.

### 2. AI & Indic NLP Services (`/api/ai/*`, `/api/agentic`, `/api/translate`, `/api/sarvam`)
- `POST /api/ai/chat` — Gemini AI agronomist conversational chat.
- `GET /api/agentic` — Autonomous agentic geolocation advisory pipeline.
- `POST /api/ai/alternative-crop` — Climate-smart crop substitution generator.
- `POST /api/ai/risk-explanation` — Plain-language risk diagnostics generator.
- `POST /api/translate` — Sarvam / Indic neural translation.
- `POST /api/sarvam` — Sarvam AI multi-modal translation and Indic TTS.

### 3. Authentication & User Management (`/api/auth/*`, `/api/users/*`, `/api/profile`)
- `POST /api/auth/login` — Bcrypt credential check + JWT token issuance.
- `POST /api/auth/register` — Multi-role user registration with DB persistence.
- `POST /api/auth/logout` — Cookie invalidation & session cleanup.
- `GET /api/profile` — Authenticated user profile lookup.
- `POST /api/users/[id]/approve` — Administrator user approval.
- `POST /api/users/[id]/reject` — Administrator user rejection.

### 4. Farmer Services & Marketplace (`/api/farmer/*`, `/api/equipment/*`, `/api/facilities/*`, `/api/geocode`)
- `GET /api/farmer/dashboard` — Live farm telemetry and distress metrics.
- `GET /api/farmer/risk` — Multi-factor risk scores.
- `GET /api/farmer/recommendations` — Prescribed agronomic tasks.
- `GET /api/farmer/[id]` — Farmer dossier and linked land parcels.
- `POST /api/farmer/register` — Farmer direct registration with land parcel creation.
- `GET /api/equipment` — Subsidized machinery catalog.
- `POST /api/equipment/[id]/book` — Equipment reservation endpoint.
- `GET /api/facilities` — Bank loan facilities with subventions.
- `GET /api/geocode` — Universal Indian geocoding & location resolution.
- `GET /api/test-sms` — Multi-channel SMS dispatch pipeline test.

---

## 🏗️ System Architecture & Technology Stack

| Layer | Technologies Used | Purpose |
|---|---|---|
| **Frontend Framework** | **Next.js 16.3.2 (App Router / Turbopack)** with **React 19.2.8** | Server-side rendering, streaming SSR, and client interactivity. |
| **Styling & UI** | **Tailwind CSS v4**, Glassmorphism CSS, Lucide React, Framer Motion | Clean, modern, responsive interface with customized light & dark modes. |
| **Data Visualization** | **Recharts**, **MapLibre GL (v6.6)** | Dynamic charts, area curves, composed trend lines, and geospatial maps. |
| **AI & NLP** | **Google Gemini 2.5 Flash**, **Sarvam AI Indic NLP** | Conversational agronomist, crop recommendations, and Indic voice synthesis. |
| **Databases** | **AWS RDS MySQL 8.0** & **InsForge BaaS (Postgres)** | ACID transactional storage for farmers, crops, telemetry, loans, and interventions. |
| **Authentication** | **Clerk NextAuth**, **Signed JWTs (HS256)**, **bcryptjs** | Secure multi-role session and access token handling. |
| **State Management** | **Redux Toolkit**, **Zustand**, React Context | Client telemetry synchronization and persistent UI state. |

---

## 🗄️ Database Architecture (Dual RDS MySQL + InsForge BaaS)

The platform is backed by a fully normalized MySQL relational database hosted on AWS RDS with complementary InsForge BaaS integration:

```sql
-- AWS RDS MySQL Schema:
users (id, email, name, phone, username, password, role, account_status, profile_id, metadata, created_at)
farmers (id, user_id, name, phone, email, password_hash, district, village, state, land_area, soil_type, loan_amount, loan_due_date, language, created_at)
farms (id, farmer_id, name, latitude, longitude, area, soil_type, village, district, state, created_at)
crops (id, farm_id, farmer_id, name, variety, season, stage, sowing_date, harvest_date, health_status, created_at)
risk_scores (id, farm_id, farmer_id, rainfall_risk, market_risk, loan_risk, score, calculated_at, created_at)
crop_risk (id, crop_id, overall_risk, pest_risk, weather_risk, market_risk, soil_moisture_risk, risk_factors, recommendations, created_at)
loans (id, farmer_id, bank_id, loan_type, principal_amount, outstanding_amount, interest_rate, due_date, status, created_at)
financial_facilities (id, bank_id, title, category, interest_rate, max_amount, tenure_months, subvention_available, status, created_at)
equipment (id, name, type, owner, location, price_per_hour, availability, specifications, created_at)
mandi_prices (id, crop_name, market_name, district, state, modal_price, min_price, max_price, msp, recorded_at)
weather_observations (id, farm_id, district, temperature, rainfall, forecast_rainfall, humidity, recorded_at)
notifications (id, farmer_id, title, message, category, priority, is_read, source_feature, created_at)
officer_interventions (id, farmer_id, officer_id, type, notes, outcome, risk_level, status, scheduled_at, created_at)
```

---

## 📁 Folder & Directory Structure

```
SIH/
├── app/                                 # Next.js 16 App Router pages & API routes
│   ├── api/                             # Backend REST API routes
│   │   ├── agentic/                     # Geolocation autonomous agentic pipeline
│   │   ├── ai/                          # Gemini AI Chat & Alternative Crop endpoints
│   │   ├── auth/                        # Login, Register, Logout endpoints
│   │   ├── farmer/                      # Farmer dashboard & telemetry APIs
│   │   ├── officer/                     # Officer dashboard & Analytics endpoints
│   │   │   └── analytics/               # 9 dedicated distress analytics endpoints
│   │   ├── equipment/                   # Machinery catalog & booking APIs
│   │   ├── facilities/                  # Credit facility APIs
│   │   ├── geocode/                     # Universal geocoding API
│   │   ├── notifications/               # Alert feed & emit APIs
│   │   ├── sarvam/                      # Indic NLP & translation APIs
│   │   └── test-sms/                    # SMS dispatch test endpoint
│   ├── layout.tsx                       # Root layout with Google Translate & contexts
│   └── globals.css                      # Global styles and Tailwind tokens
├── Agriculture officer dashboard/       # Officer portal components & Analytics views
├── Alternative crop/                    # Alternative crop recommendation views
├── Bank Portal/                         # Bank credit facility management views
├── Crop Details/                        # Crop calendar & agronomy views
├── Crop Monitoring page/                # Real-time crop telemetry views
├── Equipment page Dashboard/            # Custom Hiring Center rental views
├── farmer profile/                      # Farmer dossier, land records & task manager
├── Financial Support/                   # Kisan Credit Card & loan application views
├── Full crop guide/                     # Full agronomic production guide
├── Government equipment schemes/        # Government CHC hub & equipment views
├── insurance/                           # PMFBY crop insurance views
├── marketpage/                          # Mandi price feeds & logistics calculator
├── notification page/                   # Notification center views
├── components/                          # Reusable components (LanguageSelector, Maps, Nav)
│   ├── officer/                         # DistrictDistressMap, HighRiskFarmersView, etc.
│   ├── skeletons/                       # Zero-CLS loading skeletons for all pages
│   └── ui/                              # Atomic UI components
├── lib/                                 # Shared utilities
│   ├── db.ts                            # AWS RDS MySQL connection pool & helpers
│   ├── gemini.ts                        # Server-side Google Gemini AI service
│   ├── sarvam-ai.ts                     # Sarvam AI Indic NLP client
│   ├── auth-jwt.ts                      # Cryptographic JWT signing & verification
│   ├── language-context.tsx             # Multilingual state & 22+ Indic dictionaries
│   └── cropGuideData.ts                 # Agronomic knowledge base
├── SMS/                                 # SMS notification dispatch service & templates
├── proxy.ts                             # Next.js security & RBAC proxy middleware
├── next.config.ts                       # Next.js Turbopack configuration
└── package.json                         # Dependencies & scripts
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **npm** or **yarn** or **pnpm**
- **Git**

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Suguda-Thakur-Marndi/SIH.git
   cd SIH
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory (see configuration below).

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be live at [http://localhost:3000](http://localhost:3000).

5. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🔑 Environment Variables Configuration

Create a `.env.local` file with the following keys:

```ini
# AWS RDS MySQL Database Configuration
DB_HOST=sih-mysql.cley86o8g8vx.eu-north-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_rds_password
DB_NAME=sih

# JWT Authentication Secret
JWT_SECRET=smartcrop_super_secure_jwt_secret_key_2026

# Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key

# Sarvam AI Indic NLP API Key
SARVAM_API_KEY=your_sarvam_api_key

# Clerk Authentication Keys (Optional/Integrated)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Automated Verification & Test Suite

The codebase is tested and certified with 0 errors across all linters, typecheckers, and production builds:

```bash
# Run ESLint (0 errors, 0 warnings)
npm run lint

# Run TypeScript Typecheck (0 errors)
npx tsc --noEmit

# Run Next.js Production Build (65/65 routes pass)
npm run build
```

---

## 👥 Contributors & Acknowledgements

Built with ❤️ for **Smart India Hackathon (SIH)** by the **SmartCrop Development Team**. Dedicated to empowering Indian smallholder farmers with cutting-edge artificial intelligence, predictive climate telemetry, and seamless financial inclusion.
