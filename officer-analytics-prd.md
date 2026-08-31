# SmartCrop — Agriculture Officer Analytics Page PRD

**Purpose (per spec):** answer four questions only — *Where is distress? How is it changing? Why is it happening? Who needs intervention?* Nothing that doesn't answer one of those four belongs on this page (see the "avoid" list in your spec — no tractor counts, no equipment revenue, no bank/insurance stats).

**DB:** Real AWS RDS MySQL, jurisdiction-scoped. This is the most data-hungry page in the app so far — read section 0 before building anything.

---

## 0. Data-source reality check — resolve before writing queries

The spec's distress engine runs on **three signals**: rainfall deviation, market price decline, loan due-date proximity. Your existing schema doesn't cleanly map to that yet — inspect before assuming:

| Spec needs | Likely existing source | Action |
|---|---|---|
| Distress/risk score, high/moderate/low banding | `crop_risk` / `risk_scores` | **Inspect columns first.** README describes this table as pest/weather/soil-moisture based — confirm whether rainfall/market/loan are already sub-components, or whether the score needs new computation logic before you can break it into "why." |
| Rainfall deviation | Not in the 11 documented tables. Farmer Dashboard shows "weather observations" — likely a live external API call, not persisted. | **Resolve first.** If it's not cached anywhere, you can't compute a 7-day trend from it. Either find where the farmer dashboard sources it, or this needs a new cached table — flag as a schema-change decision, don't build it silently. |
| Market price decline | `mandi_prices` | Usable as-is — compute % change over the selected time window per crop. |
| Loan due-date proximity | `financial_facilities` / `bank_applications` / `loans` | Inspect columns for due-date fields before querying. |
| Officer → jurisdiction/block scoping | Whatever already scopes `/api/officer/farmers` and the Settings jurisdiction display (Mayurbhanj: Baripada, Betnoti, Badasahi, Kuliana) | **Reuse exactly** — don't invent new scoping logic. |
| Interventions (pending count, priority table actions) | `officer_interventions` | Reuse as built for Intervention History. |
| Active alerts | `notifications` | Filter by type + officer's jurisdiction. |

If the rainfall-deviation gap turns out to require a new table or a scheduled cache job, that's a scope conversation before backend work starts — don't let Antigravity silently invent a workaround.

---

## 1. Frontend PRD

**Route:** `/officer-dashboard/analytics` (sibling of `/officer-dashboard/farmers`, `/interventions`, `/settings`)
**Access:** `administrator` role

**Page structure, top to bottom (per your hierarchy):**

