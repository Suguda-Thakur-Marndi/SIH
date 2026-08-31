# 🌱 SmartCrop — AI-Powered Smart Agriculture & Agri-FinTech Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-16.3.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![AWS RDS](https://img.shields.io/badge/AWS-RDS_MySQL-orange?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/rds/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Sarvam AI](https://img.shields.io/badge/Sarvam_AI-Indic_NLP-purple?style=flat-square)](https://www.sarvam.ai/)
[![Multilingual](https://img.shields.io/badge/Languages-22+_Indic_Languages-emerald?style=flat-square)](https://translate.google.com/)

**SmartCrop** is an enterprise-grade agricultural intelligence, climate distress prediction, farm credit facilitation, and government monitoring platform built for the **Smart India Hackathon (SIH)**. The ecosystem seamlessly integrates four critical stakeholder domains: **Smallholder Farmers**, **Agriculture Extension Officers / Administrators**, **Institutional Banks / Insurers**, and **Government Policy Makers**.

---

## 📑 Table of Contents

- [Core Stakeholder Portals](#-core-stakeholder-portals)
- [AI Agronomist & Decision Support Engines](#-ai-agronomist--decision-support-engines)
- [Agriculture Officer Distress Analytics System](#-agriculture-officer-distress-analytics-system)
- [Spatial District Distress Telemetry Map](#-spatial-district-distress-telemetry-map)
- [Multilingual & Real-Time Translation System](#-multilingual--real-time-translation-system)
- [Security, Middleware & Authentication Architecture](#-security-middleware--authentication-architecture)
- [Application Routes & Navigation Directory](#-application-routes--navigation-directory)
- [Backend REST API Endpoints](#-backend-rest-api-endpoints)
- [System Architecture & Technology Stack](#-system-architecture--technology-stack)
- [Database Schema (AWS RDS MySQL)](#-database-schema-aws-rds-mysql)
- [Folder & Directory Structure](#-folder--directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Automated Verification & Test Suite](#-automated-verification--test-suite)

---

## 🎯 Core Stakeholder Portals

### 🧑‍🌾 1. Farmer Portal
- **Real-Time Farm Dashboard (`/dashboard`)**: Live weather observation, soil moisture/temperature telemetry, active crop lifecycle tracking, and localized danger alerts.
- **AI Crop Health & Distress Engine (`/risk-details`)**: Multi-factor 3-signal risk scoring (Rainfall Deficit, Mandi Price Volatility, Loan Proximity) with prescriptive agronomic remedies.
- **Crop Monitoring & Phenology Calendar (`/crop-monitoring`, `/crop-details`)**: Stage-by-stage crop calendar, irrigation schedule optimization, and daily agronomy tasks.
- **Climate-Resilient Alternative Crops (`/alternative-crop`)**: AI engine recommending drought-tolerant crops (Finger Millet, Black Gram, Mustard) with water saving %, expected ROI %, and growth duration.
- **Full Agronomic Guide (`/full-crop-guide`)**: Comprehensive crop production and protection handbook with interactive voice playback and disease diagnostic keys.
- **Live Mandi Rates & Net Realization (`/market`)**: Real-time APMC commodity price feeds, MSP comparisons, and logistics cost calculators across Odisha and nationwide markets.
- **Custom Hiring Center (CHC) Equipment Hub (`/equipment`)**: Tractors, Harvesters, Power Tillers, and Spraying Drones available for hourly/daily rental with instant booking.
- **Financial Facilities & KCC Loans (`/financial-support`)**: Direct discovery, interest subvention calculation, and 1-click loan applications.
- **PMFBY Crop Insurance (`/insurance`)**: Policy matching, premium estimation, localized loss reporting, and insurance claim tracking.
- **Farmer Profile Management (`/farmer-profile`)**: Land parcel records (RoR), soil health parameters, linked credit facilities, and task manager.

### 🧑‍💼 2. Agriculture Extension Officer & Administrator Portal
- **Command Center (`/officer-dashboard`)**: High-level jurisdictional distress metrics, emergency alerts, and recent farmer telemetries.
- **Distress Analytics Engine (`/officer-dashboard/analytics`)**: 10-section analytical dashboard addressing *Where is distress? How is it changing? Why is it happening? Who needs intervention?*
- **Spatial District Distress Map (`/officer-dashboard/map`)**: Real-time geospatial telemetry mapping with cluster markers, isochrone travel distances, and interactive farm detail flyouts.
- **High-Risk Farmers Triage Directory (`/officer-dashboard/farmers`)**: Filterable queue by risk severity (>70 critical score), block/village, crop, and distress driver.
- **Intervention History & Dispatch (`/officer-dashboard/interventions`)**: Log field inspections, dispatch emergency advisories, schedule soil testing, and track resolution statuses.
- **Officer Settings (`/officer-dashboard/settings`)**: Officer credentials, jurisdiction assignment (Mayurbhanj District), alert notification thresholds, and security controls.

### 🏦 3. Bank & Financial Partner Portal
- **Credit & Loan Facility Management (`/bank-portal/facilities`)**: Create, customize, publish, draft, or suspend agricultural loan products with interest subvention details.
- **Loan Applications Pipeline (`/bank-portal/dashboard`)**: Review applicant risk profiles, land records, creditworthiness scores, and approve/reject loan requests.
- **Institutional Risk & Insurance Dashboard (`/bank-insurance/dashboard`)**: Underwriting metrics, active policy tracking, and PMFBY claim adjudication.

### 🏛️ 4. Government & CHC Administration Console
- **Regional Macro Analytics (`/government/dashboard`)**: District and state-level crop distribution, yield projections, and stress indices.
- **CHC Equipment Allocation**: Public machinery pool management and custom hiring center dispatching.
- **Scheme Impact Assessment (`/schemes`)**: Direct Benefit Transfer (DBT) fund disbursement tracking and subsidy delivery auditing.

---

## 🤖 AI Agronomist & Decision Support Engines

SmartCrop integrates Google Gemini 2.5 and Sarvam AI Indic NLP for intelligent, localized advisory:

1. **AI Agronomist Chatbot (`/ai-chat`, `POST /api/ai/chat`)**:
   - Conversational AI capable of diagnosing crop stress symptoms, prescribing exact chemical/fertilizer dosages per acre, and conversing in **English, Hindi, and Odia**.
2. **Alternative Crop Recommendation Engine (`POST /api/ai/alternative-crop`)**:
   - Evaluates soil chemistry, seasonal monsoon deficits, and market MSPs to generate high-profit, water-efficient alternative crop substitutions.
3. **AI Risk Diagnostics (`POST /api/ai/risk-explanation`)**:
   - Transforms raw sensor telemetry (soil moisture, NDVI, rainfall variance, APMC mandi trends) into clear, multi-paragraph plain-language risk explanations.

---

## 📊 Agriculture Officer Distress Analytics System

Implemented strictly following [`officer-analytics-prd.md`](officer-analytics-prd.md):

| Section | Component | Description & Functionality |
|---|---|---|
| **§1. Global Filters** | District / Block / Crop / Risk Level / Risk Factor / Time Range | Independent per-section query loading, Mayurbhanj district locking, and fast filter reset. |
| **§2. Overview KPIs** | [`KPICards.tsx`](Agriculture%20officer%20dashboard/analytics/components/KPICards.tsx) | High-Risk count with period-over-period delta %, Moderate-Risk count, Active Alerts, and Pending Interventions. |
| **§3. Distress Trend** | [`DistressTrendChart.tsx`](Agriculture%20officer%20dashboard/analytics/components/DistressTrendChart.tsx) | Daily average risk score area chart vs high-risk bar volume with a visible `>70` critical threshold line and trend insight banner. |
| **§4. Risk Distribution** | [`RiskDistribution.tsx`](Agriculture%20officer%20dashboard/analytics/components/RiskDistribution.tsx) | High (>70), Moderate (31–70), and Low (≤30) risk bands clickable to filter the high-risk directory. |
| **§5. Distress Factors** | [`DistressFactorsExpanded.tsx`](Agriculture%20officer%20dashboard/analytics/components/DistressFactorsExpanded.tsx) | 3-signal breakdown percentages (Weather, Market, Loan) with on-demand expansion metrics and top affected farmer lists. |
| **§6. Distress Heatmap** | [`DistressHeatmap.tsx`](Agriculture%20officer%20dashboard/analytics/components/DistressHeatmap.tsx) | Block-level severity grid across Mayurbhanj blocks (Baripada, Betnoti, Badasahi, Kuliana, Udala, Karanjia, Rairangpur, Jashipur). |
| **§7. Weather Stress** | [`WeatherStressPanel.tsx`](Agriculture%20officer%20dashboard/analytics/components/WeatherStressPanel.tsx) | Rainfall deviation %, affected farmer counts, and 7-day expected vs actual precipitation comparison chart. |
| **§8. Market Stress** | [`MarketStressPanel.tsx`](Agriculture%20officer%20dashboard/analytics/components/MarketStressPanel.tsx) | Mandi price drops vs MSP, affected farmer counts, and dual-stress (weather + market) overlap insights. |
| **§9. Combined Risk** | [`CombinedRiskMatrix.tsx`](Agriculture%20officer%20dashboard/analytics/components/CombinedRiskMatrix.tsx) | Single, double, and all-three concurrent signal distress matrix highlighting compounded farmer vulnerability. |
| **§10. Priority Actions** | [`PriorityTable.tsx`](Agriculture%20officer%20dashboard/analytics/components/PriorityTable.tsx) | Interactive action dialogs for **Direct Call (`tel:`)**, **SMS Advisory Broadcast**, **Assign Field Visit**, and **View Dossier**. |

---

## 🗺️ Spatial District Distress Telemetry Map

Located at [`/officer-dashboard/map`](app/officer-dashboard/map/page.tsx):
- **MapLibre GL Integration**: High-performance GPU-accelerated spatial vector map with smooth clustering.
- **Telemetry Layers**: Toggle between Weather Stress, Market Volatility, Loan Overdue, and Overall Distress layers.
- **Farmer Nodes**: Color-coded risk markers (Red >70, Amber 31-70, Green ≤30) with rich popups showing land area, crops, phone, and 1-click intervention routing.

---

## 🌐 Multilingual & Real-Time Translation System

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

## 🧭 Application Routes & Navigation Directory

```
Frontend Routes (32 Pages):
├─ /                                     -> Root Landing & Role Discovery
├─ /authentication                       -> Unified Multi-Role Authentication
├─ /onboarding                           -> Step-by-Step Farmer Registration
├─ /dashboard                            -> Farmer Command Center & Farm Telemetry
├─ /crop-monitoring                      -> Real-Time Crop Lifecycle & Soil Health
├─ /crop-details                         -> Crop Calendar, Soil & Irrigation Guide
├─ /risk-details                         -> 3-Signal Crop Distress Diagnostics
├─ /recommended-actions                  -> Agronomic Interventions & Spraying Schedule
├─ /alternative-crop                     -> Climate-Smart Crop Substitution Engine
├─ /full-crop-guide                      -> Comprehensive Agronomic Handbook
├─ /market                               -> APMC Mandi Rates & Net Realization Calculator
├─ /schemes                              -> Central & State Government Schemes Hub
├─ /equipment                            -> Subsidized CHC Machinery Rentals
├─ /financial-support                    -> Kisan Credit Card (KCC) & Credit Discovery
├─ /financial-support/detail             -> Credit Facility Terms & Application
├─ /financial-support/acknowledgement    -> Official Loan Application Receipt
├─ /insurance                            -> PMFBY Crop Insurance & Claims Management
├─ /farmer-profile                       -> Farmer Dossier, RoR Land Records & Tasks
├─ /notifications                        -> Push Alerts & Weather Warnings Hub
├─ /ai-chat                              -> AI Agronomist Interactive Chat
├─ /officer-dashboard                    -> Extension Officer Command Center
├─ /officer-dashboard/analytics          -> 10-Section Distress Analytics Engine
├─ /officer-dashboard/map                -> Spatial District Distress Telemetry Map
├─ /officer-dashboard/farmers            -> High-Risk Farmers Triage Directory
├─ /officer-dashboard/interventions      -> Field Visit & Action History Log
├─ /officer-dashboard/settings           -> Officer Profile, Notifications & Security
├─ /bank-portal                          -> Bank Partner Portal Landing
├─ /bank-portal/dashboard                -> Bank Portfolio Overview & Loan Pipeline
├─ /bank-portal/facilities               -> Credit Products Management
├─ /bank-portal/facilities/add           -> Add Credit Facility Wizard
├─ /bank-insurance/dashboard             -> Insurance Underwriting & Claims Adjudication
└─ /government/dashboard                 -> Government CHC Machinery & DBT Hub
```

---

## ⚡ Backend REST API Endpoints

### 1. Officer Analytics (`/api/officer/analytics/*`)
- `GET /api/officer/analytics/overview` — 4 KPI cards + delta calculations.
- `GET /api/officer/analytics/distress-trend` — Daily time series + dynamic trend insights.
- `GET /api/officer/analytics/risk-distribution` — High, Moderate, Low tier counts.
- `GET /api/officer/analytics/distress-factors` — 3-signal percentage breakdown.
- `GET /api/officer/analytics/distress-factors/[factor]` — On-demand factor expansion metrics.
- `GET /api/officer/analytics/heatmap` — Block-level severity aggregation for Mayurbhanj.
- `GET /api/officer/analytics/weather-stress` — Rainfall variance & expected-vs-actual chart series.
- `GET /api/officer/analytics/market-stress` — Mandi price declines & dual-stress overlaps.
- `GET /api/officer/analytics/combined-risk` — Single, double, and all-three signal matrix.
- `GET /api/officer/analytics/priority-interventions` — Prioritized action queue joined with `loans`.

### 2. AI & Indic NLP Services (`/api/ai/*`, `/api/translate`, `/api/sarvam`)
- `POST /api/ai/chat` — Gemini AI agronomist conversational chat.
- `POST /api/ai/alternative-crop` — Climate-smart crop substitution generator.
- `POST /api/ai/risk-explanation` — Plain-language risk diagnostics generator.
- `POST /api/translate` — Sarvam / Indic neural translation.
- `POST /api/sarvam` — Sarvam AI multi-modal translation, TTS, and language detection.

### 3. Authentication & User Management (`/api/auth/*`, `/api/users/*`)
- `POST /api/auth/login` — Bcrypt credential check + JWT token issuance.
- `POST /api/auth/register` — Multi-role user registration with DB persistence.
- `POST /api/auth/logout` — Cookie invalidation & session cleanup.
- `POST /api/users/[id]/approve` — Administrator user approval.
- `POST /api/users/[id]/reject` — Administrator user rejection.

### 4. Farmer Services & Marketplace (`/api/farmer/*`, `/api/equipment/*`, `/api/facilities/*`)
- `GET /api/farmer/dashboard` — Live farm telemetry and distress metrics.
- `GET /api/farmer/risk` — Multi-factor risk scores.
- `GET /api/farmer/recommendations` — Prescribed agronomic tasks.
- `GET /api/farmer/[id]` — Farmer dossier and linked land parcels.
- `GET /api/equipment` — Subsidized machinery catalog.
- `GET /api/facilities` — Bank loan facilities with subventions.
- `GET /api/notifications` — Real-time notification feed.

---

## 🏗️ System Architecture & Technology Stack

| Layer | Technologies Used | Purpose |
|---|---|---|
| **Frontend Framework** | **Next.js 16.3.2 (App Router)** with **React 19.2.8** | Server-side rendering, streaming SSR, and client interactivity. |
| **Styling & UI** | **Tailwind CSS v4**, Glassmorphism CSS, Lucide React | Clean, modern, responsive interface with customized light & dark modes. |
| **Data Visualization** | **Recharts**, MapLibre GL | Dynamic charts, area curves, composed trend lines, and geospatial maps. |
| **AI & NLP** | **Google Gemini 2.5**, **Sarvam AI Indic NLP** | Conversational agronomist, crop recommendations, and Indic voice synthesis. |
| **Database** | **AWS RDS MySQL 8.0** & **Prisma ORM** | ACID transactional storage for farmers, crops, telemetry, loans, and interventions. |
| **Authentication** | **Signed JWTs (HS256)**, **bcryptjs**, HTTP Cookies | Secure role-based session and access token handling. |
| **Realtime** | Socket.IO Client / Server | Live geolocation tracking and instant alert broadcasting. |

---

## 🗄️ Database Schema (AWS RDS MySQL)

The platform is backed by a fully normalized MySQL relational database hosted on AWS RDS:

```sql
users (id, email, name, phone, username, password, role, account_status, profile_id, metadata, created_at)
farmers (id, user_id, name, phone, email, password_hash, district, village, state, land_area, soil_type, loan_amount, loan_due_date, language, created_at)
farms (id, farmer_id, name, area, soil_type, village, district, state, created_at)
crops (id, farm_id, farmer_id, name, variety, season, stage, sowing_date, harvest_date, health_status, created_at)
risk_scores (id, farm_id, farmer_id, rainfall_risk, market_risk, loan_risk, score, calculated_at, created_at)
crop_risk (id, crop_id, overall_risk, pest_risk, weather_risk, market_risk, soil_moisture_risk, risk_factors, recommendations, created_at)
loans (id, farmer_id, bank_id, loan_type, principal_amount, outstanding_amount, interest_rate, due_date, status, created_at)
financial_facilities (id, bank_id, title, category, interest_rate, max_amount, tenure_months, subvention_available, status, created_at)
equipment (id, name, type, owner, location, price_per_hour, availability, specifications, created_at)
mandi_prices (id, crop_name, market_name, district, state, modal_price, min_price, max_price, msp, recorded_at)
weather_observations (id, farm_id, district, temperature, rainfall, forecast_rainfall, humidity, recorded_at)
notifications (id, farmer_id, title, message, category, priority, is_read, source_feature, created_at)
officer_interventions (id, farmer_id, officer_id, type, notes, risk_level, status, scheduled_at, created_at)
```

---

## 📁 Folder & Directory Structure

```
SIH/
├── app/                                 # Next.js 16 App Router pages & API routes
│   ├── api/                             # Backend REST API routes
│   │   ├── ai/                          # Gemini AI Chat & Alternative Crop endpoints
│   │   ├── auth/                        # Login, Register, Logout endpoints
│   │   ├── farmer/                      # Farmer dashboard & telemetry APIs
│   │   ├── officer/                     # Officer dashboard & Analytics endpoints
│   │   │   └── analytics/               # 9 dedicated distress analytics endpoints
│   │   ├── equipment/                   # Machinery catalog & booking APIs
│   │   ├── facilities/                  # Credit facility APIs
│   │   ├── notifications/               # Alert feed & emit APIs
│   │   └── sarvam/                      # Indic NLP & translation APIs
│   ├── (portals)/                       # Route groups for Farmer, Officer, Bank, Gov
│   ├── layout.tsx                       # Root layout with Google Translate & contexts
│   └── globals.css                      # Global styles and Tailwind tokens
├── Agriculture officer dashboard/       # Officer portal components & Analytics views
├── Alternative crop/                    # Alternative crop recommendation views
├── Bank Portal/                         # Bank credit facility management views
├── Crop Details/                        # Crop calendar & agronomy views
├── Crop Monitoring page/                # Real-time crop telemetry views
├── Equipment page Dashboard/            # Custom Hiring Center rental views
├── farmer deshboard/                    # Farmer command center views
├── farmer profile/                      # Farmer dossier, land records & task manager
├── Financial Support/                   # Kisan Credit Card & loan application views
├── Full crop guide/                     # Full agronomic production guide
├── Government equipment schemes/        # Government CHC hub & equipment views
├── insurance/                           # PMFBY crop insurance views
├── marketpage/                          # Mandi price feeds & logistics calculator
├── notification page/                   # Notification center views
├── components/                          # Reusable components (LanguageSelector, Maps, Nav)
├── lib/                                 # Shared utilities
│   ├── db.ts                            # AWS RDS MySQL connection pool & helpers
│   ├── gemini.ts                        # Server-side Google Gemini AI service
│   ├── sarvam-ai.ts                     # Sarvam AI Indic NLP client
│   ├── auth-jwt.ts                      # Cryptographic JWT signing & verification
│   ├── language-context.tsx             # Multilingual state & 22+ Indic dictionaries
│   └── cropGuideData.ts                 # Agronomic knowledge base
├── scripts/                             # Verification, migration & seeding scripts
├── proxy.ts                             # Next.js security & RBAC proxy middleware
├── next.config.ts                       # Next.js configuration with security headers
└── docker-compose.yml                   # Container orchestration config
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
   Create `.env.local` in the root directory (refer to [Environment Variables](#-environment-variables-configuration) below).

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🔑 Environment Variables Configuration

Create a `.env.local` file with the following variables:

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

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Automated Verification & Test Suite

Run the full end-to-end automated verification script:

```bash
node scripts/test-full-project.mjs
```

This tests **all 32 frontend pages**, **all 5 AI & translation engines**, and **all 19 backend REST APIs** with 100% automated assertion reporting.

---

## 👥 Contributors & Acknowledgements

Built with ❤️ for **Smart India Hackathon (SIH)** by the **SmartCrop Development Team**. Dedicated to empowering Indian farmers with cutting-edge artificial intelligence, predictive climate telemetry, and seamless financial inclusion.
