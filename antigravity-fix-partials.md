# Prompt for Antigravity: Fix the 3 partial-match items from the audit

Context: an audit of README.md's claims against the actual code came back 11/14 full matches, 3 partial. Fix exactly these three — don't touch anything else that already matched.

## Fix 1 — Resolve the Clerk situation (investigate before deleting)

`ClerkProvider` still wraps `app/layout.tsx` and `@clerk/nextjs`/`@insforge/sdk` are still in `package.json`, even though the README documents JWT-only auth and dropped their badges.

1. Search the codebase for anywhere a Clerk hook or session (`useUser`, `useAuth`, `auth()`, `currentUser()`, etc. from `@clerk/nextjs`) or an InsForge client call is actually used to gate a route, read a session, or fetch data.
2. If nothing real depends on it: remove `ClerkProvider` from `app/layout.tsx`, remove `@clerk/nextjs` and `@insforge/sdk` from `package.json`, remove any Clerk/InsForge env vars from `.env.local.example`, and confirm `npm run build` still passes with the same route count.
3. If something does depend on it: tell me exactly what, and do not remove it — flag it back to me instead so I can decide whether that dependency needs to be replaced with the JWT system or documented honestly in the README.

## Fix 2 — Wire `isLiteMode` into the heaviest components

`lib/bandwidth-context.tsx` correctly detects 2G/slow-2G/offline via `navigator.connection` and `navigator.onLine`, but nothing consumes `isLiteMode` to actually change rendering.

1. In the MapLibre map component(s) (`officer-dashboard/map`, and the mini-map on `officer-dashboard`), read `isLiteMode` from `useBandwidth()` and when true: reduce heatmap layer complexity/point density, or fall back to a static image/simplified marker view instead of the full GPU vector render.
2. In the AI chat page (`/ai-chat`), when `isLiteMode` is true: skip any animated/canvas background, and prefer text responses over auto-playing voice synthesis unless the user explicitly taps play.
3. Anywhere images are rendered on farmer-facing pages, confirm `isLiteMode` reduces image size/quality (e.g. lower-res source or `loading="lazy"` already applied consistently).
4. Keep the changes minimal and behind the existing `isLiteMode` flag — don't restructure these components otherwise.

## Fix 3 — Mount `DataSaverToggle` in the UI

The component exists and works but isn't rendered anywhere a user can reach it.

1. Add `<DataSaverToggle />` to the main navigation bar (visible on both farmer and officer layouts) or to a settings/profile menu if that fits the existing nav pattern better — match whichever the app's nav already does for similar controls (e.g. the language selector).
2. Confirm it's reachable without scrolling on a typical mobile viewport, since its whole purpose is for users on constrained devices.

## When done

Re-run the same three audit checks (Clerk/InsForge usage, `isLiteMode` consumption, `DataSaverToggle` placement) and confirm all three now read as full matches, not partial. Report `npm run build` route count again to confirm nothing broke.
