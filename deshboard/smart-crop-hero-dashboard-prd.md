# Product Requirements Document
## Smart Crop — Hero & Dashboard Experience (Frontend)

**Parent PRD:** Smart Crop — Advisory & Farmer Distress Early-Warning Platform (PS-02)
**Scope of this document:** Section 1 (Immersive Farmer Hero) + Section 2 (Smart Farm Dashboard) only
**Reference visual system:** hecta drone landing page (2 reference screenshots) + Smart Crop Dashboard Theme Prompt
**Version:** 1.0 | **Status:** Draft (Hackathon Build)

---

## 1. Purpose

This PRD translates the theme prompt's direction into a buildable spec by locking it to a concrete visual reference (the `hecta` drone site) and mapping every card/stat to real Smart Crop data from the parent PRD (Distress Risk Engine, NDVI monitoring, Advisory Engine). It exists so design and frontend engineering can build Section 1 and Section 2 without re-interpreting the mood board each time.

**Out of scope:** Sections 3–5 (AI assistant, market intelligence, officer view) — covered in the parent PRD, not restyled here.

---

## 2. What the Reference Images Establish

The two reference screenshots correct and sharpen the original theme prompt in three ways:

1. **The UI chrome is NOT heavy glassmorphism.** It's a soft off-white/light-grey matte panel with a subtle gradient, not a frosted blur. Reserve blur for the small floating stat cards only, not the whole nav/hero panel.
2. **The photography treatment is the hero, not a decorative background.** Both references use a shallow depth-of-field trick: grass in sharp focus in the extreme foreground (bottom of frame) or a human subject sharp in the mid-ground, everything else softly blurred, desaturated, and lit with hazy white sky. This is what makes it feel premium rather than stock-photo.
3. **Data is shown as confident, minimal numerals — not charts — in the hero.** Big number + one-line caption. Charts belong to Section 2, not Section 1.

These three corrections are binding for this PRD and take precedence over the original prompt's "glass everywhere" language.

---

## 3. Design Tokens

### 3.1 Color

| Token | Hex | Usage |
|---|---|---|
| `bg-canvas` | `#F2F3EE` | Page background behind hero panel |
| `bg-panel` | `#F7F8F4` → `#EDEEE8` (soft diagonal gradient) | Hero content panel above the grass line |
| `surface-card` | `#FFFFFF` @ 92% opacity | Floating light stat cards (e.g. the "6 / 9 / 10" pills) |
| `surface-dark` | `#1B1E19` | Dark stat card (e.g. "32%", Risk Score card) |
| `accent-lime` | `#D6F24B` | Primary accent — CTA icon chips, active nav pill dot, risk-good indicator |
| `accent-lime-soft` | `#EAF7B8` | Hover states, low-risk chip backgrounds |
| `text-primary` | `#1B1E19` | Headline text, dark-card numerals |
| `text-secondary` | `#6B6F63` | Supporting copy, captions |
| `text-inverse` | `#F7F8F4` | Text on dark cards |
| `risk-high` | `#E4572E` | High-risk state (score > 70) |
| `risk-medium` | `#E0A72E` | Medium-risk state (40–70) |
| `risk-low` | `#6FAE4A` | Low-risk state (< 40) |
| `border-hairline` | `#1B1E19` @ 8% | Card borders — hairline only, never a heavy stroke |

### 3.2 Typography

- **Family:** A humanist grotesk (e.g. `Inter` or `General Sans`) — thin/light weight for display, regular/medium for UI.
- **Display / H1** (hero headline): 56–72px desktop / 34px mobile, weight 300–400, tight tracking (-0.02em), mixed-weight treatment: first clause heavier (500), trailing clause lighter (300) — mirrors "Smart drones for **scanning**, spraying, and precision farming."
- **H2** (section/card titles): 22–28px, weight 500
- **Body:** 15–16px, weight 400, `text-secondary`
- **Numeral / stat display** (big card numbers like "32%", "81/100"): 40–56px, weight 600, tabular-nums
- **Caption / micro:** 11–12px, weight 500, letter-spacing +0.02em, `text-secondary` — used under stat pills

### 3.3 Shape & Elevation

- Panel corner radius: 28px
- Card corner radius: 20–24px
- Pill (nav, CTA, chips): full radius (999px)
- Shadow (light cards): `0 8px 24px rgba(27,30,25,0.08)`
- Shadow (dark cards): `0 12px 32px rgba(27,30,25,0.22)`
- Borders: 1px hairline only, no heavy strokes anywhere

