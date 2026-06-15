import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('merges base classes with provided classes', () => {
    expect(cn('base-class', 'added-class')).toBe('base-class added-class');
  });

  it('handles conditional classes', () => {
    expect(cn('base-class', true && 'truthy-class', false && 'falsy-class')).toBe('base-class truthy-class');
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('handles objects with boolean values', () => {
    expect(cn({ 'class1': true, 'class2': false, 'class3': true })).toBe('class1 class3');
  });

  it('resolves tailwind conflicts correctly using twMerge', () => {
    // Both are padding-x, twMerge should keep the latter
    expect(cn('px-2', 'px-4')).toBe('px-4');

    // Both are text colors, twMerge should keep the latter
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');

    // Complex tailwind conflicts
    expect(cn('bg-red-500 hover:bg-red-600', 'bg-blue-500')).toBe('hover:bg-red-600 bg-blue-500');
  });

  it('handles undefined and null gracefully', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
  });
});
