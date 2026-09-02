# Prompt for Antigravity: Refactor SmartCrop to PS-02 scope

Paste everything below into Antigravity. Attach the scoped `README.md` (the PS-02-compliant one, titled "SmartCrop — Smart Crop Advisory & Farmer Distress Early-Warning System") as reference context so it can match structure/wording — it's the target end-state for the README specifically.

---

## Context

This is a Next.js + AWS RDS MySQL agricultural platform built for Smart India Hackathon problem statement **PS-02: Smart Crop Advisory & Farmer Distress Early-Warning System**. The codebase currently implements a broader "Agri-FinTech Ecosystem" scope than the problem statement asks for, including a bank/insurance portal, equipment rental marketplace, and government machinery management — none of which PS-02 requires. I need you to refactor the codebase down to exactly what PS-02 asks for, while keeping everything that's a genuine implementation of the PS's own requirements.

**PS-02 verbatim requirement:** "Treat this as two connected modules: an advisory engine (rainfall/soil/crop data in, plain-language recommendation out, in the farmer's language) and a distress-risk scorer (a simple weighted rule or small model combining 2-3 signals like erratic rainfall, price crash, and loan due dates)." Expected outcomes: regional-language advisory (voice + text, works on basic smartphones), predictive distress-risk score with alert routing to local agri-officers, market price + mandi comparison module.

## Goal

Produce a codebase and README where every route, table, and feature maps cleanly to one of: **Module 1 (Advisory Engine)**, **Module 2 (Distress-Risk Scorer)**, shared data layer, or an explicitly-justified differentiator. Nothing should require explaining away to a judge scoring against PS-02.

## Part 1 — Remove (out of PS-02 scope; different problem domain)

Search the codebase for and remove:

