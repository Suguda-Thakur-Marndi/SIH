# Antigravity Prompt: Cause-to-Action Mapping Engine

## Context (paste this whole thing into Antigravity)

```
FEATURE: Cause-to-Action Mapping Engine

CONTEXT: We have lib/distress-scorer.ts which computes a farmer's 
distress risk score using: 0.40×Rainfall Deficit + 0.35×Market Crash 
+ 0.25×Loan Due Date proximity. We want to add a NEW, SEPARATE layer 
on top of this — do not touch the scoring formula itself.

GOAL: Given the three existing sub-scores (rainfall, market, loan), 
determine which signal is "dominant" for that farmer and map it to 
a suggested real-world intervention. This must be fully deterministic 
(no AI/LLM call) — a plain lookup/rule function.

============================================
STEP 1 — INVESTIGATE FIRST, DO NOT CODE YET
============================================

Before writing any code, answer these and show me exact file/line 
quotes, same format as before (hardcoded/computed/cited, quote the 
code, no prose summaries):

1. In lib/distress-scorer.ts, are the three sub-scores (rainfall 
   deficit contribution, market crash contribution, loan proximity 
   contribution) currently returned as separate individual values 
   anywhere, or only combined into one final score? Quote the return 
   type/object.

2. Does components/risk/RecommendedActionsView.tsx currently render 
   any per-signal breakdown or suggested action? Quote what it 
   currently displays. I want to know if we're extending an existing 
   slot or building new UI from scratch.

3. In the Officer PriorityTable component, what columns currently 
   exist? Quote the column definitions/headers.

4. Does risk_scores (DB table/schema) currently store the three 
   sub-scores individually, or only the final combined score? Quote 
   the schema.

Wait for me to review these answers before proceeding to Step 2. 
Do not write implementation code yet.
```

---

## Step 2 — Implementation spec (send only after Step 1 answers look right)

```
Based on your answers, implement the following. Ask me before 
proceeding if any of these assumptions don't match what you found:

### A. New file: lib/cause-to-action-mapper.ts

Create a pure function:

  determineDominantCause(subScores: {
    rainfallContribution: number,
    marketContribution: number,
    loanContribution: number
  }): CauseToActionResult

Rules:
- If one contribution is clearly larger than the other two 
  (>15 percentage points ahead of the second-highest — use this 
  exact threshold, flag it to me as a tunable constant, not hidden 
  magic number), classify as SINGLE_CAUSE with that cause as dominant.
- If two contributions are within 15 points of each other and both 
  are meaningfully above the third, classify as COMPOUND_RISK with 
  both named.
- If a sub-score is missing/null (e.g. no loan_due_date on record), 
  exclude it from comparison and flag confidence as "PARTIAL — based 
  on N/3 signals" in the result. Do not silently treat a missing 
  signal as zero risk or ignore its absence.

Lookup table (deterministic, no ML):

| Dominant cause | Officer-facing suggested action | Scheme/reference name |
|---|---|---|
| Rainfall deficit | Flag for drought relief / crop insurance eligibility check; escalate irrigation advisory | PMFBY claim check |
| Market crash | Flag for MSP procurement route; surface nearest better-price mandi | e-NAM / mandi comparison |
| Loan proximity | Flag for loan restructuring / interest subvention referral; prioritize officer contact before due date | Interest subvention scheme |
| Compound (2 causes) | Flag as higher-urgency compound case; suggest combined intervention referencing both applicable actions above | N/A — combine both |

Also generate a SEPARATE farmer-facing plain-language string (NOT 
using scheme names or officer jargon) for each cause, e.g.:
- Rainfall: "Your risk is currently driven mainly by low rainfall — 
  see the irrigation advisory above."
- Market: "Your risk is currently driven mainly by falling market 
  prices — check the mandi comparison before selling."
- Loan: "An upcoming loan due date is a major factor in your current 
  risk level."
- Compound: combine both relevant lines.

These farmer-facing strings must go through our existing translation 
key system (same pattern as other t('key', 'default')  usage in the 
codebase) — do NOT hardcode English strings directly in farmer-facing 
components. Add new keys to lib/translations/en.ts only; list which 
other 13 language files will need the new keys, do not auto-translate 
them.

### B. Wire into backend

- Update lib/distress-scorer.ts (or wherever sub-scores are computed) 
  to also expose the three individual contributions if not already 
  exposed (from Step 1 answer #1).
- Call determineDominantCause() wherever the final risk score is 
  computed and returned to the frontend (both officer analytics 
  endpoints and farmer-facing risk endpoint).
- Do NOT change the underlying 0.40/0.35/0.25 formula or final score 
  value. This is an additive layer only.

### C. Officer PriorityTable — new column

- Add one new compact column: "Suggested Action"
- Render as a short chip/tag only (not a sentence): 
  e.g. "🌧️ Drought Relief", "📉 Price/Mandi", "💰 Loan Referral", 
  "⚠️ Compound"
- If confidence is PARTIAL (missing signal), show a small indicator 
  (e.g. asterisk or muted icon) — do not hide this from the officer.

### D. Officer Risk Detail Page — full breakdown

- Extend RecommendedActionsView.tsx (or build new component if Step 
  1 showed no existing slot) to show:
  - The three sub-score contributions as a simple bar/percentage 
    breakdown (reuse existing UI patterns in the codebase, don't 
    invent a new chart library dependency)
  - The suggested action (full scheme name + one-line reason, 
    e.g. "Rainfall deficit is the dominant driver — 62% of this 
    score")
  - If PARTIAL confidence: explicitly state which signal was 
    unavailable and why the score is based on fewer than 3 signals

### E. Farmer-facing Risk Detail Page — one plain-language line

- Add ONE line using the farmer-facing string from (A), placed near 
  the existing yield-loss/irrigation advisory content on the farmer's 
  Risk Detail Page / HarvestSection area
- Must go through translation system, must NOT use officer terminology 
  (no scheme names, no "compound risk" jargon)

### F. Do NOT touch (out of scope for this task)
- DistressHeatmap.tsx block-level aggregation — skip entirely for now
- The core distress score formula/weights
- Any existing predicted7dScore / trend labeling (already fixed)

============================================
STEP 3 — VERIFICATION (mandatory before I trust this)
============================================

After implementing, answer these — same rigorous format as before, 
quote code, no summaries:

1. Show the exact threshold logic for SINGLE_CAUSE vs COMPOUND_RISK 
   classification — quote the code, confirm the 15-point threshold 
   is a named constant, not a magic number buried inline.

2. Show a concrete example: given rainfallContribution=45, 
   marketContribution=20, loanContribution=10 (hypothetical), what 
   does determineDominantCause() return? Show the actual output object.

3. Confirm: does changing a farmer's underlying risk score in any way 
   change the FINAL numeric score shown elsewhere in the app, or is 
   this purely additive metadata? Quote both before/after usages of 
   the final score to prove it's unchanged.

4. List every file you touched, with a one-line description of what 
   changed in each — I will spot-check with git diff myself.

5. Run npx tsc --noEmit and npm run build. Report exit codes and any 
   errors. Do not tell me it succeeded without showing the actual 
   command output.

Do not proceed past Step 3 without my explicit approval of Step 1's 
answers first.
```
