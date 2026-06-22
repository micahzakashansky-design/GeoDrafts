import { describe, it, expect } from 'vitest';
import { getRawPopulation, computeSizePopBonus, getBonusPath, getCountryArchetype, getRating } from './achievements-logic';

describe('achievements-logic', () => {
  it('parses raw population correctly', () => {
    expect(getRawPopulation('10 million')).toBe(10000000);
    expect(getRawPopulation('1.5B')).toBe(1500000000);
    expect(getRawPopulation('500K')).toBe(500000);
  });

  it('determines the correct rating', () => {
    expect(getRating(185)).toBe('Global Hegemon');
    expect(getRating(165)).toBe('Superpower');
    expect(getRating(85)).toBe('Developing Nation');
    expect(getRating(10)).toBe('Struggling State');
  });

  it('calculates the correct archetype based on stats', () => {
    const cyberocracy = {
      Technology: { stats: { technology: { score: 10 } } },
      Government: { stats: { government: { score: 10 } } }
    } as any;
    expect(getCountryArchetype(cyberocracy)).toBe('Cyberocracy');

    const spartan = {
      Military: { stats: { military: { score: 10 } } },
      Healthcare: { stats: { healthcare: { score: 2 } } },
      Education: { stats: { education: { score: 3 } } }
    } as any;
    expect(getCountryArchetype(spartan)).toBe('Spartan Society');
  });

  it('calculates the correct bonus path', () => {
    const tradeHub = {
      Size: { area: 5000 },
      Population: { stats: { population: { description: '10 million' } } },
      Climate: { stats: { climate: { score: 9 } } }
    } as any;
    // Density = 10000000 / 5000 = 2000. Geo score = 9. Should be Trade Hub.
    expect(getBonusPath(tradeHub)).toBe('Trade Hub');
  });
});
