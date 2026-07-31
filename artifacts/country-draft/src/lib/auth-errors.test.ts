import { describe, it, expect } from "vitest";
import { formatAuthError } from "./auth-errors";

describe("formatAuthError", () => {
  it("formats invalid-credential error code", () => {
    const err = { code: "auth/invalid-credential" };
    expect(formatAuthError(err)).toBe("Wrong email/username or password. Please check your credentials.");
  });

  it("formats wrong-password error code", () => {
    const err = { code: "auth/wrong-password" };
    expect(formatAuthError(err)).toBe("Wrong email/username or password. Please check your credentials.");
  });

  it("formats user-not-found error code", () => {
    const err = { code: "auth/user-not-found" };
    expect(formatAuthError(err)).toBe("No account found with that email or username.");
  });

  it("formats username-not-found error code", () => {
    const err = { code: "auth/username-not-found" };
    expect(formatAuthError(err)).toBe("No account found with that username. Check your spelling or try signing in with your email.");
  });

  it("formats username-no-email error code", () => {
    const err = { code: "auth/username-no-email" };
    expect(formatAuthError(err)).toBe("No email linked to this username yet. Please sign in using your email address once to link it.");
  });

  it("formats invalid-email error code", () => {
    const err = { code: "auth/invalid-email" };
    expect(formatAuthError(err)).toBe("Invalid email address format. If using a username, make sure it matches your registered name.");
  });

  it("formats email-already-in-use error code", () => {
    const err = { code: "auth/email-already-in-use" };
    expect(formatAuthError(err)).toBe("An account with this email already exists. Try signing in instead.");
  });

  it("formats weak-password error code", () => {
    const err = { code: "auth/weak-password" };
    expect(formatAuthError(err)).toBe("Password must be at least 6 characters long.");
  });

  it("formats too-many-requests error code", () => {
    const err = { code: "auth/too-many-requests" };
    expect(formatAuthError(err)).toBe("Too many failed sign-in attempts. Please wait a moment and try again.");
  });

  it("formats popup-closed-by-user error code", () => {
    const err = { code: "auth/popup-closed-by-user" };
    expect(formatAuthError(err)).toBe("Sign-in popup was closed before completing.");
  });

  it("handles null or undefined input gracefully", () => {
    expect(formatAuthError(null)).toBe("An unknown error occurred. Please try again.");
    expect(formatAuthError(undefined)).toBe("An unknown error occurred. Please try again.");
  });
});
