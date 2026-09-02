# SMARTCROP — AUTONOMOUS FULL APPLICATION AUDIT, TEST, FIX & VERIFY PROMPT

## ROLE

You are an autonomous senior full-stack engineer, QA engineer, security tester, UI/UX reviewer, and debugging agent.

You are working on the **SmartCrop — Smart Crop Advisory & Farmer Distress Early-Warning System**.

I am providing you with the project's README/specification file. Treat that file as the **primary source of truth for the intended functionality and scope**.

Your job is NOT simply to inspect the code.

You must:

1. Understand the complete specification.
2. Inspect the entire repository.
3. Discover every frontend route and backend API.
4. Start the application.
5. Automatically visit and test every page.
6. Test authentication and role-based access.
7. Test forms, buttons, navigation, APIs, loading states, errors, and data flows.
8. Test multilingual functionality.
9. Test responsive behavior.
10. Identify implementation gaps against the README.
11. Fix problems you discover.
12. Re-run tests after every meaningful fix.
13. Continue until the application is stable.
14. Produce a final audit report describing everything tested, fixed, and still blocked.

Do not stop after finding the first issue.

---

# 1. SOURCE OF TRUTH

Read the supplied README completely before modifying anything.

The README describes SmartCrop as two connected modules:

### Module 1 — Advisory Engine

Expected flow:

Weather + soil + crop information

→ processing/advisory engine

→ plain-language recommendation

→ farmer's selected language

→ text + voice output.

### Module 2 — Distress-Risk Scorer

Expected signals:

- rainfall deviation / erratic rainfall
- mandi price decline / price crash
- loan due-date proximity

These should produce:

`rainfall_risk`

`market_risk`

`loan_risk`

→ weighted score from 0–100

→ Low / Moderate / High risk

→ officer alert/intervention workflow.

The README explicitly expects these three signals and a transparent weighted scoring model.

Do not replace this architecture with an unrelated implementation.

---

# 2. FIRST PHASE — REPOSITORY DISCOVERY

Before changing code, inspect the entire project.

Check:

- package.json
- next.config.*
- tsconfig.json
- middleware
- app/
- pages/
- components/
- lib/
- hooks/
- services/
- API routes
- database code
- authentication code
- translation files
- environment handling
- public/
- configuration
- tests
- scripts
- Docker configuration
- deployment configuration

Build an internal inventory containing:

### Frontend

Every discovered:

- page
- route
- dynamic route
- layout
- loading page
- error page
- not-found page
- protected page

### Backend

Every:

- API endpoint
- HTTP method
- authentication requirement
- request parameters
- response structure
- database interaction
- external API interaction

### Database

Verify the implementation against the expected entities:

- users
- farmers
- farms
- crops
- risk_scores
- crop_risk
- mandi_prices
- weather_observations
- notifications
- officer_interventions

The expected schema is defined in the README.

Do not assume that a feature exists merely because a file or component has a matching name.

Verify actual functionality.

---

# 3. RUN THE APPLICATION

Determine the correct commands from package.json.

Install dependencies if necessary.

Start the development server.

If the application cannot start:

1. Capture the exact error.
2. Determine the root cause.
3. Fix it.
4. Restart.
5. Verify again.

Do not continue pretending the application works if the server is broken.

Also run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

These are explicitly listed as verification requirements.

Fix all errors that are caused by the project.

---

# 4. ROUTE DISCOVERY

Compare the actual routes in the codebase against the README.

The expected route set includes:

```text
/
 /authentication
 /onboarding
 /dashboard
 /crop-monitoring
 /crop-details
 /risk-details
 /recommended-actions
 /alternative-crop
 /full-crop-guide
 /market
 /schemes
 /schemes/[schemeId]
 /ai-chat
 /farmer-profile
 /notifications

 /officer-dashboard
 /officer-dashboard/analytics
 /officer-dashboard/map
 /officer-dashboard/farmers
 /officer-dashboard/interventions
 /officer-dashboard/settings

 /admin/dashboard

 /unauthorized
```

These routes and their intended responsibilities are specified in the README.

For every route:

