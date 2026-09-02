# SmartCrop — Antigravity Implementation Prompts

Four in-scope, innovative features for PS-02, ranked by effort vs. payoff. Each prompt is self-contained — paste directly into Antigravity. Build in the order listed; each one reuses existing infrastructure rather than creating parallel systems.

---

## 1. Trend-Based Early Warning (Priority: Build First)

**Effort:** Low | **Payoff:** High | **Why:** Directly implements the PS's own word "predictive" — catches a farmer before they cross the High-risk threshold, not just when they do.

```
Implement trend-based early warning for the distress-risk scorer — this 
should flag farmers whose risk score is RISING SHARPLY even if they 
haven't crossed the High-risk threshold yet, not just farmers who are 
currently above 65-70.

CONTEXT — what already exists (build on this, don't rebuild it):
- lib/distress-scorer.ts computes the 3-signal weighted score 
  (0.40 rainfall + 0.35 market + 0.25 loan)
- app/api/risk/check-all/route.ts already compares currentScore vs 
  previousScore and detects threshold crossings (LOW/MODERATE → 
  HIGH/CRITICAL)
- app/api/farmer/risk/route.ts already stores/returns 30-day historical 
  scores
- risk_scores table has historical rows with calculated_at timestamps

STEP 1 — Show me first:
- The full contents of app/api/risk/check-all/route.ts
- The full contents of app/api/farmer/risk/route.ts  
- The risk_scores table structure (confirm calculated_at exists and 
  how far back history is actually stored)

STEP 2 — Backend: add velocity-based detection
In app/api/risk/check-all/route.ts, add a new check alongside the 
existing threshold-crossing logic:
- Calculate the score 7 days ago (from the same farmer's historical 
  risk_scores rows) vs. the current score
- If the increase is >= 15 points within that 7-day window, flag it 
  as "trending_up: true" regardless of whether the absolute score has 
  crossed the High-risk threshold
- Add a new field to the response/notification payload: 
  trend_direction ('rising' | 'stable' | 'falling') and 
  trend_delta_7d (the numeric point change)
- This should trigger the SAME notification/alert pipeline that 
  threshold-crossing already uses (reuse app/api/notifications/emit, 
  don't build a parallel system) — but with a distinct message type 
  like "RISING_TREND" so officers can tell it apart from a hard 
  threshold breach in their triage queue

STEP 3 — Frontend: make it visible
1. On the Farmer Dashboard (farmer deshboard/deshboard.tsx) — next to 
   the existing risk score display, add a small trend indicator: an 
   up-arrow with the point delta (e.g. "↑ +18 this week") when 
   trend_direction is 'rising', styled with an amber/warning color, 
   similar to how the existing 3-signal breakdown is styled. Show 
   nothing extra when trend is stable/falling.
2. On Risk Detail Page/components/RiskFactorsSection.tsx — add the 
   same trend indicator with slightly more detail (e.g. "Your risk 
   score has risen 18 points in the last 7 days, driven primarily by 
   [whichever of the 3 signals grew most]")
3. On the Officer High-Risk Farmer Directory / Triage queue — add a 
   visual badge (e.g. "⚠ Rising" tag) on farmer rows where 
   trend_direction is 'rising', so officers can see who to watch even 
   if they're not yet in the High band. Sort/filter option to view 
   "Rising Risk" farmers separately from "Currently High Risk."

STEP 4 — Verify:
- Run npx tsc --noEmit and npm run build
- Test with a farmer whose score has actually risen (if test/seed data 
  allows) and confirm the badge/indicator actually appears
- Run git status --short and git diff --stat and show me the real output

Report what you changed, file by file, and show me a screenshot or 
description of how the trend indicator actually looks once built.
```

---

## 2. Block-Level Distress Forecasting (Priority: Build Second)

**Effort:** Low-Medium | **Payoff:** Medium-High | **Why:** Same trend math as #1, applied at the officer/aggregate level — shows which blocks are heading toward crisis, not just which are currently bad.

