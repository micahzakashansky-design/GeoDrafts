import { describe, it, expect, vi } from 'vitest';
import { shuffleArray } from '../countries';

describe('shuffleArray', () => {
  it('should return an array of the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result.length).toBe(input.length);
  });

  it('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toEqual(expect.arrayContaining(input));
    expect(input).toEqual(expect.arrayContaining(result));
  });

  it('should not modify the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const inputCopy = [...input];
    shuffleArray(input);
    expect(input).toEqual(inputCopy);
  });

  it('should handle an empty array', () => {
    const input: any[] = [];
    const result = shuffleArray(input);
    expect(result).toEqual([]);
  });

  it('should handle an array with a single element', () => {
    const input = [42];
    const result = shuffleArray(input);
    expect(result).toEqual([42]);
  });

  it('should shuffle elements (probabilistic test)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let isDifferent = false;

    // It's possible but extremely unlikely (1 in 3,628,800) that a shuffled array
    // of 10 elements is identical to the original array. We try a few times to be safe.
    for (let i = 0; i < 5; i++) {
      const result = shuffleArray(input);
      if (JSON.stringify(result) !== JSON.stringify(input)) {
        isDifferent = true;
        break;
      }
    }

    expect(isDifferent).toBe(true);
  });
});