1. **Bank & Insurance Institutional Portal**: `/bank-portal/facilities`, `/bank-portal/dashboard`, `/bank-insurance/dashboard`, and any associated API routes, components, and the `bank_partner` role in the RBAC/auth system.
2. **Custom Hiring Center (CHC) equipment rentals**: `/equipment` route, "Government equipment schemes" views, and any booking/availability logic for tractors/harvesters/drones.
3. **Financial Facilities & KCC loan management**: `/financial-support` route — loan *origination*, interest subvention calculators, 1-click loan applications. (Do NOT remove the farmer's `loan_due_date` field itself — see Part 2.)
4. **PMFBY Crop Insurance**: `/insurance` route — policy discovery, premium estimation, claims tracking.
5. **Government machinery pool management** section of `/government/dashboard` (keep the read-only macro overview if it's cheap to keep, but it's not a deliverable — don't invest more time in it).
6. **Database tables**: drop `loans`, `financial_facilities`, `equipment` tables (or migrations for them) if they exist. Confirm `farmers.loan_due_date` and `risk_scores.loan_risk` are NOT inside those tables — they should live directly on `farmers`/`risk_scores`.
7. **Auth/dependencies**: if Clerk (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) and the InsForge Postgres BaaS integration exist only to support the removed portals, remove those dependencies and env vars too. If either is load-bearing for farmer/officer auth or core data, keep it and tell me why.

After removing each item, grep the codebase for dangling imports, dead links in nav components, and orphaned API route handlers referencing the removed features.

## Part 2 — Keep and verify (these ARE PS-02, don't touch structurally)

Confirm these exist and are correctly wired — do not remove or water these down, they're the actual deliverable:

- **Module 1 — Advisory Engine**: weather API ingestion → soil/crop data → AI-generated plain-language recommendation (`/api/ai/chat`, `/api/agentic`, `/api/ai/alternative-crop`, `/api/ai/risk-explanation`).
- **Module 2 — Distress-Risk Scorer**: `risk_scores` table with exactly three signal fields (`rainfall_risk`, `market_risk`, `loan_risk`) combining into one `score`. Confirm the combination is a transparent weighted formula, not an opaque black box — e.g. `score = w1*rainfall_risk + w2*market_risk + w3*loan_risk`. If it currently calls an LLM to *compute* the score rather than to *explain* an already-computed score, refactor so the weighted rule computes the number and the LLM only explains it in plain language.
- **Signal correctness** — this is the part most likely to be subtly wrong, check it carefully:
  - `rainfall_risk` must measure **deviation from expected/seasonal rainfall** ("erratic"), not the raw rainfall reading. If it's currently just thresholding raw rainfall, fix it to compare against a seasonal norm or forecast.
  - `market_risk` must measure a **price decline/crash** (e.g. % drop vs. MSP or a trailing average), not the current absolute price level. If it's currently just flagging low absolute prices, fix it to measure the drop.
  - `loan_risk` must measure **proximity to `loan_due_date`**, not loan amount or loan status. Confirm `loan_due_date` is farmer-self-declared at onboarding (`/onboarding` or `/farmer-profile`), with no bank verification step attached to it.

## Part 3 — Keep as differentiators (justify them in code comments / commit messages, don't cut them)

These go beyond the PS's minimum but map directly to language in the PS text — keep and polish, don't remove:

1. **Sarvam AI Indic voice (TTS/STT)** in the AI Agronomist chat — implements the PS's explicit "voice + text" requirement.
2. **22+ / 14+ Indic language support** — implements "in the farmer's language" beyond a token 2-3 languages.
3. **MapLibre geospatial distress heatmap** — richer rendering of Module 2's output for the officer, not a new module.
4. **Multi-channel SMS + in-app notification pipeline** — implements the PS's "alert routing to local agri-officers" outcome.
5. **Government Schemes Hub** (`/schemes`) — the PS Background text names "delayed government scheme access" as part of the farmer's problem; this hub answers that sentence directly. Keep it, but make sure it's presented as read-only scheme information/eligibility, not application processing (application processing would drift back toward the fintech scope we're cutting).
6. **10-section distress analytics** for officers — deeper development of the risk score, still Module 2, not a new module.

## Part 4 — Close the one real gap

Neither the current code nor README addresses the PS's explicit "works on basic smartphones" / low-bandwidth requirement. Implement at least one of:
- A data-saver/lite mode that reduces image sizes and defers non-critical JS
- Lazy-loading and skeleton states already exist per the folder structure (`components/skeletons/`) — confirm they're actually applied to the heaviest pages (map, analytics) and document this
- Basic offline/poor-connectivity fallback messaging on the advisory and chat pages

Document whichever you implement in the README under a clearly-labeled section — this is worth more to the PS-02 grading than any other single change, since it's explicitly named in the PS and easy for competitors to skip.

## Part 5 — Rewrite the README

Replace the current README with a version scoped to PS-02, structured as:
1. Title reflecting PS-02 (not "Agri-FinTech Ecosystem")
2. An Implementation Notes Compliance table mapping each PS requirement to its implementation status
3. Module 1 section (inputs → processing → output)
4. Module 2 section (the 3 signals, the weighting, the output routing)
5. A short "How the two modules connect" section — they must read as connected, not siloed
6. A Differentiators section listing the six items from Part 3, each with a one-line justification tying it back to specific PS wording
7. Farmer Portal / Officer Portal route lists (only routes remaining after Part 1's removals)
8. Standard sections: routes, API, tech stack, DB schema, setup, env vars, testing
9. A closing Scope Notes section listing what was intentionally removed and why, plus the low-bandwidth gap from Part 4 and how it was addressed

Use the attached scoped README as the structural template — match its section order and tone, updated to reflect the actual code changes above rather than duplicating it verbatim.

## Acceptance checklist

- [ ] No route, page, or nav item references bank portal, insurance, equipment rental, or loan origination
- [ ] `loans`, `financial_facilities`, `equipment` tables removed or confirmed absent; `farmers.loan_due_date` and `risk_scores.loan_risk` intact
- [ ] `rainfall_risk` computed from deviation, not raw value
- [ ] `market_risk` computed from price decline, not absolute price
- [ ] Distress score computed by a transparent weighted formula, not an opaque LLM call
- [ ] Voice/TTS, multilingual, heatmap, SMS pipeline, schemes hub, and analytics all still present and functioning
- [ ] At least one low-bandwidth/basic-smartphone measure implemented and documented
- [ ] `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass after the removals (catch dangling imports)
- [ ] README rewritten per Part 5
- [ ] Summarize every file changed/removed at the end, grouped by Part 1–5 above, so I can review against this checklist
