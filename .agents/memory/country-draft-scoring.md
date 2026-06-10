---
name: Country Draft scoring system
description: Weighted scoring, bonus formula, and rating thresholds for the Country Draft game
---

## Category weights
- ★★★ (×1.5, max 15): Military, Economy, Government
- ★★ (×1.2, max 12): International Relationships, Technology
- ★ (×1.0, max 10): Culture, Healthcare, Climate, History, Cities/Landmarks
- ★★ (bonus formula, no direct weight): Size, Population

## Size + Population bonus (max 25)
- Uses size.score, population.score, climate.score, technology.score, economy.score
- Agricultural path: large + good climate + sparse → max 20
- Urban path: tech + economy + dense → max 20
- Combo bonus: both large size AND large population → max 5

## Max score
- Base: 3×15 + 2×12 + 5×10 = 119
- Bonus: 25
- Total max: 144

## Rating thresholds
- Superpower: 120+
- Major Power: 100+
- Regional Power: 80+
- Developing Nation: 62+
- Struggling State: <62

## localStorage keys
- Game state: `countryDraftState_v3` (bump version when schema changes)
- Leaderboard: `countryDraftLeaderboard_v1`
- Hard mode setting: `countryDraftHardMode`

**Why:** Version bumped to v3 when scoring schema changed significantly (density era was v2). Always bump when the persisted state shape changes to avoid stale state bugs.
