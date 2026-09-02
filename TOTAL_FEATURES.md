# 📋 SmartCrop — Total Feature Catalog & Persona Value Matrix

> **Comprehensive Inventory of All Features, User Interfaces, Mathematical Models, and Practical Persona Benefits**  
> Built for **Smart India Hackathon (SIH)** — **Problem Statement PS-02**.

---

## 📑 Table of Contents

1. [Executive Summary & Target Personas](#1-executive-summary--target-personas)
2. [Module 1: Smart Crop Advisory Engine Features](#2-module-1-smart-crop-advisory-engine-features)
3. [Module 2: Farmer Distress Early-Warning Scorer Features](#3-module-2-farmer-distress-early-warning-scorer-features)
4. [Mandi Market & Economic Intelligence Features](#4-mandi-market--economic-intelligence-features)
5. [Conversational AI & Multimodal Intelligence Features](#5-conversational-ai--multimodal-intelligence-features)
6. [Government Schemes & Subsidies Discovery Hub Features](#6-government-schemes--subsidies-discovery-hub-features)
7. [Agriculture Extension Officer & Administrator Features](#7-agriculture-extension-officer--administrator-features)
8. [Universal Accessibility, Multilingual & Rural Resilience Features](#8-universal-accessibility-multilingual--rural-resilience-features)
9. [Comprehensive Feature-to-Persona Value Matrix](#9-comprehensive-feature-to-persona-value-matrix)

---

## 1. Executive Summary & Target Personas

SmartCrop is engineered to solve the systemic agricultural crises of **climate vulnerability**, **market price crashes**, **debt pressure**, and **information latency** for smallholder farmers across India.

### Target Personas:
1. **👨‍🌾 Smallholder Farmer (Primary Persona)**: Cultivates 1–5 acres of land; vulnerable to monsoon failures, distress crop sales, and loan deadlines; requires plain-language voice guidance in their native language on basic smartphones.
2. **🏛️ Block Agriculture Extension Officer & KVK Scientist**: Responsible for monitoring 500–2,000 farmers across administrative blocks; needs early-warning triage tools to prioritize emergency field interventions before crop failure or debt default occurs.
3. **📊 District Collector & Agricultural Policy Maker**: Oversees district food security, MSP procurement, and drought relief disbursement; needs macro-level spatial heatmaps and trend analytics.
4. **🏪 Mandi PACS Administrator & Farmer Producer Organization (FPO) Manager**: Manages procurement tokens and collective logistics; needs price transparency and freight net realization tools.

---

## 2. Module 1: Smart Crop Advisory Engine Features

### 2.1 Dynamic 48-Hour Irrigation Advisor
- **Target Persona**: 👨‍🌾 Smallholder Farmer
- **Problem Solved**: Farmers routinely run diesel pumps or borewells blindly, wasting money on fuel and electricity, only for heavy rain to arrive the next morning, causing nitrogen leaching and root waterlogging.
- **How It Works**: Continuously ingests 48-hour forecasted rainfall from OpenWeatherMap/IMD and compares it against soil moisture and crop phenology stage. If $\ge 20\text{mm}$ rain is imminent, it immediately issues a **"⏸️ Skip Scheduled Irrigation"** directive.
- **Quantified Benefit**:
  - **₹450 saved per skip** in diesel pump fuel / electricity costs (on a standard 2.5-acre parcel).
  - **25,000 Liters of groundwater conserved** per skipped irrigation event.
  - Prevents root suffocation during critical panicle initiation and flowering stages.
- **Location**: [`lib/irrigation-advisor.ts`](lib/irrigation-advisor.ts), [`app/crop-monitoring/page.tsx`](app/crop-monitoring/page.tsx)

---

### 2.2 Quantitative Yield & Harvest Loss Estimator
- **Target Persona**: 👨‍🌾 Smallholder Farmer, 🏛️ Extension Officer
- **Problem Solved**: Vague warnings like "expect low yield" leave farmers unable to plan credit repayment, storage, or insurance claims.
- **How It Works**: Executes a multi-stress mathematical heuristic combining weather deficit ($45\%$), soil moisture depletion ($30\%$), and market price stress ($25\%$) to project harvest losses in quantitative metrics:
  - **Projected Loss %**: e.g., $22.5\%$ yield penalty.
  - **Risk-Adjusted Harvest**: e.g., Baseline $37.5\text{ qtl} \to 29.1\text{ qtl}$ expected actual harvest.
  - **Estimated Revenue Loss in ₹**: e.g., $\Delta = ₹19,488$ at MSP rate.
- **Location**: [`lib/yield-estimator.ts`](lib/yield-estimator.ts), [`components/risk/RecommendedActionsView.tsx`](components/risk/RecommendedActionsView.tsx)

---

### 2.3 Crop Phenology & Dynamic Task Calendar
- **Target Persona**: 👨‍🌾 Smallholder Farmer
- **Problem Solved**: Applying fertilizers or pesticides at the wrong crop stage leads to chemical wastage and ineffective pest control.
- **How It Works**: Tracks exact days since sowing (e.g. Day 54 of 120) and phenological milestones (Seedling $\to$ Tillering $\to$ Panicle Initiation $\to$ Flowering $\to$ Grain Filling $\to$ Maturity), generating time-sensitive agronomic tasks.
- **Location**: [`app/crop-details/page.tsx`](app/crop-details/page.tsx), [`Crop Details/Crop Details.tsx`](Crop%20Details/Crop%20Details.tsx)

---

### 2.4 Climate-Resilient Alternative Crop Substitution
- **Target Persona**: 👨‍🌾 Smallholder Farmer, 🏛️ Policy Maker
- **Problem Solved**: Monoculture paddy cultivation under severe drought leads to total crop collapse and financial ruin.
- **How It Works**: Evaluates agro-climatic conditions and recommends drought-tolerant substitute crops (e.g. Finger Millet/Ragi GPU-28, Black Gram/Urad PU-31, Mustard M-27) with side-by-side ROI, water savings ($40-60\%$), and MSP profitability comparisons.
- **Location**: [`app/alternative-crop/page.tsx`](app/alternative-crop/page.tsx), [`Alternative crop/Alternative crop.tsx`](Alternative%20crop/Alternative%20crop.tsx)

---

### 2.5 Comprehensive Agronomic Production Guide with Audio
- **Target Persona**: 👨‍🌾 Smallholder Farmer
- **Problem Solved**: Illiterate or semi-literate farmers struggle to read complex agricultural extension bulletins.
- **How It Works**: Step-by-step verified Package of Practices (PoP) with integrated voice narration button (`CropAudioPlayer`) that reads instructions aloud in the farmer's mother tongue.
- **Location**: [`app/full-crop-guide/page.tsx`](app/full-crop-guide/page.tsx), [`components/CropAudioPlayer.tsx`](components/CropAudioPlayer.tsx)

---

## 3. Module 2: Farmer Distress Early-Warning Scorer Features

### 3.1 Transparent 3-Signal Distress-Risk Scorer
- **Target Persona**: 👨‍🌾 Smallholder Farmer, 🏛️ Extension Officer, 📊 District Collector
- **Problem Solved**: Black-box AI risk models are distrusted by farmers and extension officers. PS-02 mandates a transparent, deterministic rule.
- **How It Works**: Combines three live signals with mathematical transparency:
  $$\text{Distress Score} = (0.40 \times \text{Rainfall Deficit}) + (0.35 \times \text{Mandi Price Crash}) + (0.25 \times \text{Loan Due Date})$$
- **Risk Classification Bands**:
  - 🟢 **LOW (0 – 30)**: Normal seasonal tracking.
  - 🟡 **MODERATE (31 – 70)**: Preventive advisories issued.
  - 🔴 **HIGH (71 – 85)**: Automated alert, officer triage escalation.
  - 🚨 **CRITICAL (86 – 100)**: Immediate SMS dispatch, field visit prioritized.
- **Location**: [`lib/distress-scorer.ts`](lib/distress-scorer.ts), [`app/api/farmer/risk/route.ts`](app/api/farmer/risk/route.ts)

---

### 3.2 7-Day Velocity & Trend Projection Engine
- **Target Persona**: 🏛️ Extension Officer, 📊 District Collector
- **Problem Solved**: Static scores show current distress but miss rapidly deteriorating situations where a farmer's risk jumped $+25\text{ points}$ in 4 days due to combined heatwaves and mandi price drops.
- **How It Works**: Computes $\Delta_{7d} = S_t - S_{t-7}$. Flags velocity spikes ($\ge +15\text{ pts}$) and projects 7-day future distress trajectories ($\text{Score}_{t+7}$) across the district.
- **Location**: [`lib/trend-calculator.ts`](lib/trend-calculator.ts), [`app/officer-dashboard/farmers/page.tsx`](app/officer-dashboard/farmers/page.tsx)

---

### 3.3 Cause-to-Action Remediation Engine
- **Target Persona**: 👨‍🌾 Smallholder Farmer, 🏛️ Extension Officer
- **Problem Solved**: High risk scores cause panic unless accompanied by specific, actionable remedies.
- **How It Works**: Diagnoses the dominant risk driver ($>15\text{ pt gap}$) and automatically prescribes tailored relief:
  - **If Rainfall Driven**: Prescribes foliar osmotic sprays ($2\%\text{ Potassium Nitrate}$) + PMFBY drought claim verification.
  - **If Mandi Crash Driven**: Compares neighboring APMC mandis + PACS MSP procurement token booking.
  - **If Loan Due Driven**: Matches state interest subvention schemes + KCC restructuring relief.
- **Location**: [`lib/cause-to-action-mapper.ts`](lib/cause-to-action-mapper.ts), [`app/risk-details/page.tsx`](app/risk-details/page.tsx)

---

### 3.4 Multi-Channel Emergency Alert Dispatcher
- **Target Persona**: 👨‍🌾 Smallholder Farmer (Offline / Feature Phone)
- **Problem Solved**: 60% of rural Indian farmers do not have active 4G smartphones in the field.
- **How It Works**: Broadcasts high-priority alerts across both in-app dossiers and cellular SMS via Fast2SMS DLT gateway (with automatic MSG91 fallback) in the farmer's regional language.
- **Location**: [`lib/notifications/sms-service.ts`](lib/notifications/sms-service.ts), [`app/notifications/page.tsx`](app/notifications/page.tsx)

---

## 4. Mandi Market & Economic Intelligence Features

### 4.1 Real-Time APMC Mandi vs MSP Comparator
- **Target Persona**: 👨‍🌾 Smallholder Farmer, 🏪 Mandi Trader / PACS Manager
- **Problem Solved**: Local middlemen exploit farmer lack of market awareness by offering rates $30\%$ below fair value.
- **How It Works**: Pulls live mandi modal prices across regional markets and contrasts them against official Central Government MSP benchmarks, highlighting market crashes in red.
- **Location**: [`app/market/page.tsx`](app/market/page.tsx)

---

### 4.2 Net Realization & Freight Calculator
- **Target Persona**: 👨‍🌾 Smallholder Farmer
- **Problem Solved**: Traveling to a distant mandi with a higher price often results in net loss once diesel transport and mandi cess are subtracted.
- **How It Works**: Solves the equation:
  $$\text{Net Realization} = P_{\text{mandi}} - \left(\frac{\text{Distance (km)} \times ₹18/\text{km}}{\text{Quintals Loaded}}\right) - \text{Mandi Cess (1.5\%)}$$
  Instantly tells the farmer whether traveling to Baripada, Betnoti, or Udala yields higher profit.
- **Location**: [`app/market/page.tsx`](app/market/page.tsx), [`components/market/MandiComparator.tsx`](components/market/MandiComparator.tsx)

---

## 5. Conversational AI & Multimodal Intelligence Features

### 5.1 Draggable Green Blur Transparent Floating Bot
- **Target Persona**: 👨‍🌾 Smallholder Farmer, 🏛️ Extension Officer
- **Problem Solved**: Fixed-position chatbots obscure crucial UI elements and graphs on mobile and desktop screens.
- **How It Works**:
  - **Freedom of Movement**: Draggable to ANY coordinate on screen using unified mouse & touch pointer capture (`setPointerCapture`), clamped safely within viewport bounds.
  - **Green Blur Transparent Aesthetic**: Ultra-sleek frosted emerald glassmorphism (`backdrop-blur-2xl`, `bg-emerald-950/80`, neon glow highlights).
  - **State Memory**: Persists dragged position to `localStorage` across page navigations.
  - **Live Distress Ping**: Displays live distress score badge with pulsing notification ring.
- **Location**: [`components/ProactiveAgronomistBot.tsx`](components/ProactiveAgronomistBot.tsx)

---

### 5.2 Voice-In, Voice-Out AI Agronomist (`/ai-chat`)
- **Target Persona**: 👨‍🌾 Smallholder Farmer
- **Problem Solved**: Typing complex agricultural questions on mobile keyboards is difficult for rural farmers.
- **How It Works**: Hands-free voice interface powered by Sarvam AI Speech-to-Text and Text-to-Speech in 14 Indic languages, backed by NVIDIA NIM Llama-3.1-70B agronomic intelligence.
- **Location**: [`app/ai-chat/page.tsx`](app/ai-chat/page.tsx)

---

### 5.3 Multimodal Leaf Photo Pest & Disease Diagnosis
- **Target Persona**: 👨‍🌾 Smallholder Farmer, 🏛️ Extension Officer
- **Problem Solved**: Misidentifying crop diseases (e.g. confusing Bacterial Leaf Blight with Potassium deficiency) leads to improper pesticide application.
- **How It Works**: Farmer takes a leaf photo; NVIDIA NIM Vision model (`meta/llama-3.2-90b-vision-instruct`) analyzes symptoms and outputs disease name, severity %, chemical spray dosage, and organic remedy.
- **Location**: [`lib/nvidia-nim.ts`](lib/nvidia-nim.ts), [`app/ai-chat/page.tsx`](app/ai-chat/page.tsx)

---

## 6. Government Schemes & Subsidies Discovery Hub Features

### 6.1 Scheme Matching & Eligibility Engine
- **Target Persona**: 👨‍🌾 Smallholder Farmer
- **Problem Solved**: Billions in government agricultural subsidies remain uncollected because farmers don't know they are eligible.
- **How It Works**: Matches farmer's landholding size, crop category, and distress level against flagship programs:
  - **PM-KUSUM**: 60% Solar pump subsidy for drought-hit farms.
  - **PMFBY**: Crop insurance claim filing for rainfall deficit $>30\%$.
  - **KALIA / PM-KISAN**: Direct income support disbursements.
  - **DBT Agriculture**: Subsidized seed and fertilizer vouchers.
- **Location**: [`app/schemes/page.tsx`](app/schemes/page.tsx), [`app/schemes/[schemeId]/page.tsx`](app/schemes/[schemeId]/page.tsx)

---

### 6.2 Required Document Checklist Generator
- **Target Persona**: 👨‍🌾 Smallholder Farmer
- **Problem Solved**: Applications are rejected due to missing paperwork.
- **How It Works**: Displays a step-by-step checklist of required documents (Land RoR, Bank Passbook, Aadhaar, Soil Health Card) with application deadlines.
- **Location**: [`app/schemes/[schemeId]/page.tsx`](app/schemes/[schemeId]/page.tsx)

---

## 7. Agriculture Extension Officer & Administrator Features

### 7.1 26-Block GIS Spatial Distress Heatmap
- **Target Persona**: 🏛️ Extension Officer, 📊 District Collector
- **Problem Solved**: Officers cannot visualize which blocks are in acute danger across a large district like Mayurbhanj (26 blocks).
- **How It Works**: MapLibre GL GPU-accelerated choropleth map rendering all 26 block polygons color-coded by distress severity (Green $\to$ Yellow $\to$ Orange $\to$ Red).
- **Location**: [`app/officer-dashboard/map/page.tsx`](app/officer-dashboard/map/page.tsx), [`components/officer/DistrictDistressMap.tsx`](components/officer/DistrictDistressMap.tsx)

---

### 7.2 7-Day Projected Distress Mode
- **Target Persona**: 🏛️ Extension Officer, 📊 District Collector
- **Problem Solved**: Waiting for distress to reach crisis level before taking action causes irreversible crop loss.
- **How It Works**: Heatmap toggle projects where distress will be 7 days from now based on current velocity trajectories, allowing proactive deployment of relief teams.
- **Location**: [`app/officer-dashboard/map/page.tsx`](app/officer-dashboard/map/page.tsx)

---

### 7.3 Priority Vulnerability Triage Queue
- **Target Persona**: 🏛️ Extension Officer / KVK Scientist
- **Problem Solved**: Officers have limited time and need to know exactly which 20 farmers in their block need emergency field visits today.
- **How It Works**: Ranks farmers by composite vulnerability, velocity delta ($\Delta_{7d}$), and dominant distress driver. Supports instant search and block filtering.
- **Location**: [`app/officer-dashboard/farmers/page.tsx`](app/officer-dashboard/farmers/page.tsx)

---

### 7.4 1-Click Field Intervention & SMS Dispatcher
- **Target Persona**: 🏛️ Extension Officer
- **Problem Solved**: Manual paperwork slows down emergency advisory dissemination.
- **How It Works**: 1-click button dispatches localized advisory SMS directly to farmer mobile and logs official field visit records in AWS RDS database.
- **Location**: [`app/officer-dashboard/interventions/page.tsx`](app/officer-dashboard/interventions/page.tsx)

---

### 7.5 10-Section Distress Analytics Suite
- **Target Persona**: 📊 District Collector, 🏛️ Senior Agronomist
- **Problem Solved**: Lack of macro-level intelligence on weather vs market stress correlations.
- **How It Works**: 10 comprehensive analytical panels:
  1. District Macro KPIs (Total farmers, Hectarage, High-risk count).
  2. 30-Day Distress Trajectory Trends.
  3. Risk Distribution Bands (Low, Moderate, High, Critical).
  4. 3-Signal Factor Decomposition.
  5. Weather Stress & Rainfall Deficit Matrix.
  6. Mandi Price Crash vs MSP Volatility.
  7. Compound Risk Cross-Tabulation.
  8. Priority Intervention Dispatch Log.
  9. Crop Hectarage Vulnerability Distribution.
  10. Block-by-Block Comparison Table.
- **Location**: [`app/officer-dashboard/analytics/page.tsx`](app/officer-dashboard/analytics/page.tsx)

---

## 8. Universal Accessibility, Multilingual & Rural Resilience Features

### 8.1 14 Native Indic Languages with 0ms Client Dictionaries
- **Languages**: English, Hindi, Odia, Bengali, Telugu, Tamil, Marathi, Gujarati, Punjabi, Kannada, Malayalam, Assamese, Urdu, Nepali.
- **Benefit**: 0ms instant UI language switching without network calls or API latency.
- **Location**: [`lib/translations/`](lib/translations/), [`components/LanguageSelector.tsx`](components/LanguageSelector.tsx)

---

### 8.2 2G Lite Mode / Data Saver
- **Benefit**: Detects slow 2G/3G connections; disables heavy WebGL/canvas animations, switches charts to compact data tables, and reduces API payload sizes.
- **Location**: [`lib/bandwidth-context.tsx`](lib/bandwidth-context.tsx), [`components/DataSaverToggle.tsx`](components/DataSaverToggle.tsx)

---

### 8.3 Offline Resilience & Local Caching
- **Benefit**: Serves cached crop production guides and emergency helplines even when cellular network drops completely.
- **Location**: [`components/DataSaverToggle.tsx`](components/DataSaverToggle.tsx)

---

## 9. Comprehensive Feature-to-Persona Value Matrix

| Feature Name | Smallholder Farmer 👨‍🌾 | Extension Officer 🏛️ | District Collector 📊 | Mandi / PACS Mgr 🏪 | Primary Code Location |
|:---|:---:|:---:|:---:|:---:|:---|
| **Dynamic 48h Irrigation Advisor** | 🌟 Primary (Saves ₹450 & 25k L) | ℹ️ Secondary | ℹ️ Secondary | — | [`lib/irrigation-advisor.ts`](lib/irrigation-advisor.ts) |
| **Yield & Harvest Loss Estimator** | 🌟 Primary (Planning) | 🌟 Primary (Triage) | 🌟 Primary (Relief) | ℹ️ Secondary | [`lib/yield-estimator.ts`](lib/yield-estimator.ts) |
| **3-Signal Distress Scorer** | 🌟 Primary (Daily Dial) | 🌟 Primary (Triage) | 🌟 Primary (Macro) | — | [`lib/distress-scorer.ts`](lib/distress-scorer.ts) |
| **7-Day Velocity & Projections** | ℹ️ Secondary | 🌟 Primary (Early Warning)| 🌟 Primary (Policy) | — | [`lib/trend-calculator.ts`](lib/trend-calculator.ts) |
| **Draggable Green Blur Bot** | 🌟 Primary (24/7 Voice Q&A) | ℹ️ Secondary | — | — | [`components/ProactiveAgronomistBot.tsx`](components/ProactiveAgronomistBot.tsx) |
| **Multimodal Leaf Diagnosis** | 🌟 Primary (Save Crop) | 🌟 Primary (Verify) | — | — | [`lib/nvidia-nim.ts`](lib/nvidia-nim.ts) |
| **Mandi Freight Net Realization**| 🌟 Primary (Best Price) | — | ℹ️ Secondary | 🌟 Primary (Tokens) | [`app/market/page.tsx`](app/market/page.tsx) |
| **26-Block GIS Heatmap** | — | 🌟 Primary (Targeting) | 🌟 Primary (Macro Map)| — | [`app/officer-dashboard/map/`](app/officer-dashboard/map/) |
| **Priority Triage Queue** | — | 🌟 Primary (Daily Visits)| ℹ️ Secondary | — | [`app/officer-dashboard/farmers/`](app/officer-dashboard/farmers/) |
| **1-Click SMS Dispatcher** | 🌟 Primary (Receives SMS) | 🌟 Primary (Dispatches) | ℹ️ Secondary | — | [`lib/notifications/sms-service.ts`](lib/notifications/sms-service.ts) |
| **10-Section Analytics Suite** | — | 🌟 Primary (Analysis) | 🌟 Primary (Decisions) | ℹ️ Secondary | [`app/officer-dashboard/analytics/`](app/officer-dashboard/analytics/) |
| **14 Indic Languages (0ms)** | 🌟 Primary (Mother Tongue)| 🌟 Primary (Local Dialect)| ℹ️ Secondary | 🌟 Primary | [`lib/translations/`](lib/translations/) |
| **2G Low-Bandwidth Mode** | 🌟 Primary (Works on 2G) | ℹ️ Secondary | — | — | [`lib/bandwidth-context.tsx`](lib/bandwidth-context.tsx) |
| **Government Schemes Hub** | 🌟 Primary (Subsidies) | 🌟 Primary (Referrals) | 🌟 Primary (Budgets) | — | [`app/schemes/page.tsx`](app/schemes/page.tsx) |