```
Implement block-level trend forecasting on top of the existing distress 
heatmap — officers should be able to see which blocks are TRENDING 
TOWARD crisis, not just which blocks currently have high distress.

CONTEXT — what already exists (build on this, don't rebuild it):
- app/api/officer/analytics/heatmap/route.ts aggregates current 
  distress scores by block over a 7d/14d window
- Agriculture officer dashboard/analytics/components/DistressHeatmap.tsx 
  renders this as a map/heatmap
- (If Feature #1 "Trend-Based Early Warning" has already been built, 
  reuse its trend_delta_7d calculation logic instead of writing new 
  velocity math — check lib/distress-scorer.ts or 
  app/api/risk/check-all/route.ts first for existing trend logic)

STEP 1 — Show me first:
- Full contents of app/api/officer/analytics/heatmap/route.ts
- Full contents of the DistressHeatmap.tsx component
- Confirm whether Feature #1's trend logic already exists to reuse, 
  or whether this needs its own implementation

STEP 2 — Backend: compare window-over-window block averages
In app/api/officer/analytics/heatmap/route.ts:
- For each block, calculate the average distress score for the CURRENT 
  7d/14d window (already exists) AND the average for the PRECEDING 
  window of the same length (e.g. days 8-14 if current window is days 
  1-7)
- Add a trend_direction field per block: 'worsening' | 'stable' | 
  'improving', based on whether the average moved up/down beyond a 
  small noise threshold (e.g. +/- 3 points = stable)
- Add a trend_delta field showing the numeric point change

STEP 3 — Frontend: visualize the trend
In DistressHeatmap.tsx:
- Add a visual indicator per block distinct from the current 
  color-coded severity — e.g. a small trend arrow icon (↑ worsening, 
  → stable, ↓ improving) overlaid on or next to each block's marker/
  region
- Add a toggle or filter: "Show trending blocks only" that highlights 
  only blocks marked 'worsening', so officers can quickly see where 
  to focus preventive attention even if those blocks aren't the 
  worst currently
- Add a small legend explaining the trend arrows

STEP 4 — Verify:
- Run npx tsc --noEmit and npm run build
- Confirm the heatmap still renders correctly with the new trend layer
- Run git status --short and git diff --stat, show me the real output

Report every file changed and describe how the trend visualization 
looks on the map.
```

---

## 3. Structured Yield-Loss Estimator (Priority: Build if time allows)

**Effort:** Medium | **Payoff:** Medium | **Why:** Gemini already generates yield-impact language inconsistently in prose — this makes it a reliable, structured, demoable number tied to the risk score.

```
Turn the AI's occasional freeform yield-impact commentary into a 
consistent, structured yield-loss estimate tied to the distress score 
— this should appear reliably, not just sometimes when Gemini happens 
to mention it.

CONTEXT — what already exists (build on this, don't rebuild it):
- lib/gemini.ts already generates prose that sometimes includes yield 
  impact language (e.g. "yield penalty may reach 15-20%")
- Crop Monitoring page/components/HarvestSection.tsx shows a static 
  projected yield figure (e.g. "22-25 Quintals/acre")
- lib/distress-scorer.ts has the 3-signal breakdown (rainfall_risk, 
  market_risk, loan_risk) already computed per farmer

STEP 1 — Show me first:
- The relevant section of lib/gemini.ts where yield language currently 
  appears in prompts/responses
- The full contents of HarvestSection.tsx
- Confirm what crop-specific baseline yield data exists (if any) to 
  calculate a loss percentage against

STEP 2 — Backend: structured yield-loss calculation
Add a new function (e.g. in lib/distress-scorer.ts or a new 
lib/yield-estimator.ts) that:
- Takes the farmer's current risk sub-scores (rainfall_risk, 
  market_risk — market doesn't affect physical yield, so likely just 
  rainfall_risk and any soil moisture data) as input
- Maps risk severity to a yield-loss PERCENTAGE RANGE using a simple, 
  transparent rule (not just asking Gemini to guess a number each 
  time) — e.g.:
  - rainfall_risk 0-30: 0-5% expected yield impact
  - rainfall_risk 31-60: 5-15% expected yield impact  
  - rainfall_risk 61-100: 15-30%+ expected yield impact
  (Adjust these bands to whatever's agronomically reasonable — ask me 
  if you're unsure rather than inventing arbitrary numbers)
- Use Gemini ONLY to generate the plain-language explanation of WHY, 
  not to generate the number itself — the number should come from the 
  deterministic rule so it's consistent every time, and the AI adds 
  the human-readable context around it

STEP 3 — Frontend: display it
- Add a "Projected Yield Impact" card on Risk Detail Page showing the 
  percentage range and the plain-language explanation
- Update HarvestSection.tsx to show the ADJUSTED projected yield 
  (baseline yield minus the estimated loss range), not just the 
  static baseline figure

STEP 4 — Verify:
- Run npx tsc --noEmit and npm run build
- Test that the same risk inputs always produce the same yield-loss 
  band (deterministic, not random each time you ask Gemini)
- Run git status --short and git diff --stat, show me the real output

Report every file changed and show me example output for a farmer at 
each risk band.
```