### 3.4 Imagery Treatment (binding spec, derived from references)

- Foreground grass/crop: shot or composited with a shallow-DOF blur gradient — sharp at the very bottom edge of viewport, increasingly soft moving up
- Human subject (farmer): sharp focus, mid-ground, desaturated grade (~15–20% desaturation), hazy white/overcast sky behind — never a saturated "stock photo blue sky"
- A single small sparkle/accent glyph (✦) placed in one bottom corner of full-bleed photo sections — recurring brand motif from both references, use sparingly (max once per viewport)

---

## 4. Section 1 — Immersive Farmer Hero

### 4.1 Layout (desktop, 1440px reference)

```
┌───────────────────────────────────────────────────────────┐
│  [logo]        Home   Risk   Advisory   Market   Schemes   [🔍][👤]  │  ← pill nav, bg-panel
│                                                             │
│   Protect your crop                                        │
│   before risk becomes loss                                 │  ← H1, mixed weight
│   AI-powered crop monitoring, distress prediction,          │
│   and personalized farming guidance.                        │  ← body, text-secondary
│   [ View Farm Health ]   Explore Advisory →                 │  ← dark pill CTA + text link
│                                                             │
│                                                    ┌───────┐│
│                                                    │ 81/100││ ← dark stat card,
│                                                    │ HIGH  ││   bottom-right,
│                                                    │ RISK  ││   floats over grass
│                                                    └───────┘│
│  ┌────┐┌────┐┌────┐                                        │
│  │Farm││NDVI││Adv.│                                         │  ← 3 light stat pills,
│  │78  ││ ↓18││Tody│                                         │    bottom-left, over grass
│  └────┘└────┘└────┘                                         │
├───────────────────────────────────────────────────────────┤
│  [sharp-focus farmer, mid-ground, working in field]         │
│  [blurred crop foreground rising to bottom edge]        ✦   │
└───────────────────────────────────────────────────────────┘
```

### 4.2 Navigation Bar

