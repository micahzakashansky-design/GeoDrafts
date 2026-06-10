---
name: Country Draft scoring system
description: Weighted scoring, bonus formula, and rating thresholds for the Country Draft game
---

## Category weights (15 total slots)
- ★★★ (×1.5, max 15): Military, Economy, Government
- ★★ (×1.2, max 12): International Relationships, Technology, Education, Location, Natural Resources, Healthcare
- ★ (×1.0, max 10): Culture, Climate, History, Cities/Landmarks
- ★★ (bonus formula, no direct weight): Size, Population

## Size + Population bonus (max 25, overcrowding-aware)
- idealDiff = size.score - population.score
- If idealDiff < -2: overcrowded — fitMultiplier = max(0, 1 - (overcrowding * 0.4)); China pop(10) in Turkey size(4) → diff=-6, mult=0
- If idealDiff > 6: underpopulated — fitMultiplier = max(0.3, 1 - (excess * 0.15))
- Otherwise (-2 to +6): fitMultiplier = 1.0 (ideal range)
- densityBonus = min(20, round(fitMultiplier * max(agFactor, urbFactor) * 22))
- comboBonus = min(5, sz * min(pop, sz+2) / 20)

## Max score
- Base: 3×15 + 6×12 + 4×10 = 45 + 72 + 40 = 157
- Bonus: 25
- Total max: ~182

## Rating thresholds
- Superpower: 148+
- Major Power: 120+
- Regional Power: 95+
- Developing Nation: 72+
- Struggling State: <72

## localStorage keys
- Game state: `countryDraftState_v3` (bump version when schema changes)
- Leaderboard: `countryDraftLeaderboard_v1`
- Hard mode setting: `countryDraftHardMode`

**Why:** Version bumped to v3 when scoring schema changed significantly (density era was v2). Always bump when the persisted state shape changes to avoid stale state bugs.
