---
name: GeoDrafts architecture
description: Routing, state storage keys, theme context, leaderboard endpoints, and countries.ts syntax pitfalls
---

## Routing
- `/` → Home.tsx (mode select, guidebook, leaderboard link)
- `/game` → Game.tsx (15-slot draft)
- `/leaderboard` → Leaderboard.tsx (fetches /api/leaderboard)
- Wouter Router base set to `import.meta.env.BASE_URL.replace(/\/$/, "")`

## State storage keys
- `countryDraftState_v4` — game state (bump version to clear stale state)
- `countryDraftLeaderboard_v2` — local best-of-10 scores
- `countryDraftHardMode` — "true"/"false"
- `geoDraftsTheme` — "light"/"dark"

## Theme
- ThemeContext lives in `src/lib/theme-context.tsx`; ThemeProvider wraps App.tsx
- Applied via `:root.light` CSS class on `document.documentElement`
- CSS vars defined under `:root` (dark default) and `:root.light` (light overrides)

## Leaderboard API
- GET /api/leaderboard?mode=easy|hard&limit=50
- POST /api/leaderboard { playerName, score, mode, roster }
- Table: leaderboardTable in lib/db/src/schema/index.ts

## api-zod index.ts export conflict fix
- Orval generates both `generated/api.ts` (Zod schemas) and `generated/types/*.ts` (TS interfaces)
- Both export `SubmitScoreBody` → conflict in `export *` re-export
- Fix: in `lib/api-zod/src/index.ts`, export types individually (exclude submitScoreBody, submitScoreBodyRoster) so the Zod schema version wins

## countries.ts syntax pitfalls
- When adding/removing country entries via scripts, extra `},` closing braces may accumulate
- Each country object ends with exactly `    },` (stats close) then `  },` (country close)
- Croatia had 2 extra `},` (fixed); Lithuania had 6 extra (fixed)
- Always run `pnpm --filter @workspace/country-draft run typecheck` after editing countries.ts

## CATEGORIES (15 total)
Military, Economy, Government, International Relationships, Technology,
Education, Location, Natural Resources, Healthcare, Culture, Climate, History,
Tourism, Size, Population

**Why:** Size and Population are "bonus" categories contributing to a density formula rather than direct weighted scores. Tourism replaced Cities/Landmarks.