---

## 4. Rainfall-Forecast-Based Irrigation Recommendation (Priority: Build if time allows)

**Effort:** Low-Medium | **Payoff:** Medium | **Why:** Replaces static "delay irrigation" copy with an actual daily recommendation driven by real forecast data — small lift, clearly more useful than static text.

```
Replace static irrigation advisory text with a dynamic daily 
recommendation based on actual rainfall forecast data.

CONTEXT — what already exists (build on this, don't rebuild it):
- weather_observations table has forecast_rainfall data
- Crop Monitoring page/mockData.ts and WeatherForecastSection.tsx 
  currently show STATIC advisory text (e.g. "Moderate rainfall 
  expected... delay irrigation") rather than a computed recommendation
- app/api/farmer/recommendations/route.ts returns static advisory 
  recommendations

STEP 1 — Show me first:
- Full contents of WeatherForecastSection.tsx
- Full contents of app/api/farmer/recommendations/route.ts
- Confirm what forecast_rainfall data is actually available (how many 
  days ahead, what units — mm)

STEP 2 — Backend: simple rule-based irrigation logic
Add a function (e.g. in a new lib/irrigation-advisor.ts) that:
- Takes forecast_rainfall for the next 48 hours + the crop's current 
  growth stage (from crops table) as input
- Applies a simple threshold rule:
  - If forecast rainfall over next 48h >= [X]mm (use a reasonable 
    agronomic threshold — ask me if unsure, don't invent one silently): 
    recommend "Skip irrigation — sufficient rainfall expected"
  - If forecast rainfall is below threshold AND crop stage is water-
    sensitive (e.g. flowering, grain-filling — check 
    CropLifecycleTracker.tsx for stage definitions): recommend 
    "Irrigate today — low rainfall expected during a critical stage"
  - Otherwise: recommend "Irrigation optional — monitor soil moisture"
- Return this as a structured response (recommendation text + 
  confidence/reasoning), not just a Gemini-generated string, so it's 
  consistent and explainable

STEP 3 — Frontend: display it
- Replace the static advisory text in WeatherForecastSection.tsx with 
  the dynamic recommendation
- Style it as a clear, prominent daily action card (e.g. green 
  "Skip Irrigation Today" vs. amber "Irrigate Today") so it reads as 
  an actionable decision, not just informational text
- Show the reasoning briefly underneath (e.g. "Forecast: 12mm expected 
  in next 48h")

STEP 4 — Verify:
- Run npx tsc --noEmit and npm run build
- Test with different forecast values to confirm the recommendation 
  actually changes based on input, not static
- Run git status --short and git diff --stat, show me the real output

Report every file changed and show me example output for both a 
"skip irrigation" and "irrigate today" scenario.
```

---

## Build Order Summary

| Order | Feature | Effort | Reuses |
|---|---|---|---|
| 1 | Trend-Based Early Warning | Low | `check-all/route.ts`, historical scores |
| 2 | Block-Level Distress Forecasting | Low-Medium | Feature #1's trend logic, heatmap route |
| 3 | Structured Yield-Loss Estimator | Medium | Gemini calls, distress-scorer sub-scores |
| 4 | Irrigation Recommendation | Low-Medium | `weather_observations`, crop stage data |

Build #1 and #2 together first — they share trend-calculation logic and give you the strongest, most PS-aligned story ("predictive, not just reactive") for the least total effort.