- open it directly
- navigate to it through the UI
- refresh it
- test browser back/forward
- verify no console errors
- verify no uncaught exceptions
- verify correct page rendering
- verify data loading
- verify loading states
- verify empty states
- verify error states
- verify navigation
- verify buttons
- verify forms
- verify links
- verify route protection

If a route does not exist but is required by the README:

**IMPLEMENT IT**, provided that doing so remains within the documented scope.

---

# 5. AUTOMATED PAGE-BY-PAGE TESTING

For EVERY route, perform an actual browser-level test.

Do not merely inspect source code.

For each page:

## A. Initial rendering

Check:

- page loads successfully
- no blank screen
- no hydration error
- no React error
- no Next.js error
- no infinite loading
- no broken images
- no missing icons
- no malformed layout

## B. Console

Check browser console for:

- errors
- warnings
- hydration problems
- failed requests
- CORS problems
- JavaScript exceptions

Fix meaningful errors.

## C. Network

Check:

- API requests
- HTTP status codes
- failed requests
- duplicate requests
- unnecessary requests
- authentication failures
- malformed payloads
- incorrect API URLs

## D. UI interaction

Click every meaningful:

- button
- link
- tab
- dropdown
- checkbox
- radio
- menu
- modal
- card
- action
- pagination control
- filter
- search field

Verify that each performs the intended action.

Do not click destructive actions with real production consequences.

Use safe test data.

---

# 6. TEST AUTHENTICATION COMPLETELY

Authentication is a critical workflow.

Test:

### Unauthenticated user

Attempt to access:

```text
/dashboard
/farmer-profile
/crop-monitoring
/crop-details
/risk-details
/officer-dashboard
/officer-dashboard/analytics
/officer-dashboard/map
/officer-dashboard/farmers
/officer-dashboard/interventions
/officer-dashboard/settings
/admin/dashboard
```

Verify protected routes redirect to:

```text
/authentication
```

The README specifies this behavior.

### Farmer

Log in as farmer.

Verify access to:

- farmer dashboard
- crop pages
- risk details
- market
- schemes
- AI chat
- profile
- notifications

Attempt officer/admin routes.

Verify unauthorized users are redirected to:

```text
/unauthorized
```

### Officer

Verify officer access to:

```text
/officer-dashboard
/officer-dashboard/analytics
/officer-dashboard/map
/officer-dashboard/farmers
/officer-dashboard/interventions
/officer-dashboard/settings
```

Verify farmer-only/admin-only restrictions.

### Administrator

Verify:

```text
/admin/dashboard
```

and administrator access where specified.

### Logout

Test:

- logout
- session invalidation
- browser refresh after logout
- direct protected-route access after logout

Ensure protected data cannot remain accessible through stale client state.

---

# 7. TEST FARMER ONBOARDING

Test the complete onboarding workflow.

Verify fields including:

- farmer information
- land information
- soil type
- crop information
- language
- loan due date

The README identifies these as onboarding inputs.

Test:

- valid submission
- missing fields
- invalid fields
- invalid dates
- invalid land area
- duplicate registration
- API failure
- database failure
- successful submission
- redirect after onboarding

Verify data is actually persisted.

Do not accept UI success if the backend failed.

---

# 8. TEST FARMER DASHBOARD

Open:

```text
/dashboard
```

Verify the dashboard actually uses the expected Module 1 data.

Test:

- weather information
- crop information
- soil information
- risk information
- recommendations
- loading state
- empty state
- API failure
- refresh
- navigation
- language rendering

The README describes the dashboard as the Farmer Command Center and Module 1 interface.

---

# 9. TEST CROP MONITORING

Test:

```text
/crop-monitoring
/crop-details
```

Verify:

- crop information
- growth stage
- sowing date
- harvest date
- soil information
- crop health
- irrigation guidance
- task/calendar functionality

Verify data flows correctly into the advisory system.

---

# 10. TEST DISTRESS RISK

Test:

```text
/risk-details
```

Verify the system displays understandable information about:

- rainfall risk
- market risk
- loan risk
- overall score
- risk band
- recommendations

The expected score bands are:

