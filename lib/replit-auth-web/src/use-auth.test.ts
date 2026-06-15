import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuth } from "./use-auth";

const mockUser = {
  id: 1,
  name: "Test User",
  profileImage: "https://example.com/image.png",
  bio: "Test bio",
  url: "https://example.com",
};

describe("useAuth", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    globalThis.fetch = vi.fn();

    // Mock window.location
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        pathname: "/test-path",
        href: "",
      },
    });
  });

  it("should initialize with loading state and null user", () => {
    // We need to prevent the fetch from resolving immediately to test initial state
    let resolveFetch: any;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        resolveFetch = resolve;
      });
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should handle successful authentication", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/auth/user", { credentials: "include" });
  });

  it("should handle unauthenticated state (null user)", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: null }),
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should handle fetch errors", async () => {
    // Suppress console.error for this test since it's expected
    const originalConsoleError = console.error;
    console.error = vi.fn();

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    console.error = originalConsoleError;
  });

  it("should handle network errors", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should provide a working login function", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: null }),
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.login();
    });

    expect(window.location.href).toBe("/api/login?returnTo=%2Ftest-path");
  });

  it("should use '/' as fallback for returnTo if pathname is empty", async () => {
    window.location.pathname = "";

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: null }),
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.login();
    });

    expect(window.location.href).toBe("/api/login?returnTo=%2F");
  });

  it("should provide a working logout function", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.logout();
    });

    expect(window.location.href).toBe("/api/logout");
  });

  it("should ignore responses if unmounted", async () => {
    let resolveFetch: any;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        resolveFetch = resolve;
      });
    });

    const { result, unmount } = renderHook(() => useAuth());

    // unmount before fetch resolves
    unmount();

    // now resolve fetch
    await act(async () => {
      resolveFetch({
        ok: true,
        json: async () => ({ user: mockUser }),
      });
    });

    // state shouldn't change
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
  });
});
