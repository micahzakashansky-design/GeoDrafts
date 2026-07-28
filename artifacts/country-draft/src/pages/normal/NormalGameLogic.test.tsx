import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NormalGame from './NormalGame';
import { CATEGORIES, COUNTRIES, ALL_COUNTRIES, type Country } from '@/data/countries';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/normal', vi.fn()]
}));

// Mock the local-leaderboard logic so we don't save to localStorage during tests
vi.mock('@/lib/local-leaderboard', () => ({
  savePersonalScore: vi.fn(),
  formatRoster: vi.fn(),
}));

// Mock Firebase Auth
vi.mock('@/lib/use-firebase-auth', () => ({
  useFirebaseAuth: () => ({ firebaseUser: null })
}));

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
vi.stubGlobal('localStorage', localStorageMock);

function createMockCountry(name: string): Country {
  const dummyStats = { score: 8, description: "Great stat", industryType: 3 };
  return {
    name,
    isoNumeric: "000",
    aliases: [],
    capitalAliases: [],
    flag: "🇺🇸",
    flagColors: ["red", "white", "blue"],
    tier: "first",
    capital: "Capital",
    region: "Region",
    knownFor: "Test Country",
    stats: {
      military: dummyStats,
      economy: dummyStats,
      culture: dummyStats,
      healthcare: dummyStats,
      internationalRelationships: dummyStats,
      government: dummyStats,
      climate: dummyStats,
      technology: dummyStats,
      size: dummyStats,
      population: dummyStats,
      history: dummyStats,
      tourism: dummyStats,
      education: dummyStats,
      location: dummyStats,
      naturalResources: dummyStats,
    }
  };
}

describe('NormalGame logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    if (COUNTRIES.length === 0) {
      for (let i = 0; i < 30; i++) {
        COUNTRIES.push(createMockCountry(`Country ${i + 1}`));
      }
    }
    if (ALL_COUNTRIES.length === 0) {
      for (let i = 0; i < 179; i++) {
        ALL_COUNTRIES.push(createMockCountry(`All Country ${i + 1}`));
      }
    }
  });

  it('renders a country card on initialization', async () => {
    render(<NormalGame />);
    
    await waitFor(() => {
      const els = screen.getAllByText('Military');
      expect(els.length).toBeGreaterThan(0);
    });
  });

  it('uses full 179 country pool in Beta mode', async () => {
    render(<NormalGame isBetaMode={true} />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Military').length).toBeGreaterThan(0);
    });
  });

  it('renders Difficulty slider and Blind Mode button in Beta mode', async () => {
    render(<NormalGame isBetaMode={true} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Difficulty:/i)).toBeInTheDocument();
      expect(screen.getByText(/Blind Mode/i)).toBeInTheDocument();
      expect(screen.getByText(/Expert \(179\)/i)).toBeInTheDocument();
    });
  });

  it('handles country selection and game over state correctly', async () => {
    render(<NormalGame />);
    
    // We will draft 15 times
    for (let i = 0; i < CATEGORIES.length; i++) {
      await waitFor(() => {
        const catElements = screen.getAllByText((content) => {
          return CATEGORIES.includes(content as any);
        });
        const clickableCat = catElements.find(el => el.closest('.cursor-pointer'));
        expect(clickableCat).toBeDefined();
      });

      const catElements = screen.getAllByText((content) => {
        return CATEGORIES.includes(content as any);
      });
      const clickableCat = catElements.find(el => el.closest('.cursor-pointer'));
      
      fireEvent.click(clickableCat!.closest('.cursor-pointer')!);
    }

    // After 15 picks, it should be Game Over
    expect(await screen.findByText(/Draft Complete/i)).toBeInTheDocument();
    expect(screen.getByText(/Final Score:/i)).toBeInTheDocument();
  });
});