- Style: pill-shaped, `bg-panel`, floats inset ~24px from top edge, NOT full-width to screen edge
- Left: Smart Crop wordmark + small icon glyph (mirrors `hecta`'s 2×2 grid mark — Smart Crop equivalent: a small leaf/pulse glyph)
- Center: Home (active — shown as filled dark pill matching the `hecta` "Home" treatment) · Risk · Advisory · Market · Schemes
- Right: search icon (circle button), notification/alert icon (circle button), farmer profile avatar (circle photo, green "active" dot if voice-alert delivery succeeded)
- Mobile: collapses to logo + hamburger; bottom tab bar for Home/Risk/Advisory/Market/Profile (large touch targets per parent PRD's low-literacy requirement)

### 4.3 Hero Copy (content, not placeholder)

- **Headline:** "Protect your crop before risk becomes loss" — render "Protect your crop" in heavier weight, "before risk becomes loss" in lighter weight, matching reference's mixed-weight pattern
- **Subhead:** "AI-powered crop monitoring, distress prediction, and personalized farming guidance."
- **Primary CTA:** dark pill button, "View Farm Health" — links to Section 2 anchor scroll, not a separate page (keeps the "scroll from overview to intelligence center" narrative from the theme prompt)
- **Secondary CTA:** text link with arrow, "Explore Advisory →"

### 4.4 Floating Cards (hero) — mapped to real data

| Card | Style | Source field | Content shown |
|---|---|---|---|
| Farm Health Score | Light stat pill (like "6/9/10" cluster) | `RiskScore` inverse, or dedicated health composite | Big number (e.g. "78") + caption "Farm Health" |
| Crop Health (NDVI) | Light stat pill | `/api/ndvi` trend | "↓18%" + caption "NDVI vs last cycle" |
| Today's Advisory | Light stat pill | `/api/weather` + Advisory Engine | Short 3–4 word advisory snippet, e.g. "Delay irrigation today" |
| Distress Risk | **Dark stat card** (mirrors the "32%" card exactly — same position, bottom-right, same size) | `RiskScore.score` | Big numeral "81/100" + risk-color label pill "HIGH RISK" + one-line top reason, e.g. "Rainfall 35% below normal" + small circular lime CTA button (→ opens Risk Details) |

This directly satisfies the parent PRD's Section 6 priority screen requirement ("Farmer Dashboard → Risk Explanation") by surfacing the risk score in the very first viewport, not buried after scrolling.

### 4.5 Background Photography Brief

- Primary hero image: farmer walking/working through a crop field (paddy/wheat depending on demo region — Mayurbhanj paddy per the parent PRD's demo narrative), shot or art-directed to match reference Image 2's composition: subject sharp, mid-frame, hazy overcast sky, desaturated green grade
- Foreground: same crop type, extreme close blur, occupying bottom 25–30% of viewport, transitioning to sharp only at the very bottom pixel row (matches reference Image 1's grass treatment)
- One ✦ sparkle glyph, bottom-right corner, `accent-lime` or white at low opacity

---

## 5. Scroll Transition (Hero → Dashboard)

- Trigger: scroll past 80% of hero viewport height
- Behavior (Framer Motion):
  - Hero panel and floating cards fade + scale down slightly (0.96) and move up (-40px), `duration: 0.4s`, `ease: [0.22, 1, 0.36, 1]`
  - Background photo desaturates further and darkens (brightness 0.9) as dashboard panel scrolls over it, then the photo is replaced by `bg-canvas` solid once Section 2 is fully in view
  - Nav pill persists (sticky), transitions from floating-over-photo to sitting on solid canvas — background crossfades from `bg-panel`-on-photo to `bg-panel`-on-canvas so it never looks like it "pops"
- This is the literal implementation of the theme prompt's "farm overview → farm intelligence center" scroll narrative

---

## 6. Section 2 — Smart Farm Dashboard

### 6.1 Layout (grid, desktop)

12-column grid, 24px gutter, max-width 1280px, on `bg-canvas`.

```
┌───────────────────────────────┬─────────────────────┐
│ Farm Overview Card (span 4)   │ Distress Risk        │
│ - Farmer name, village        │ Intelligence         │
│ - Land size, current crop     │ (span 8, centerpiece)│
│ - Season                      │ - Risk meter          │
├───────────────────────────────┤ - 81/100 HIGH RISK    │
│ Crop Health Monitoring        │ - Reason chips:       │
│ (span 4)                      │   Rainfall / Market /  │
│ - NDVI trend (sparkline)      │   Loan due date       │
│ - Soil moisture                │ - Recommended action  │
│ - Weather condition            │   button              │
│ - Crop stage                   │                       │
└───────────────────────────────┴─────────────────────┘
┌─────────────────────────────────────────────────────┐
│ Recommended Actions (3 floating cards, span 4 each)  │
│ [Switch irrigation] [Apply insurance] [Alt. crop]     │
└─────────────────────────────────────────────────────┘
```

Mobile: single column, Distress Risk card first (highest priority per parent PRD explainability requirement), then Farm Overview, then Crop Health, then Recommended Actions as a horizontally swipeable row.

### 6.2 Farm Overview Card

- Fields: farmer name, village, land size (acres), current crop, season — pulled from `Farmer` + `Crop` Prisma models
- Style: `surface-card`, light, no chart — this card is identity/context only, kept visually quiet so it doesn't compete with the Risk card

### 6.3 Crop Health Monitoring Card

- NDVI trend: small Recharts sparkline/area chart, `accent-lime` fill at low opacity, single stat callout above it (e.g. "↓18% vs 30-day avg")
- Soil moisture: horizontal bar or radial mini-gauge, `risk-medium`/`risk-low` coloring by threshold
- Weather condition: icon + short text (e.g. "Overcast, no rain expected 5 days")
- Crop stage: label pill (e.g. "Flowering stage")

### 6.4 Distress Risk Intelligence (Centerpiece)

This is the card the entire dashboard organizes around — visually it should be the largest, and use the **dark surface** treatment from the hero's "32%"/Risk card, scaled up.

- **Risk meter:** circular or arc gauge, needle/fill colored by `risk-high`/`medium`/`low`, numeral "81/100" in the center at numeral type scale
- **Label:** "HIGH RISK" pill in `risk-high`
- **Reason chips:** three pill chips, one per contributing factor, each showing factor name + its point contribution (e.g. "Rainfall −35% · +28 pts", "Market price −22% · +19 pts", "Loan due in 8 days · +15 pts") — satisfies parent PRD's explainability requirement ("no black-box output")
- **Trend strip:** small inline sparkline showing score history (e.g. `60 → 67 → 72 → 81`) directly under the main numeral
- **Recommended action:** single primary button surfaced directly on this card (not a separate scroll), e.g. "View Insurance Options" — because parent PRD requires insurance to surface proactively when risk is high, not buried in a menu

### 6.5 Recommended Actions (floating cards)

Three equal-width `surface-card` cards below the main grid, each: icon, one-line title, one-line supporting text, chevron/arrow affordance:

1. "Switch irrigation schedule" — from Crop Health signal
2. "Apply for crop insurance" — from Distress Risk (auto-surfaced since score > 70)
3. "Consider alternative crop" — links to Crop Recommendation feature (Groundnut 88% suitability, per parent PRD demo narrative)

---

## 7. Component Inventory

| Component | Variants | Notes |
|---|---|---|
| `NavPill` | floating-on-photo, docked-on-canvas | Same component, background crossfades on scroll |
| `StatPillCard` | light | Used for Farm Health, NDVI, Advisory hero pills |
| `StatDarkCard` | risk / metric | Used for hero Distress card and the dashboard centerpiece (scaled) |
| `RiskMeter` | arc gauge | Recharts `RadialBarChart`, colored by threshold |
| `ReasonChip` | high / medium / low | Small pill, factor + point value |
| `TrendSparkline` | ndvi / risk-history | Recharts `AreaChart`, no axes, single line |
| `ActionCard` | default | Icon + title + subtext + chevron |
| `SectionPanel` | photo-bg, canvas-bg | Wraps Section 1 vs Section 2 background handling |

---

## 8. Motion Spec Summary (Framer Motion)

- Hero cards: staggered fade+slide-up on initial load (`delay: 0.1s` increments, `duration: 0.5s`)
- Dashboard cards: fade+slide-up on scroll-into-view (`whileInView`, `viewport={{ once: true, amount: 0.3 }}`)
- Risk meter fill: animates from 0 to score value on first view (`duration: 1.2s`, `ease: easeOut`)
- No parallax on the grass photo itself beyond the scroll-driven desaturate/darken described in §5 — avoid gimmicky parallax that would hurt low-bandwidth/low-end-device performance (parent PRD mobile/low-bandwidth requirement)

---

## 9. Accessibility & Low-Literacy Requirements (carried from parent PRD)

- All risk/status information conveyed by color must also carry a text label (never color alone) — already reflected in `ReasonChip` and risk labels above
- Minimum touch target 44×44px on all mobile nav/CTA elements
- Hero headline and dashboard numerals must meet 4.5:1 contrast against their card backgrounds — verify `text-primary` on `bg-panel`/`surface-card` and `text-inverse` on `surface-dark`
- All icons in nav/CTAs paired with text labels at mobile breakpoint (icon-only acceptable only at desktop widths where tooltips are available)
- Voice/regional-language delivery path (parent PRD §5.10) should have a visible entry point in the hero nav (small speaker/language icon), not just buried in profile settings

---

## 10. Acceptance Criteria

- [ ] Hero renders full-bleed photo background matching the sharp-subject / blurred-foreground treatment described in §3.4 and §4.5
- [ ] Nav is a floating pill, not full-width, and matches `hecta` reference positioning/spacing
- [ ] Distress Risk card in hero exactly mirrors the dark-card position/size/style of the reference "32%" card (bottom-right)
- [ ] Three light stat pills appear bottom-left, matching reference "6/9/10" cluster style
- [ ] Scroll transition moves from photo-background hero to solid-canvas dashboard per §5, no jump-cut
- [ ] Distress Risk Intelligence card in Section 2 shows numeral, risk label, ≥3 reason chips with point contributions, and a trend strip — no risk score ever renders without visible reasons
- [ ] All colors/type/radii pulled from tokens in §3, no ad-hoc values
- [ ] Mobile layout reorders to Risk-card-first per §6.1
- [ ] Contrast and touch-target checks in §9 pass

---

## 11. Open Questions for Design Review

1. Should the hero background photo be a licensed/stock composite, an AI-generated illustration, or commissioned photography of an actual Mayurbhanj field (ties to authenticity vs. cost/time for hackathon timeline)?
2. Does the dark Distress Risk card in the hero need a live micro-CTA (per reference's small lime circular button), or should hero-level be read-only with the CTA only appearing after scrolling into Section 2?
3. Confirm regional language toggle placement — hero nav icon (proposed here) vs. profile-only (original theme prompt was silent on this).