```text
Low       <= 30
Moderate  31–70
High      > 70
```

The README specifies the score as a 0–100 weighted combination.

IMPORTANT:

Inspect the actual implementation.

Confirm:

```text
score =
    w1 * rainfall_risk +
    w2 * market_risk +
    w3 * loan_risk
```

or an equivalent transparent weighted formula.

Do NOT accept a mysterious AI-generated score.

Gemini may explain the score, but it must not secretly replace the deterministic risk scorer.

---

# 11. VERIFY RAINFALL RISK

Inspect the implementation.

The system must measure:

**deviation / erratic rainfall**

rather than simply:

**amount of rainfall.**

The README explicitly calls this out as something that needs verification.

Test representative cases:

### Normal rainfall

Expected:

low rainfall risk.

### Large deviation from expected rainfall

Expected:

higher rainfall risk.

### Extreme rainfall deficit/excess

Expected:

high rainfall risk where appropriate.

Document the formula actually used.

If incorrect, fix it.

---

# 12. VERIFY MARKET RISK

Verify that market risk represents:

**price decline / crash**

rather than simply:

**current price level.**

The README explicitly requires this distinction.

Test:

- price near/above MSP
- price below MSP
- recent price decline
- significant price crash
- missing price data

Ensure `market_risk` behaves logically.

---

# 13. VERIFY LOAN-DUE-DATE RISK

Verify:

```text
farmers.loan_due_date
```

is used as the source.

Risk should be based on:

**proximity to due date**

not:

- loan amount
- loan origination
- arbitrary loan status

The README explicitly says the loan due date is farmer-declared and used as a distress signal.

Test:

- far future due date
- approaching due date
- due today
- overdue date
- missing due date

Verify risk changes logically.

---

# 14. TEST OFFICER DASHBOARD

Test:

```text
/officer-dashboard
/officer-dashboard/analytics
/officer-dashboard/map
/officer-dashboard/farmers
/officer-dashboard/interventions
/officer-dashboard/settings
```

Verify the officer portal contains actual Module 2 functionality.

Test:

- distress overview
- risk distribution
- trends
- rainfall stress
- market stress
- combined risk
- priority interventions
- map
- farmer directory
- filters
- sorting
- searching
- farmer details
- intervention creation
- intervention status
- settings
- alert thresholds

The README defines these officer functions explicitly.

---

# 15. TEST 26-BLOCK GEOSPATIAL FUNCTIONALITY

The README expects a geospatial distress map covering all 26 Mayurbhanj blocks.

Verify:

- map renders
- MapLibre initializes correctly
- map tiles load
- markers/layers render
- risk levels are represented correctly
- block selection works
- popup/details work
- no API key errors
- no browser console errors
- map works after refresh

If real data is unavailable, use safe development/mock data rather than silently showing a broken map.

Do not fabricate production claims.

---

# 16. TEST AI AGRONOMIST

Test:

```text
/ai-chat
```

and relevant APIs.

Verify:

```text
POST /api/ai/chat
```

Test:

- normal farmer question
- crop question
- weather question
- soil question
- risk question
- empty message
- very long message
- API timeout
- AI service failure
- malformed response

Verify:

- text response
- appropriate language
- loading state
- error state
- retry
- conversation behavior

---

# 17. TEST ALTERNATIVE CROP

Test:

```text
/alternative-crop
```

and:

```text
POST /api/ai/alternative-crop
```

Verify recommendations are actually generated and displayed.

Check:

- crop substitution
- climate reasoning
- water-saving comparison
- yield comparison
- loading
- API errors
- invalid input

---

# 18. TEST RISK EXPLANATION

Test:

```text
POST /api/ai/risk-explanation
```

Verify that the endpoint explains existing risk information in farmer-friendly language.

Do not allow the explanation layer to silently alter the underlying numerical risk score.

---

# 19. TEST MARKET

Test:

```text
/market
```

Verify:

- mandi prices
- min price
- modal price
- max price
- MSP
- comparison
- crop selection
- filtering
- loading
- empty state
- API failure

Verify market information can feed the distress-risk system.

---

