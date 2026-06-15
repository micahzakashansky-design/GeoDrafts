import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTopScores } from './firestore';
import { getDocs, query, collection, orderBy, limit, where } from 'firebase/firestore';

// Mock Firebase and firestore modules
vi.mock('./firebase', () => ({
  firestore: {}
}));

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    serverTimestamp: vi.fn(),
    onSnapshot: vi.fn(),
  };
});

describe('getTopScores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all top scores when no mode filter is provided', async () => {
    // Setup mock data
    const mockDocs = [
      { id: '1', data: () => ({ score: 100, mode: 'daily' }) },
      { id: '2', data: () => ({ score: 90, mode: 'standard' }) }
    ];

    // Configure mocks
    (getDocs as any).mockResolvedValue({ docs: mockDocs });
    (collection as any).mockReturnValue('mocked-collection');
    (orderBy as any).mockReturnValue('mocked-orderBy');
    (limit as any).mockReturnValue('mocked-limit');
    (query as any).mockReturnValue('mocked-query');

    // Call function
    const result = await getTopScores();

    // Verify expectations
    expect(collection).toHaveBeenCalledWith({}, 'leaderboard');
    expect(orderBy).toHaveBeenCalledWith('score', 'desc');
    expect(limit).toHaveBeenCalledWith(10);
    expect(query).toHaveBeenCalledWith('mocked-collection', 'mocked-orderBy', 'mocked-limit');
    expect(getDocs).toHaveBeenCalledWith('mocked-query');

    // Verify results
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: '1', score: 100, mode: 'daily' });
    expect(result[1]).toEqual({ id: '2', score: 90, mode: 'standard' });
  });

  it('should fetch all top scores when mode filter is "all"', async () => {
    // Setup mock data
    const mockDocs = [
      { id: '1', data: () => ({ score: 100, mode: 'daily' }) }
    ];

    // Configure mocks
    (getDocs as any).mockResolvedValue({ docs: mockDocs });
    (collection as any).mockReturnValue('mocked-collection');
    (orderBy as any).mockReturnValue('mocked-orderBy');
    (limit as any).mockReturnValue('mocked-limit');
    (query as any).mockReturnValue('mocked-query');

    // Call function
    const result = await getTopScores('all', 5);

    // Verify expectations
    expect(collection).toHaveBeenCalledWith({}, 'leaderboard');
    expect(orderBy).toHaveBeenCalledWith('score', 'desc');
    expect(limit).toHaveBeenCalledWith(5);
    expect(query).toHaveBeenCalledWith('mocked-collection', 'mocked-orderBy', 'mocked-limit');
    expect(getDocs).toHaveBeenCalledWith('mocked-query');

    // Verify results
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: '1', score: 100, mode: 'daily' });
  });

  it('should fetch filtered top scores when mode filter is provided', async () => {
    // Setup mock data
    const mockDocs = [
      { id: '1', data: () => ({ score: 100, mode: 'daily' }) }
    ];

    // Configure mocks
    (getDocs as any).mockResolvedValue({ docs: mockDocs });
    (collection as any).mockReturnValue('mocked-collection');
    (orderBy as any).mockReturnValue('mocked-orderBy');
    (limit as any).mockReturnValue('mocked-limit');
    (where as any).mockReturnValue('mocked-where');
    (query as any).mockReturnValue('mocked-query');

    // Call function
    const result = await getTopScores('daily', 10);

    // Verify expectations
    expect(collection).toHaveBeenCalledWith({}, 'leaderboard');
    expect(where).toHaveBeenCalledWith('mode', '==', 'daily');
    expect(orderBy).toHaveBeenCalledWith('score', 'desc');
    expect(limit).toHaveBeenCalledWith(10);
    expect(query).toHaveBeenCalledWith('mocked-collection', 'mocked-where', 'mocked-orderBy', 'mocked-limit');
    expect(getDocs).toHaveBeenCalledWith('mocked-query');

    // Verify results
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: '1', score: 100, mode: 'daily' });
  });

  it('should handle empty results gracefully', async () => {
    // Configure mocks for empty results
    (getDocs as any).mockResolvedValue({ docs: [] });

    // Call function
    const result = await getTopScores();

    // Verify results
    expect(result).toEqual([]);
  });
});
