import { describe, it, expect } from "vitest";
import { getSessionId } from "../auth";
import { type Request } from "express";

describe("getSessionId", () => {
  it("returns sessionId from Bearer token", () => {
    const req = {
      headers: {
        authorization: "Bearer test-session-id"
      },
      cookies: {}
    } as unknown as Request;

    expect(getSessionId(req)).toBe("test-session-id");
  });

  it("returns sessionId from cookies if no Bearer token", () => {
    const req = {
      headers: {},
      cookies: {
        sid: "cookie-session-id"
      }
    } as unknown as Request;

    expect(getSessionId(req)).toBe("cookie-session-id");
  });

  it("returns undefined if neither token nor cookie exists", () => {
    const req = {
      headers: {},
      cookies: {}
    } as unknown as Request;

    expect(getSessionId(req)).toBeUndefined();
  });

  it("prefers Bearer token over cookie", () => {
    const req = {
      headers: {
        authorization: "Bearer header-session-id"
      },
      cookies: {
        sid: "cookie-session-id"
      }
    } as unknown as Request;

    expect(getSessionId(req)).toBe("header-session-id");
  });

  it("returns undefined if auth header is present but doesn't start with Bearer", () => {
    const req = {
      headers: {
        authorization: "Basic some-token"
      },
      cookies: {}
    } as unknown as Request;

    expect(getSessionId(req)).toBeUndefined();
  });
});
