import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setBaseUrl, customFetch } from "./custom-fetch";

describe("custom-fetch configuration", () => {
  beforeEach(() => {
    // Reset global baseUrl to avoid test interference
    setBaseUrl(null);
  });

  afterEach(() => {
    setBaseUrl(null);
    vi.restoreAllMocks();
  });

  describe("setBaseUrl", () => {
    it("should set a base URL that gets prepended to relative paths", async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('{"ok":true}', {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }));
      globalThis.fetch = mockFetch;

      setBaseUrl("https://api.example.com");

      await customFetch("/users", { responseType: "json" });

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/users", expect.any(Object));
    });

    it("should not prepend base URL to absolute URLs", async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('{"ok":true}', {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }));
      globalThis.fetch = mockFetch;

      setBaseUrl("https://api.example.com");

      await customFetch("https://other.domain.com/users", { responseType: "json" });

      expect(mockFetch).toHaveBeenCalledWith("https://other.domain.com/users", expect.any(Object));
    });

    it("should strip trailing slashes from the base URL", async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('{"ok":true}', {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }));
      globalThis.fetch = mockFetch;

      setBaseUrl("https://api.example.com///");

      await customFetch("/users", { responseType: "json" });

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/users", expect.any(Object));
    });

    it("should not affect URLs when set to null", async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('{"ok":true}', {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }));
      globalThis.fetch = mockFetch;

      setBaseUrl(null);

      // Using an absolute URL to avoid the jsdom invalid URL error for relative fetch without base
      await customFetch("http://localhost/users", { responseType: "json" });

      expect(mockFetch).toHaveBeenCalledWith("http://localhost/users", expect.any(Object));
    });

    it("should work with URL objects", async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('{"ok":true}', {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }));
      globalThis.fetch = mockFetch;

      setBaseUrl("https://api.example.com");

      const url = new URL("https://other.domain.com/users");
      await customFetch(url, { responseType: "json" });

      const fetchCallArgs = mockFetch.mock.calls[0];
      expect(fetchCallArgs[0]).toBeInstanceOf(URL);
      expect((fetchCallArgs[0] as URL).href).toBe("https://other.domain.com/users");
    });
  });
});
