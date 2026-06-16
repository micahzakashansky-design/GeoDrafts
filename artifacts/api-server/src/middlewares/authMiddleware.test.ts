import { describe, it, expect, vi, beforeEach } from "vitest";
import { authMiddleware } from "./authMiddleware";
import * as authLib from "../lib/auth";
import * as oidc from "openid-client";
import type { Request, Response, NextFunction } from "express";
import type { AuthUser } from "@workspace/api-zod";

vi.mock("../lib/auth", () => ({
  getSessionId: vi.fn(),
  getSession: vi.fn(),
  clearSession: vi.fn(),
  updateSession: vi.fn(),
  getOidcConfig: vi.fn(),
}));

vi.mock("openid-client", () => ({
  refreshTokenGrant: vi.fn(),
}));

describe("authMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const mockUser: AuthUser = {
    id: "user-123",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    profileImageUrl: "https://example.com/pic.jpg",


  };

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
    };
    res = {};
    next = vi.fn() as unknown as NextFunction;
    vi.resetAllMocks();
  });

  it("should add isAuthenticated method that returns false when user is not present", async () => {
    vi.mocked(authLib.getSessionId).mockReturnValue(undefined);
    await authMiddleware(req as Request, res as Response, next);

    expect(req.isAuthenticated).toBeDefined();
    expect(req.isAuthenticated!()).toBe(false);
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should call next and clearSession when session ID exists but no session found", async () => {
    vi.mocked(authLib.getSessionId).mockReturnValue("fake-session-id");
    vi.mocked(authLib.getSession).mockResolvedValue(null);

    await authMiddleware(req as Request, res as Response, next);

    expect(authLib.getSession).toHaveBeenCalledWith("fake-session-id");
    expect(authLib.clearSession).toHaveBeenCalledWith(res, "fake-session-id");
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should call next and clearSession when session exists but has no user ID", async () => {
    vi.mocked(authLib.getSessionId).mockReturnValue("fake-session-id");
    vi.mocked(authLib.getSession).mockResolvedValue({
      user: { email: "no-id@test.com" } as any,
      access_token: "token",
    });

    await authMiddleware(req as Request, res as Response, next);

    expect(authLib.clearSession).toHaveBeenCalledWith(res, "fake-session-id");
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should set req.user and call next when session is valid and not expired", async () => {
    vi.mocked(authLib.getSessionId).mockReturnValue("valid-session-id");
    vi.mocked(authLib.getSession).mockResolvedValue({
      user: mockUser,
      access_token: "access-token",
      expires_at: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
    });

    await authMiddleware(req as Request, res as Response, next);

    expect(req.user).toEqual(mockUser);
    expect(req.isAuthenticated!()).toBe(true);
    expect(next).toHaveBeenCalledTimes(1);
    expect(authLib.clearSession).not.toHaveBeenCalled();
    expect(oidc.refreshTokenGrant).not.toHaveBeenCalled();
  });

  it("should attempt refresh when session is expired with refresh token, set req.user and call next on success", async () => {
    const expiredTime = Math.floor(Date.now() / 1000) - 3600; // Expired 1 hour ago
    vi.mocked(authLib.getSessionId).mockReturnValue("expired-session-id");
    vi.mocked(authLib.getSession).mockResolvedValue({
      user: mockUser,
      access_token: "old-access-token",
      refresh_token: "old-refresh-token",
      expires_at: expiredTime,
    });

    vi.mocked(authLib.getOidcConfig).mockResolvedValue({} as any);

    const newExpiry = 3600; // expires in 1 hour
    vi.mocked(oidc.refreshTokenGrant).mockResolvedValue({
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
      expiresIn: () => newExpiry,
    } as any);

    await authMiddleware(req as Request, res as Response, next);

    expect(authLib.getOidcConfig).toHaveBeenCalledTimes(1);
    expect(oidc.refreshTokenGrant).toHaveBeenCalledWith(expect.anything(), "old-refresh-token");

    expect(authLib.updateSession).toHaveBeenCalledWith(
      "expired-session-id",
      expect.objectContaining({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      })
    );
    expect(req.user).toEqual(mockUser);
    expect(req.isAuthenticated!()).toBe(true);
    expect(next).toHaveBeenCalledTimes(1);
    expect(authLib.clearSession).not.toHaveBeenCalled();
  });

  it("should keep old refresh token if the new one is not provided during refresh", async () => {
    const expiredTime = Math.floor(Date.now() / 1000) - 3600;
    vi.mocked(authLib.getSessionId).mockReturnValue("expired-session-id");
    vi.mocked(authLib.getSession).mockResolvedValue({
      user: mockUser,
      access_token: "old-access-token",
      refresh_token: "old-refresh-token",
      expires_at: expiredTime,
    });

    vi.mocked(authLib.getOidcConfig).mockResolvedValue({} as any);

    vi.mocked(oidc.refreshTokenGrant).mockResolvedValue({
      access_token: "new-access-token",
      // refresh_token is missing
      expiresIn: () => 3600,
    } as any);

    await authMiddleware(req as Request, res as Response, next);

    expect(authLib.updateSession).toHaveBeenCalledWith(
      "expired-session-id",
      expect.objectContaining({
        access_token: "new-access-token",
        refresh_token: "old-refresh-token", // Kept old
      })
    );
    expect(req.user).toEqual(mockUser);
  });

  it("should clear session when session is expired and no refresh token exists", async () => {
    const expiredTime = Math.floor(Date.now() / 1000) - 3600;
    vi.mocked(authLib.getSessionId).mockReturnValue("expired-no-refresh-session-id");
    vi.mocked(authLib.getSession).mockResolvedValue({
      user: mockUser,
      access_token: "old-access-token",
      // no refresh_token
      expires_at: expiredTime,
    });

    await authMiddleware(req as Request, res as Response, next);

    expect(authLib.getOidcConfig).not.toHaveBeenCalled();
    expect(oidc.refreshTokenGrant).not.toHaveBeenCalled();

    expect(authLib.clearSession).toHaveBeenCalledWith(res, "expired-no-refresh-session-id");
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should clear session when refresh token fails (throws)", async () => {
    const expiredTime = Math.floor(Date.now() / 1000) - 3600;
    vi.mocked(authLib.getSessionId).mockReturnValue("expired-fail-session-id");
    vi.mocked(authLib.getSession).mockResolvedValue({
      user: mockUser,
      access_token: "old-access-token",
      refresh_token: "old-refresh-token",
      expires_at: expiredTime,
    });

    vi.mocked(authLib.getOidcConfig).mockResolvedValue({} as any);
    vi.mocked(oidc.refreshTokenGrant).mockRejectedValue(new Error("Refresh failed"));

    await authMiddleware(req as Request, res as Response, next);

    expect(oidc.refreshTokenGrant).toHaveBeenCalledTimes(1);
    expect(authLib.clearSession).toHaveBeenCalledWith(res, "expired-fail-session-id");
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
