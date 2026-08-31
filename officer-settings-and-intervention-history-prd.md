# SmartCrop — Officer Settings & Intervention History PRDs

Both features use **real AWS RDS MySQL persistence** (confirmed). Attach your RDS connection block (host/port/db/dedicated user + the "inspect before modifying, no destructive migrations" instructions) separately when you hand this to Antigravity — don't paste it into this doc.

**Route naming call-out:** the app currently has both `/officer-dashboard/*` (District Overview, `/officer-dashboard/farmers`) and `/agriculture-officer-dashboard` (Officer Dashboard) as separate top-level trees. This PRD assumes both new pages live under `/officer-dashboard/` as siblings of `/officer-dashboard/farmers`. Confirm before build — if wrong, it's a one-line route change, not a rework.

---

## 1. Officer Settings

### 1.1 Frontend PRD

**Route:** `/officer-dashboard/settings`
**Access:** `administrator` role only (via `proxy.ts`, same as other `/officer-dashboard/*` routes)

**Purpose:** Let the officer manage their own profile, notification preferences, language, and security — the officer-side equivalent of Farmer Profile.

**Layout (single scroll page, glassmorphic panels over the existing framed-shell background):**
1. **Profile card** — name, designation, contact number, email, assigned district/block (Mayurbhanj-style jurisdiction display), read-only avatar/initials. Edit button toggles inline edit mode for the editable fields (contact, email) only — jurisdiction/designation are backend-assigned and read-only.
2. **Notification preferences card** — toggles for: high-distress farmer alerts, weather/emergency broadcasts, new intervention assignments, loan/insurance escalations. Each toggle is its own field, not a single "notifications on/off."
3. **Language preference card** — dropdown using the existing `LanguageSelector` component / `language-context.tsx`, scoped to this officer's account (persisted, not just session-local like the public switcher).
4. **Security card** — change password (current password + new password + confirm), no other auth methods in scope.
5. **Sign out** — reuse existing `smartCropAuth.signOut()` pattern, same as other portals.

**Design system requirements:**
- Reuse `designTokens.css` accent (`#CFE362`) for active toggle states, save-button, and section icons.
- lucide-react icons only, consistent with rest of officer portal.
- Standard glass panel treatment for each card — **not** the dark focus-card treatment, since nothing here is a critical/high-risk alert.
- Each card has its own Save action (not one global Save) so a failed save in one section doesn't block others.

**States to design for:**
- Loading skeleton on initial fetch
- Per-card save-in-progress (button spinner, disable inputs)
- Per-card success toast / inline confirmation
- Per-card error (inline message, keep user's unsaved edits)
- Password change: separate success/error state from profile fields

**Out of scope:** 2FA, session/device management, deleting the account, changing role or jurisdiction (admin-only elsewhere).

---

### 1.2 Backend PRD

**DB:** Real AWS RDS MySQL. **Before writing migrations, inspect the existing `users` table structure** — there is no dedicated officer-profile table in the current schema, so this likely requires a new table rather than touching `users`.

**Proposed schema (get approval before creating — don't run automatically):**
```sql
CREATE TABLE officer_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,                -- FK to users.id
  notify_high_distress BOOLEAN DEFAULT TRUE,
  notify_weather_emergency BOOLEAN DEFAULT TRUE,
  notify_new_assignment BOOLEAN DEFAULT TRUE,
  notify_loan_insurance BOOLEAN DEFAULT FALSE,
  preferred_language VARCHAR(10) DEFAULT 'en',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```
Contact/email edits write to the existing `users` table (inspect its current columns first — don't assume names).

**Endpoints:**
- `GET /api/officer/settings` — returns profile fields (from `users`) + preferences (from `officer_settings`, create a default row on first read if none exists) + jurisdiction (read-only, from wherever officer-jurisdiction is currently stored).
- `PATCH /api/officer/settings/profile` — update contact/email only.
- `PATCH /api/officer/settings/notifications` — update the four boolean flags.
- `PATCH /api/officer/settings/language` — update `preferred_language`.
- `POST /api/officer/settings/password` — verify current password (bcrypt compare against `users`), hash and set new one. Return generic error on wrong current password (don't leak which check failed beyond "current password" vs "new password format").

**Auth:** All routes require `administrator` role, enforced at `/api/officer/*` per the existing middleware table — no new middleware rule needed since `/api/officer/*` is already covered.

**Validation:** email format, phone format (reuse whatever validator the farmer profile endpoint already uses, if one exists — check before writing a new one), password min-length/complexity matching whatever rule `register` already enforces.

**Non-goals:** no audit log of settings changes, no admin-side view of officer settings (that's a separate feature if ever needed).

---

## 2. Officer Intervention History

### 2.1 Frontend PRD

**Route:** `/officer-dashboard/interventions`
**Access:** `administrator` role only

**Purpose:** A searchable log of every intervention the officer has recorded — field visits, emergency advisories, calls — across all their farmers. This is distinct from the existing per-farmer detail view at `/api/officer/farmers/[farmerId]`, which shows one farmer's history; this page shows everything, filterable.

**Layout:**
1. **Filter bar** — date range picker, farmer name/search, intervention type (visit / advisory / call — match whatever enum the `officer_interventions` table actually uses), status (scheduled / completed / cancelled, again matching real column values).
2. **List/timeline view** — one row per intervention: date, farmer name, type icon (lucide), short description, status badge. Use the dark focus-card treatment only for interventions tied to a still-high-risk farmer; standard glass row otherwise.
3. **Detail drawer/modal** on row click — full notes, any logged outcome, linked farmer profile link.
4. **Pagination** — cursor or page-based, whichever the existing `/api/officer/farmers` list endpoint already uses, for consistency.

**States:** loading skeleton, empty state ("no interventions logged yet" vs "no results for these filters" — these are different states), error, and a loading state on filter change distinct from initial load.

**Out of scope:** creating/editing interventions from this page (that stays in the existing field-inspection flow), export/CSV, bulk actions.

---

### 2.2 Backend PRD

**DB:** Real AWS RDS MySQL — this reuses the **existing `officer_interventions` table**. **Inspect its actual columns first** (the README only describes it at a high level as "scheduled field visits, emergency advisories, calls") — don't assume field names before writing queries.

**Endpoints:**
- `GET /api/officer/interventions` — list, scoped to the authenticated officer's jurisdiction/assigned farmers only (not all interventions system-wide). Query params: `startDate`, `endDate`, `farmerId`, `type`, `status`, `page`/`cursor`.
- `GET /api/officer/interventions/[id]` — single intervention detail, with a check that it belongs to a farmer under this officer's jurisdiction (403 if not).

**Auth:** `administrator` role, already covered by existing `/api/officer/*` middleware rule.

**Validation:** date range sanity (start ≤ end), type/status values checked against the actual enum in the table (inspect first), pagination params bounded (e.g. max page size).

**Non-goals:** no write endpoints here — this page is read-only. No cross-officer visibility (an officer never sees another officer's interventions unless that's already how `/api/officer/farmers` scoping works — match its existing scoping logic exactly, don't invent new rules).

---

## Handoff checklist for Antigravity
- [ ] Inspect `users`, `officer_interventions`, and jurisdiction-related tables before any schema change
- [ ] Confirm `officer_settings` table doesn't already exist under a different name
- [ ] No destructive migrations, no schema changes without explicit approval
- [ ] Match existing pagination/filtering patterns from `/api/officer/farmers` rather than inventing new ones
- [ ] Reuse `designTokens.css` accent and lucide-react icon set — no new icon library