# 20. TEST GOVERNMENT SCHEMES

Test:

```text
/schemes
/schemes/[schemeId]
```

Verify:

- listing
- search/filter if present
- scheme details
- eligibility
- navigation
- invalid scheme ID
- not-found behavior
- loading/error states

---

# 21. TEST FARMER PROFILE

Test:

```text
/farmer-profile
```

Verify:

- land
- soil
- language
- crop information
- loan due date
- profile retrieval
- editing if supported
- persistence
- validation

Do not expose information belonging to another farmer.

---

# 22. TEST NOTIFICATIONS AND ALERT ROUTING

Test:

```text
/notifications
```

and:

```text
POST /api/notifications/emit
POST /api/notifications/sms
POST /api/risk/check-all
POST /api/disaster/check
```

Verify:

- notification creation
- notification display
- read/unread state
- priority
- source feature
- risk-triggered notifications
- SMS workflow
- failure handling

The README identifies notifications and SMS as part of the Module 2 alert-routing outcome.

Do not send real SMS during automated testing unless explicitly configured for a test environment.

---

# 23. TEST ALL BACKEND APIs

Build a complete API test matrix.

The README lists APIs including:

```text
/api/officer/analytics/*
/api/ai/chat
/api/agentic
/api/ai/alternative-crop
/api/ai/risk-explanation
/api/translate
/api/sarvam

/api/auth/login
/api/auth/register
/api/auth/logout
/api/profile

/api/users/[id]/approve
/api/users/[id]/reject

/api/notifications/emit
/api/notifications/sms
/api/risk/check-all
/api/disaster/check

/api/farmer/dashboard
/api/farmer/risk
/api/farmer/recommendations
/api/farmer/[id]
/api/farmer/register
/api/geocode
```

These are explicitly documented in the README.

For EVERY API verify:

- correct HTTP method
- authentication
- authorization
- validation
- success response
- error response
- malformed input
- missing input
- nonexistent resource
- database failure
- external service failure
- response shape
- status code

Do not only test APIs from the UI.

---

# 24. SECURITY AUDIT

Check for:

- authentication bypass
- role escalation
- unauthorized API access
- IDOR
- exposed passwords
- exposed secrets
- JWT validation problems
- insecure cookies
- missing HttpOnly
- missing SameSite
- unsafe client-side authorization
- SQL injection risks
- XSS
- unsafe HTML rendering
- sensitive data in API responses
- secrets in frontend code
- insecure environment-variable usage

The documented authentication uses signed JWTs and bcrypt password hashing with HttpOnly/SameSite session cookies.

Never print actual secrets in the final report.

If `.env` contains secrets, do not expose them.

---

# 25. MULTILINGUAL AUDIT

This is a major requirement.

The README specifies:

- client UI dictionaries
- 22+ Indian language support
- Google Translate fallback
- Sarvam AI translation
- text-to-speech
- farmer-language advisory output.

Discover every supported language from the actual project.

For EACH supported language:

1. Change language.
2. Visit every major page.
3. Verify navigation labels.
4. Verify buttons.
5. Verify forms.
6. Verify headings.
7. Verify dashboard content.
8. Verify notifications.
9. Verify AI chat.
10. Verify recommendations.
11. Verify error messages.
12. Verify dynamic content.

Look specifically for:

- untranslated English strings
- missing dictionary keys
- raw translation keys
- broken interpolation
- layout overflow
- text clipping
- corrupted characters
- incorrect language persistence
- language switching failures
- translated text reverting after navigation
- translated text reverting after refresh

Do not accept a language selector that changes only a few labels.

---

# 26. VOICE FUNCTIONALITY

Verify the voice functionality described by the README.

Test:

- speech input if implemented
- text-to-speech
- play button
- pause/stop
- loading state
- unsupported browser behavior
- API failure
- language-specific voice
- farmer-language output

If voice service fails, the application should degrade gracefully to text.

---

# 27. LOW-BANDWIDTH AUDIT

The README explicitly identifies low-bandwidth/basic-smartphone support as a remaining gap.

Investigate and improve this area.

Check:

