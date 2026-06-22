import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NormalGame from './NormalGame';
import { CATEGORIES } from '@/data/countries';

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

describe('NormalGame logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders a country card on initialization', async () => {
    render(<NormalGame />);
    
    await waitFor(() => {
      const els = screen.getAllByText('Military');
      expect(els.length).toBeGreaterThan(0);
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
