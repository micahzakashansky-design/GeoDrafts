---
name: GeoDrafts architecture
description: Auth, leaderboard, state, routing, and sharp edges for the GeoDrafts monorepo.
---

## Auth — Firebase (current, as of June 2026)
- **Firebase Auth** (Google Sign-In + Email/Password) via client-side SDK
- `artifacts/country-draft/src/lib/firebase.ts` — app init (auth + firestore exports)
- `src/lib/use-firebase-auth.ts` — `useFirebaseAuth()` hook (replaces old Replit Auth hook)
- `src/components/UsernamePrompt.tsx` — first-login username picker, creates Firestore profile
- Replit Auth is **fully removed** from Express server (authMiddleware, auth routes gone)
- `GOOGLE_API_KEY` secret → `import.meta.env.VITE_FIREBASE_API_KEY` via `vite.config.ts` define block
- Other Firebase config: `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc. as shared env vars

**Why:** User migrated from Replit Auth to Firebase Auth for cross-platform identity + Firestore integration.

## User Profiles — Firestore `users/{uid}`
- Fields: `{ username, createdAt, bestScore, totalGames }`
- New users → `<UsernamePrompt>` shown in SubmitDialog when `needsUsername === true`
- Functions in `src/lib/firestore.ts`: `getUserProfile`, `createUserProfile`, `updateUserStats`

## Leaderboard — Firestore `leaderboard/{docId}`
- Fields: `{ uid, username, score, mode, roster, createdAt, date }`
- Daily scores: deterministic doc ID `daily_{uid}_{YYYY-MM-DD}` → one-per-day enforced without composite index
- Non-daily: `addDoc()` for auto ID
- `getTopScores(mode?, topN)` — fetches top 100 by score DESC, filters client-side by mode
- `checkDailySubmitted(uid)` — getDoc on deterministic daily doc ID
- **Express leaderboard routes removed;** Leaderboard.tsx queries Firestore directly

## Express API Server (minimal)
- Only serves health check (`/api/healthz`)
- Auth routes, leaderboard POST/GET, session middleware all removed

## Routing
- `/` → Home.tsx · `/game` → Game.tsx · `/leaderboard` → Leaderboard.tsx
- Wouter Router base: `import.meta.env.BASE_URL.replace(/\/$/, "")`

## State storage keys (localStorage)
- `countryDraftState_{mode}_{date}` — game state
- `countryDraftDailyMode`, `countryDraftDailyDate` — daily mode flags
- `geoDraftsTheme` — "light"/"dark"

## Firestore security rules (TODO before production)
- `leaderboard`: authenticated reads for all; writes only by the doc's uid
- `users/{uid}`: authenticated read/write only by matching uid

## countries.ts pitfalls
- Extra `},` can accumulate when scripts edit the array; each country object ends with exactly `    },` then `  },`
- Always run `pnpm --filter @workspace/country-draft run typecheck` after editing countries.ts
