import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import X from "lucide-react/dist/esm/icons/x";
import PartyPopper from "lucide-react/dist/esm/icons/party-popper";
import Lock from "lucide-react/dist/esm/icons/lock";
import LogIn from "lucide-react/dist/esm/icons/log-in";
import Send from "lucide-react/dist/esm/icons/send";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { saveScore } from "@/lib/firestore";
import type { Country, Category } from "@/data/countries";

export function SubmitDialog({ score, mode, roster, onClose, onSuccess }: { score: number; mode: string; roster: Partial<Record<Category, Country>>; onClose: () => void; onSuccess: () => void; }) {
  const [, navigate] = useLocation(); const { firebaseUser, profile, isLoading: authLoading, needsUsername, signInWithGoogle, signInWithEmail } = useFirebaseAuth();
  const [loading, setLoading] = useState(false); const [done, setDone] = useState(false); const [error, setError] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false); const [isSignUp, setIsSignUp] = useState(false); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const modeLabel = mode === "daily" ? "Daily" : mode === "hard" ? "Hard" : mode === "double" ? "Double Draft" : mode === "guess" ? "Guess the Country" : "Normal"; const displayName = profile?.username ?? firebaseUser?.displayName ?? firebaseUser?.email ?? "Anonymous"; const isAuthenticated = !!firebaseUser && !!profile;
  async function handleGoogleSignIn() { setError(null); try { await signInWithGoogle(); } catch { setError("Google sign-in failed. Please try again."); } }
  async function handleEmailAuth() {
    setError(null); if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    setLoading(true); try { await signInWithEmail(email.trim(), password, isSignUp); } catch (e: any) { const code = e?.code ?? ""; setError(code.includes("wrong-password") || code.includes("invalid-credential") ? "Wrong email or password." : code.includes("user-not-found") ? "No account with that email." : code.includes("email-already-in-use") ? "Email already in use — try signing in." : code.includes("weak-password") ? "Password must be at least 6 characters." : "Authentication failed. Please try again."); } finally { setLoading(false); }
  }
  async function handleSubmit() {
    if (!firebaseUser || !profile) return; setLoading(true); setError(null); try {
      const rosterMap = Object.fromEntries(Object.entries(roster).filter(([, c]) => c).map(([cat, c]) => [cat, c!.name]));
      await saveScore(firebaseUser.uid, profile.username, score, mode, rosterMap); setDone(true); onSuccess();
    } catch (e: any) { const code = e?.code ?? ""; if (code === "already-submitted") { setError("You've already submitted a daily score today."); } else { setError("Failed to submit. Please try again."); } } finally { setLoading(false); }
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }} className="bg-background border border-border w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-foreground/5"><div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /><span className="font-sans text-lg font-bold text-foreground">Submit Score</span></div><button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"><X className="w-4 h-4" /></button></div>
        {done ? (
          <div className="px-5 py-8 text-center"><div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4"><PartyPopper className="w-8 h-8 text-primary" /></div><div className="font-semibold text-foreground mb-1">Score submitted!</div><div className="text-sm text-muted-foreground mb-5"><span className="text-primary font-bold">{score} pts</span> posted as <span className="font-semibold text-foreground">{displayName}</span>.</div><button onClick={() => navigate("/leaderboard")} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/20 text-primary border border-primary/40 font-semibold text-sm hover:bg-primary/30 transition-colors"><Trophy className="w-4 h-4" />View Leaderboard</button></div>
        ) : authLoading ? ( <div className="px-5 py-8 text-center text-sm text-muted-foreground animate-pulse">Checking account…</div>
        ) : !firebaseUser ? (
          <div className="px-5 py-5 space-y-3">
            <div className="text-center mb-2"><div className="p-3 rounded-full bg-foreground/10 w-fit mx-auto mb-3"><Lock className="w-6 h-6 text-muted-foreground" /></div><div className="font-semibold text-foreground">Sign in to submit</div><p className="text-xs text-muted-foreground mt-1">Post your <span className="text-primary font-bold">{score} pts</span> · {modeLabel} to the global leaderboard.</p></div>
            {!showEmail ? ( <><button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground/10 text-foreground border border-border font-semibold text-sm hover:bg-foreground/20 transition-colors"><svg className="w-4 h-4" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.5 1.2 8.9 3.2l6.6-6.6C35.5 2.5 30.1 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.7 6C12.2 13.3 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.5-.1-3-.4-4.4H24v8.4h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4c4.1-3.8 6.5-9.4 6.5-16.2z"/><path fill="#FBBC05" d="M10.4 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.7-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.7-6z"/><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7-5.4c-2 1.3-4.5 2.1-8 2.1-6.3 0-11.7-4.3-13.6-10l-7.7 6C6.7 42.6 14.7 48 24 48z"/></svg>Continue with Google</button><div className="flex items-center gap-2"><div className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="h-px flex-1 bg-border" /></div><button onClick={() => { setShowEmail(true); setIsSignUp(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground/5 text-foreground border border-border font-semibold text-sm hover:bg-foreground/10 transition-colors"><LogIn className="w-4 h-4" />Sign in with Email</button></>
            ) : ( <div className="space-y-2"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 rounded-lg border border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEmailAuth()} placeholder="Password" className="w-full px-3 py-2 rounded-lg border border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />{error && <p className="text-xs text-red-400">{error}</p>}<button onClick={handleEmailAuth} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/20 text-primary border border-primary/40 font-semibold text-sm hover:bg-primary/30 transition-colors disabled:opacity-50"><Send className="w-4 h-4" />{loading ? "…" : isSignUp ? "Create Account" : "Sign In"}</button><div className="flex items-center justify-between text-xs"><button onClick={() => setShowEmail(false)} className="text-muted-foreground hover:text-foreground">← Back</button><button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-primary hover:underline">{isSignUp ? "Have an account? Sign in" : "New here? Create account"}</button></div></div> )}
          </div>
        ) : needsUsername ? ( <div className="px-5 py-8 text-center text-sm text-muted-foreground animate-pulse">Setting up your profile…</div>
        ) : isAuthenticated ? (
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Your score</span><span className="font-bold text-primary">{score} pts · {modeLabel}</span></div>
            <div className="bg-foreground/5 rounded-lg px-3 py-2.5 flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">{(displayName[0] ?? "?").toUpperCase()}</div><div className="min-w-0"><div className="text-sm font-semibold text-foreground truncate">{displayName}</div><div className="text-xs text-muted-foreground">Posting as your username</div></div></div>
            {error && <p className="text-xs text-red-400">{error}</p>}<button onClick={handleSubmit} disabled={loading} className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${!loading ? "bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30" : "bg-foreground/10 text-muted-foreground border border-border cursor-not-allowed"}`}><Send className="w-4 h-4" />{loading ? "Submitting…" : "Submit to Leaderboard"}</button>
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
