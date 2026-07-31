/**
 * Formats Firebase Auth and sign-in errors into clear, human-friendly messages.
 */
export function formatAuthError(error: any): string {
  if (!error) return "An unknown error occurred. Please try again.";

  const code = (typeof error === "string" ? error : error?.code ?? error?.message ?? "").toLowerCase();

  if (code.includes("username-no-email")) {
    return "No email linked to this username yet. Please sign in using your email address once to link it.";
  }
  if (code.includes("username-not-found")) {
    return "No account found with that username. Check your spelling or try signing in with your email.";
  }
  if (code.includes("user-not-found")) {
    return "No account found with that email or username.";
  }
  if (code.includes("wrong-password") || code.includes("invalid-credential")) {
    return "Wrong email/username or password. Please check your credentials.";
  }
  if (code.includes("invalid-email")) {
    return "Invalid email address format. If using a username, make sure it matches your registered name.";
  }
  if (code.includes("email-already-in-use")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (code.includes("weak-password")) {
    return "Password must be at least 6 characters long.";
  }
  if (code.includes("too-many-requests")) {
    return "Too many failed sign-in attempts. Please wait a moment and try again.";
  }
  if (code.includes("user-disabled")) {
    return "This user account has been disabled. Please contact support.";
  }
  if (code.includes("operation-not-allowed")) {
    return "Email/password sign-in is currently disabled.";
  }
  if (code.includes("network-request-failed")) {
    return "Network error. Please check your internet connection and try again.";
  }
  if (code.includes("popup-closed-by-user")) {
    return "Sign-in popup was closed before completing.";
  }
  if (code.includes("popup-blocked")) {
    return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
  }

  if (typeof error?.message === "string" && error.message.length > 0 && error.message.length < 120 && !error.message.toLowerCase().includes("firebase")) {
    return error.message;
  }

  return "Authentication failed. Please check your details and try again.";
}