- unnecessary large assets
- excessive JavaScript
- image optimization
- API request volume
- duplicate API requests
- loading performance
- skeleton states
- slow network behavior
- mobile rendering
- offline/error behavior
- expensive animations
- large bundle dependencies

Test using throttled network conditions.

The goal is not merely visual responsiveness.

The application should remain usable on a slow connection and basic smartphone.

---

# 28. RESPONSIVE UI TEST

Test at minimum:

### Mobile

```text
360x800
390x844
```

### Tablet

```text
768x1024
```

### Desktop

```text
1280x720
1440x900
1920x1080
```

For every major page verify:

- no horizontal overflow
- no clipped content
- navigation works
- sidebar works
- tables remain usable
- cards resize correctly
- charts remain readable
- maps remain usable
- dialogs fit screen
- forms are usable
- buttons are reachable
- typography remains readable

---

# 29. LOADING / SKELETON UI

Every data-dependent page must have a proper loading experience.

Check:

- initial loading
- route transition loading
- API loading
- slow API
- AI loading
- map loading
- table loading

Do not allow:

- blank white screen
- frozen UI
- layout jumping unnecessarily
- infinite spinner

Use skeleton UI where appropriate.

---

# 30. ERROR HANDLING

Intentionally simulate:

- API 400
- API 401
- API 403
- API 404
- API 500
- timeout
- database unavailable
- AI service unavailable
- translation service unavailable
- weather service unavailable
- missing data
- malformed data

Verify users receive useful error states.

Never show raw stack traces to normal users.

---

# 31. DATA INTEGRITY

Verify complete data flow:

```text
Farmer
  ↓
Farm
  ↓
Crop
  ↓
Weather
  ↓
Market
  ↓
Risk calculation
  ↓
Risk score
  ↓
Farmer explanation
  ↓
Officer alert
  ↓
Officer intervention
```

Verify that IDs and relationships remain consistent.

Test multiple farmers and multiple farms.

Ensure Farmer A cannot see Farmer B's private data.

---

# 32. CROSS-MODULE INTEGRATION

This is critical.

The README says the two modules must be connected and share data.

Test the complete chain:

### Scenario

Create/select a farmer.

Add:

- crop
- soil
- weather
- market data
- loan due date

Calculate distress score.

Verify:

1. Score is created.
2. Score appears on farmer side.
3. Explanation is generated.
4. High-risk farmer appears in officer dashboard.
5. Officer can filter the farmer.
6. Officer can open farmer details.
7. Officer can create intervention.
8. Notification is generated where appropriate.

Do not consider the project complete if these modules work independently but do not communicate.

---

# 33. DATABASE TESTING

Verify CRUD behavior for the documented schema.

Test:

- create
- read
- update
- delete where applicable
- relationships
- null handling
- invalid IDs
- duplicate records
- transaction consistency

Check indexes and obvious performance problems.

Never delete production data during testing.

Use test/development data.

---

# 34. UI/UX QUALITY AUDIT

Review every page for:

- consistent spacing
- typography
- hierarchy
- button consistency
- form usability
- accessible contrast
- disabled states
- hover states
- focus states
- active navigation
- empty states
- error states
- success states
- visual consistency

Do not redesign the entire application unnecessarily.

Prefer targeted fixes that improve usability while preserving the intended design.

---

# 35. ACCESSIBILITY

Check:

- semantic HTML
- keyboard navigation
- focus visibility
- form labels
- button labels
- image alt text
- ARIA where needed
- modal keyboard behavior
- screen-reader-friendly controls
- color-independent status indicators

Fix obvious accessibility problems.

---

# 36. PERFORMANCE

Look for:

- unnecessary re-renders
- repeated API calls
- large client components
- unnecessary dependencies
- unoptimized images
- expensive charts
- expensive map rendering
- memory leaks
- unnecessary polling
- slow database queries

Do not optimize blindly.

Measure or identify the actual problem first.

---

# 37. AUTOMATED REGRESSION LOOP

After fixing issues:

1. Re-run the affected test.
2. Re-run the page.
3. Re-run related pages.
4. Re-run the relevant API tests.
5. Run lint.
6. Run TypeScript.
7. Run production build.