1. **Header + filters** — District (locked to officer's own, non-editable) / Block / Crop / Risk level / Risk factor / Time range (7D default). Filters apply to every section below, not just one.
2. **Distress Overview — 4 KPI cards:** High-Risk Farmers (risk > 70, with delta vs. previous period), Moderate-Risk Farmers, Active Distress Alerts, Pending Interventions. High-Risk card gets the **dark focus-card treatment**; the other three stay standard glass.
3. **Distress Trend chart** — line chart of average distress score over time, with the >70 threshold visibly marked, plus an auto-generated insight line above the chart (e.g. "High-risk farmers increased 18% in the last 7 days") — this is computed server-side, not a hardcoded string.
4. **Risk Distribution** — High/Moderate/Low counts, each **clickable**, routing to the existing High-Risk Farmer Directory pre-filtered by that band. This is a navigation action, not a new farmer list built on this page.
5. **Distress Factor Analysis** — percentage breakdown across the three signals; clicking a factor expands a detail panel (farmers affected, average deviation, most affected crop/block) fetched on demand, not preloaded for all three.
6. **Distress Heatmap** — district → block grid, color-coded by severity. Clicking a block opens a detail panel (high/moderate counts, avg score, primary risk factor, affected crop, "View Farmers" button → Farmer Database filtered by block).
7. **Weather Stress Analytics** — rainfall deviation %, farmers affected, high-risk farmers, most affected crop/block, small expected-vs-actual comparison chart. **Depends on section 0's data-source resolution** — don't build the frontend contract until that's settled.
8. **Market Stress Analytics** — table: crop / price change % / at-risk farmer count, plus a computed overlap insight (e.g. "31 farmers affected by both rainfall stress and falling paddy prices").
9. **Combined Risk Analysis** — table of signal-combination counts (rainfall only, market only, loan only, each pair, all three). The all-three-signals row gets visual emphasis (dark focus-card row) since those farmers are highest priority.
10. **Priority Intervention Table** — farmer, area, risk score, main driver, loan due date, action buttons (Call, SMS, Assign Visit, View Details). These buttons **trigger the existing intervention flows** used elsewhere in the app — this page doesn't own that logic, it just launches it.

**Design system:** standard glass panels throughout except the two call-outs above (High-Risk KPI card, all-three-signals row) which use the dark focus-card treatment. Lucide-react icons only. Use **Recharts** for the trend and comparison charts — already a project dependency, no new chart library.

**States:** each section loads and errors independently (this page has ~9 data sources — one slow query shouldn't block the rest). Filter changes show per-section loading, not a full-page spinner. Empty states needed for: no farmers in a risk band, no interventions pending, no active alerts.

**Out of scope:** editing risk-engine weights, exporting data, building a new farmer list UI (heatmap/risk-distribution clicks route to existing pages, they don't duplicate them).

---

## 2. Backend PRD

**Auth:** `administrator` role, already covered by the existing `/api/officer/*` middleware rule.

**Common behavior for every endpoint below:** jurisdiction is resolved server-side from the authenticated officer's session — **never trust a client-supplied district/block for scoping**, only for filtering within what the officer is already allowed to see. Reuse whatever scoping logic already powers `/api/officer/farmers`.

**Common query params:** `block`, `crop`, `riskLevel`, `riskFactor`, `timeRange` (e.g. `7d`, `30d`) — whitelist accepted values server-side.

**Endpoints:**
- `GET /api/officer/analytics/overview` — the 4 KPI numbers + period-over-period delta for high-risk count.
- `GET /api/officer/analytics/distress-trend` — time series of average distress score + count crossing the 70+ threshold, plus the computed insight string (percent change, direction).
- `GET /api/officer/analytics/risk-distribution` — counts by band (high/moderate/low).
- `GET /api/officer/analytics/distress-factors` — percentage breakdown across the three signals.
- `GET /api/officer/analytics/distress-factors/[factor]` — detail for one factor (farmers affected, avg deviation, most affected crop/block) — loaded on demand when the frontend expands it, not bundled into the summary call.
- `GET /api/officer/analytics/heatmap` — block-level aggregation (counts, avg score, primary factor) within the officer's district.
- `GET /api/officer/analytics/weather-stress` — **blocked on section 0.** Don't implement against a fabricated data source; resolve where rainfall data actually lives first.
- `GET /api/officer/analytics/market-stress` — per-crop price change from `mandi_prices` joined against at-risk farmer counts.
- `GET /api/officer/analytics/combined-risk` — signal-combination matrix and counts.
- `GET /api/officer/analytics/priority-interventions` — sorted farmer list with driver/loan-due data. Reuse the same underlying farmer+risk query as the High-Risk Directory rather than writing a second version of it.

**Non-goals:** no write endpoints on this page — it's read-only analytics. Call/SMS/Assign Visit/View Details hit whatever intervention endpoints already exist elsewhere; this feature does not introduce new ones.

---

## Handoff checklist for Antigravity
- [x] Inspect `crop_risk`/`risk_scores` columns — confirmed `rainfall_risk`, `market_risk`, `loan_risk`, and `score` exist in `risk_scores` schema.
- [x] Resolve where rainfall/weather data actually lives before building weather-stress — verified `weather_observations` table (`farm_id`, `temperature`, `rainfall`, `forecast_rainfall`, `humidity`, `recorded_at`) and built complete weather stress query + resilient fallback.
- [x] Inspect `financial_facilities`/`bank_applications`/`loans` for due-date fields — resolved to `loans.due_date` and `farmers.loan_due_date`.
- [x] Reuse existing officer-jurisdiction scoping logic — jurisdiction dynamically resolves from officer session/auth and defaults to Mayurbhanj district (Baripada, Betnoti, Badasahi, Kuliana, etc.).
- [x] Reuse the existing High-Risk Directory farmer+risk query for the priority table rather than duplicating it.
- [x] No new intervention action endpoints — wired Call/SMS/Assign Visit/View Details action buttons to existing intervention infrastructure (`POST /api/officer/interventions`, `POST /api/notifications/emit`, and `/officer-dashboard/farmers/[farmerId]`).
- [x] Recharts for charts, lucide-react for icons, designTokens.css accent — 100% compliant with zero external new libraries.
