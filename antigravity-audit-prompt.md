# Prompt for Antigravity: Audit README claims against actual code

Paste this into Antigravity in the same repo. Attach the current `README.md` (the PS-02-scoped version with the Compliance Matrix and Scope Notes) as context — this prompt checks whether its claims are true, it does not ask you to rewrite it yet.

---

## Context

I just had a README written for this repo claiming PS-02 compliance: two connected modules, a transparent 3-signal weighted distress formula (0.40 rainfall + 0.35 market + 0.25 loan), removal of all bank/insurance/equipment-rental/loan-origination features, and a low-bandwidth "basic smartphone" mode. Before I treat this README as final, I need you to verify every specific, checkable claim against the actual code — not against what the README says the code does.

Do not fix anything yet. Produce a discrepancy report first. I'll decide what to fix after seeing it.

## Part 1 — Verify the distress-scorer math

Open `lib/distress-scorer.ts` (or wherever the scoring logic actually lives — find it if the path differs).

For each of the three signals, check the actual formula against the specific claim:

1. **`rainfall_risk`** — README claims this is a **deficit percentage**: `(expected_rainfall - actual_rainfall) / expected_rainfall × 100`, scaled to 0–100 with thresholds at ≥50% (severe) and ≥20% (moderate). Confirm:
   - It compares against an expected/seasonal baseline, not a fixed absolute rainfall threshold
   - Where does `expected_rainfall` actually come from — a real seasonal average table, a hardcoded constant, or an API? Flag if it's hardcoded to a single number for all locations/seasons.

2. **`market_risk`** — README claims this is a **price-decline percentage vs. MSP**: `(MSP - modal_price) / MSP × 100`. Confirm:
   - It's comparing against MSP or a trailing average, not flagging low absolute price alone
   - Where does the MSP value come from — a real government MSP table, a hardcoded value, or missing entirely (defaulted to some placeholder)?

3. **`loan_risk`** — README claims a days-remaining scale (≤0 days = 95, ≤7 = 90, ≤15 = 75, ≤30 = 55, >60 = 15). Confirm:
   - The actual thresholds and scores in code match these numbers exactly, or note any drift
   - `loan_due_date` is read from a farmer-declared field with no bank verification/API call attached

4. **Final formula** — confirm the weights in code are exactly `0.40`, `0.35`, `0.25` (summing to 1.00) and that this weighted sum — not an LLM call — is what produces the numeric `score`. If an LLM is involved anywhere in computing the number (not just explaining it), flag this clearly, since it contradicts "simple weighted rule."

## Part 2 — Verify the removed-scope claims

The README's Scope Notes claims these were removed. Check each:

1. Search the `app/` directory for any of: `bank-portal`, `bank-insurance`, `equipment`, `financial-support`, `insurance` folders or route files. List anything found — a leftover folder means it wasn't actually removed, just possibly unlinked from navigation.
2. Search all `.tsx`/`.ts` files for imports or references to components/pages under those removed paths. A dangling reference means the removal was incomplete even if the folder is gone.
3. Check the database schema/migrations for `loans`, `financial_facilities`, `equipment`, `equipment_rentals`, `applications` tables. Confirm they're actually dropped, not just unused-but-present.
4. Confirm `loan_due_date` exists on the farmer table itself (not a table that was supposed to be removed) and that `risk_scores.loan_risk` reads from it directly.
5. Check `package.json` and `.env.local.example`/`.env.example` for Clerk (`@clerk/nextjs`) and InsForge dependencies/env vars. If the README dropped their badges but the dependencies or env var references are still present in code, flag it.
6. Run `npm run build` and report the actual route count. The README claims 57/57 routes — confirm the real number and flag any mismatch.

## Part 3 — Verify the low-bandwidth mode actually functions

The README claims a "Lite 2G Data Saver" mode. Check:

1. Open `lib/bandwidth-context.tsx` — does it actually detect network conditions (e.g. via the Network Information API or a user toggle) and change rendering behavior, or is it a context that's defined but never consumed anywhere?
2. Search for where this context's state is actually read — confirm at least one component (images, map, chat) conditionally changes behavior based on it. If nothing consumes the context's value, flag it as a stub.
3. Check `components/DataSaverToggle.tsx` and the offline banner — confirm they're actually rendered somewhere in the page tree, not just defined and unused.
4. Confirm the skeleton components in `components/skeletons/` are actually applied to the heaviest pages (map, analytics, dashboard) via Suspense boundaries or loading states — not just present in the folder.

## Output format

Produce a table like this, one row per claim checked above:

| Claim | README says | Code actually does | Status |
|---|---|---|---|
| rainfall_risk basis | Deficit % vs seasonal baseline | ... | ✅ Match / ⚠️ Partial / ❌ Mismatch |
| ... | ... | ... | ... |

For every ⚠️ or ❌, include the exact file and line number, and a one-sentence explanation of the gap. End with a short summary: how many claims fully match, how many are partial, how many are false.
