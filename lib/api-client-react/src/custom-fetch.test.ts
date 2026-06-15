import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { customFetch } from './custom-fetch';

describe('customFetch body validation', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    // Save original fetch
    originalFetch = globalThis.fetch;

    // Mock fetch to prevent actual network requests during testing
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve('{"success": true}'),
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    // Restore original fetch
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('throws TypeError if GET method is provided with a body string', async () => {
    await expect(customFetch('http://example.com', {
      method: 'GET',
      body: JSON.stringify({ test: 'test' }),
    })).rejects.toThrow(TypeError);

    await expect(customFetch('http://example.com', {
      method: 'GET',
      body: JSON.stringify({ test: 'test' }),
    })).rejects.toThrow('customFetch: GET requests cannot have a body.');
  });

  it('throws TypeError if HEAD method is provided with a body', async () => {
    await expect(customFetch('http://example.com', {
      method: 'HEAD',
      body: JSON.stringify({ test: 'test' }),
    })).rejects.toThrow(TypeError);

    await expect(customFetch('http://example.com', {
      method: 'HEAD',
      body: JSON.stringify({ test: 'test' }),
    })).rejects.toThrow('customFetch: HEAD requests cannot have a body.');
  });

  it('does not throw if GET method is provided without a body', async () => {
    // If it threw here, the test would fail
    await customFetch('http://example.com', {
      method: 'GET',
    });

    // Ensure fetch was actually called
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('does not throw if POST method is provided with a body', async () => {
    await customFetch('http://example.com', {
      method: 'POST',
      body: JSON.stringify({ test: 'test' }),
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
