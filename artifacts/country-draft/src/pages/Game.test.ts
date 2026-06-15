import { describe, it, expect } from 'vitest';
import { computeTotalScore } from './Game';
import { Category } from '@/data/countries';

describe('computeTotalScore', () => {
  it('should return 0 for an empty roster', () => {
    expect(computeTotalScore({})).toBe(0);
  });

  it('should correctly compute score without size/pop bonuses', () => {
    const mockRoster = {
      Military: { stats: { military: { score: 10 } } },
      Economy: { stats: { economy: { score: 5 } } },
    };

    // Military weight: 1.5, Economy weight: 1.5
    // Base score = Math.round(10 * 1.5) + Math.round(5 * 1.5)
    // = 15 + 8 = 23
    expect(computeTotalScore(mockRoster as any)).toBe(23);
  });

  it('should only use size/pop bonus when BOTH size and pop are provided', () => {
    const rosterOnlySize = {
      Size: { stats: { size: { score: 10 } } },
    };
    const rosterOnlyPop = {
      Population: { stats: { population: { score: 10 } } },
    };

    expect(computeTotalScore(rosterOnlySize as any)).toBe(0);
    expect(computeTotalScore(rosterOnlyPop as any)).toBe(0);
  });

  it('should handle bonus categories effectively with Size and Population', () => {
    const mockRoster = {
      Military: { stats: { military: { score: 10 } } },
      Size: { stats: { size: { score: 10 } } },
      Population: { stats: { population: { score: 10 } } },
      Technology: { stats: { technology: { score: 10 } } },
      Economy: { stats: { economy: { score: 10 } } },
      Climate: { stats: { climate: { score: 10 } } },
    };

    const baseScore = computeTotalScore({
      Military: { stats: { military: { score: 10 } } },
      Technology: { stats: { technology: { score: 10 } } },
      Economy: { stats: { economy: { score: 10 } } },
      Climate: { stats: { climate: { score: 10 } } },
    } as any);

    const fullScore = computeTotalScore(mockRoster as any);

    expect(fullScore).toBeGreaterThan(baseScore);
    expect(fullScore - baseScore).toBe(25); // the computed size/pop bonus
  });

  it('should use default climate/tech/eco values if not present for bonus', () => {
    const mockRoster = {
      Size: { stats: { size: { score: 10 } } },
      Population: { stats: { population: { score: 10 } } },
    };

    // Without climate/tech/eco, defaults are 5.
    // agFactor = (10/10) * (5/10) = 0.5
    // urbFactor = (5/10) * (5/10) = 0.25
    // densityBonus = Math.min(20, Math.round(1.0 * Math.max(0.5, 0.25) * 22)) = 11
    // comboBonus = Math.min(5, Math.round((10 * 10) / 20)) = 5
    // Total bonus = 16

    expect(computeTotalScore(mockRoster as any)).toBe(16);
  });

  it('should handle different fitMultiplier conditions', () => {
    // idealDiff < -2 (size is much less than population -> overpopulated)
    const overpopulatedRoster = {
      Size: { stats: { size: { score: 1 } } },
      Population: { stats: { population: { score: 10 } } },
      Climate: { stats: { climate: { score: 10 } } }, // Base score: 10 * 1 = 10
      Technology: { stats: { technology: { score: 10 } } }, // Base score: 10 * 1.2 = 12
      Economy: { stats: { economy: { score: 10 } } }, // Base score: 10 * 1.5 = 15
    };

    // Base score = 10 + 12 + 15 = 37
    // idealDiff = 1 - 10 = -9
    // fitMultiplier = Math.max(0, 1.0 - (9 - 2) * 0.4) = Math.max(0, 1.0 - 2.8) = 0
    // densityBonus = 0
    // matchedPop = Math.min(10, 1 + 2) = 3
    // comboBonus = Math.min(5, Math.round((1 * 3) / 20)) = 0
    // Bonus = 0
    // Total score = 37 + 0 = 37
    expect(computeTotalScore(overpopulatedRoster as any)).toBe(37);

    // idealDiff > 6 (size is much more than population -> underpopulated)
    const underpopulatedRoster = {
      Size: { stats: { size: { score: 10 } } },
      Population: { stats: { population: { score: 1 } } },
      Climate: { stats: { climate: { score: 10 } } }, // Base score: 10 * 1 = 10
      Technology: { stats: { technology: { score: 10 } } }, // Base score: 10 * 1.2 = 12
      Economy: { stats: { economy: { score: 10 } } }, // Base score: 10 * 1.5 = 15
    };

    // Base score = 10 + 12 + 15 = 37
    // idealDiff = 10 - 1 = 9
    // fitMultiplier = Math.max(0.3, 1.0 - (9 - 6) * 0.15) = Math.max(0.3, 1.0 - 0.45) = 0.55
    // agFactor = (10/10) * (10/10) = 1
    // urbFactor = (10/10) * (10/10) = 1
    // densityBonus = Math.min(20, Math.round(0.55 * 1 * 22)) = 12
    // matchedPop = Math.min(1, 10 + 2) = 1
    // comboBonus = Math.min(5, Math.round((10 * 1) / 20)) = 1
    // Bonus = 13
    // Total score = 37 + 13 = 50
    expect(computeTotalScore(underpopulatedRoster as any)).toBe(50);
  });

  it('should handle undefined stats safely (though types imply they exist)', () => {
    const partialRoster = {
      Military: null, // assigned but null
      Economy: undefined,
    };

    expect(computeTotalScore(partialRoster as any)).toBe(0);
  });

  it('should ignore BONUS_CATEGORIES from base score calculation', () => {
    // CATEGORIES.reduce logic skips BONUS_CATEGORIES, relying instead on computeSizePopBonus
    const mockRoster = {
      Size: { stats: { size: { score: 10 } } },
    };
    // computeSizePopBonus returns 0 when population is missing.
    // If Size was mistakenly included in base score, it would add 10 * 1.2 = 12.
    // Thus returning 0 proves it is skipped in base score.
    expect(computeTotalScore(mockRoster as any)).toBe(0);
  });
});