Then continue testing the rest of the application.

Do not introduce a fix that breaks another route.

---

# 38. DO NOT HIDE FAILURES

Never:

- remove functionality just to make a test pass
- disable authentication
- remove validation
- suppress errors
- hide console errors
- hardcode fake success responses
- bypass APIs
- replace database functionality with fake UI data
- remove required routes
- silently swallow exceptions

If a real external dependency is unavailable, clearly identify it as an external blocker.

---

# 39. WHEN TO USE MOCK DATA

Mock data may be used ONLY when:

- development/testing requires it
- external service is unavailable
- the README does not provide real data
- the mock is clearly isolated from production behavior

Never use mock data to hide a broken backend.

Clearly separate:

```text
REAL DATA
MOCK DATA
FALLBACK DATA
```

---

# 40. AUTOMATIC FIX POLICY

When you find a bug:

### Minor bug

Fix immediately.

### TypeScript error

Fix immediately.

### UI bug

Fix immediately.

### Broken route

Fix immediately.

### Broken API

Fix immediately.

### Authentication/security problem

Fix immediately and re-test all affected routes.

### Architecture problem

Make the smallest safe architectural correction.

### Missing README-required functionality

Implement it if reasonably possible within the current architecture.

---

# 41. DO NOT CHANGE PROJECT SCOPE

The README explicitly identifies features that were removed because they belong to another problem domain.

Do NOT reintroduce:

- Custom Hiring Center marketplace
- Bank/Insurance institutional portal
- PMFBY insurance workflow
- Government machinery pool
- bank_partner RBAC
- loan transaction tables
- equipment tables

The README explicitly marks these as removed/out of scope.

Keep SmartCrop focused on:

**Advisory Engine + Distress-Risk Scorer**

---

# 42. FINAL README COMPLIANCE CHECK

At the end, create a checklist with:

| Requirement | Status | Evidence |
|---|---|---|
| Module 1 | PASS/FAIL | |
| Module 2 | PASS/FAIL | |
| Connected modules | PASS/FAIL | |
| Farmer portal | PASS/FAIL | |
| Officer portal | PASS/FAIL | |
| Authentication | PASS/FAIL | |
| Authorization | PASS/FAIL | |
| Multilingual UI | PASS/FAIL | |
| AI Chat | PASS/FAIL | |
| Voice | PASS/FAIL | |
| Risk scoring | PASS/FAIL | |
| Rainfall deviation | PASS/FAIL | |
| Market crash | PASS/FAIL | |
| Loan due date | PASS/FAIL | |
| Officer alerts | PASS/FAIL | |
| SMS | PASS/FAIL | |
| Map | PASS/FAIL | |
| Schemes | PASS/FAIL | |
| Low bandwidth | PASS/FAIL | |
| Responsive UI | PASS/FAIL | |
| APIs | PASS/FAIL | |
| Database | PASS/FAIL | |
| Lint | PASS/FAIL | |
| TypeScript | PASS/FAIL | |
| Production build | PASS/FAIL | |

---

# 43. FINAL ROUTE REPORT

Produce a route-by-route report:

```text
ROUTE
STATUS
AUTH REQUIRED
ROLE TESTED
PAGE LOAD
API STATUS
UI INTERACTIONS
LANGUAGE TEST
MOBILE TEST
ERROR TEST
ISSUES FOUND
FIXES APPLIED
FINAL STATUS
```

Example:

```text
/dashboard
PASS
Farmer
PASS
PASS
PASS
PASS
PASS
PASS
Fixed dashboard API loading state
PASS
```

Do this for every discovered route.

---

# 44. FINAL API REPORT

Produce:

```text
API
METHOD
AUTH
ROLE
SUCCESS
VALIDATION
ERROR HANDLING
DATABASE
EXTERNAL SERVICE
FINAL STATUS
```

---

# 45. FINAL BUG REPORT

Separate findings into:

### Critical

Application cannot function / security / data corruption.

### High

Major feature broken.

### Medium

Important functionality degraded.

### Low

Minor UI/UX or polish issue.

For every issue include:

```text
Issue
Root cause
File(s)
Fix
Verification
Status
```

---

# 46. FINAL TEST COMMANDS

Before declaring completion, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If tests exist, run them.

If browser/E2E tests exist, run them.

If they fail, investigate and fix where appropriate.

---

# 47. COMPLETION CRITERIA

Do NOT declare the project complete merely because:

- the homepage loads
- login works
- the build succeeds
- there are no obvious errors

The project is complete only when:

- every required route has been visited
- every major interaction has been tested
- authentication has been tested
- authorization has been tested
- APIs have been tested
- database flows have been tested
- Module 1 works
- Module 2 works
- Module 1 and Module 2 communicate
- multilingual functionality has been tested
- voice functionality has been tested
- officer workflows have been tested
- risk calculation has been verified
- responsive UI has been tested
- loading states have been tested
- error states have been tested
- security issues have been checked
- lint passes
- TypeScript passes
- production build passes

---

# 48. IMPORTANT AUTONOMOUS EXECUTION RULE

Work continuously.

Do not ask me for confirmation for ordinary fixes.

If you discover a problem:

```text
DISCOVER
→ REPRODUCE
→ IDENTIFY ROOT CAUSE
→ FIX
→ TEST
→ REGRESSION TEST
→ CONTINUE
```

Do not stop after the first issue.

Do not wait for me after every page.

Do not give me a list of bugs and expect me to fix them.

**You are responsible for implementing the fixes.**

Only stop when:

1. all reasonable tests have been completed,
2. all fixable issues have been addressed,
3. remaining blockers genuinely require external credentials/services/infrastructure or a human decision.

---

# 49. FINAL OUTPUT

When everything is finished, provide:

## Executive Summary

- Total routes discovered
- Total routes tested
- Total APIs discovered
- Total APIs tested
- Bugs found
- Bugs fixed
- Remaining blockers
- Overall health

## Route Test Summary

Complete route table.

## API Test Summary

Complete API table.

## Authentication Test Summary

Farmer / Officer / Administrator / Unauthenticated.

## Multilingual Test Summary

Languages tested and failures.

## Risk Engine Verification

Show the actual formula/logic used and confirm whether it satisfies the README.

## Performance Summary

Important performance findings.

## Security Summary

Important security findings.

## Files Changed

List every modified file and briefly explain why.

## Remaining Issues

Only genuine unresolved issues.

## Final Verdict

Choose exactly one:

```text
READY
READY WITH MINOR ISSUES
NOT READY
BLOCKED BY EXTERNAL DEPENDENCY
```

Do not claim READY if a major README-required feature is broken.

---

# MOST IMPORTANT INSTRUCTION

Treat this as a **full autonomous QA + engineering cycle**, not a simple code review.

The desired workflow is:

```text
READ README
      ↓
UNDERSTAND REQUIREMENTS
      ↓
SCAN ENTIRE REPOSITORY
      ↓
DISCOVER ROUTES + APIs
      ↓
START APPLICATION
      ↓
TEST EVERY ROUTE
      ↓
TEST EVERY IMPORTANT INTERACTION
      ↓
TEST AUTHENTICATION
      ↓
TEST AUTHORIZATION
      ↓
TEST APIs
      ↓
TEST DATABASE FLOWS
      ↓
TEST MODULE 1
      ↓
TEST MODULE 2
      ↓
TEST MODULE INTEGRATION
      ↓
TEST LANGUAGES
      ↓
TEST VOICE
      ↓
TEST MOBILE
      ↓
TEST LOW-BANDWIDTH BEHAVIOR
      ↓
SECURITY AUDIT
      ↓
IDENTIFY BUGS
      ↓
FIX BUGS
      ↓
RE-TEST
      ↓
REGRESSION TEST
      ↓
LINT
      ↓
TYPECHECK
      ↓
PRODUCTION BUILD
      ↓
FINAL FULL AUDIT
      ↓
GENERATE REPORT
```

**Do not skip steps simply because the application appears to work.**

The objective is to make the existing SmartCrop application genuinely match its documented specification and be demonstrably testable end-to-end.