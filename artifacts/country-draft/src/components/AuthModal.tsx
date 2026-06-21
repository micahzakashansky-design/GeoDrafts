import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, LogIn, Send, X } from "lucide-react";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";

export function AuthModal({ onClose, title = "Sign In" }: { onClose: () => void, title?: string }) {
  const { signInWithGoogle, signInWithEmail } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleGoogleSignIn() {
    setError(null);
    try { await signInWithGoogle(); onClose(); } 
    catch { setError("Google sign-in failed. Please try again."); }
  }

  async function handleEmailAuth() {
    setError(null);
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password, isSignUp);
      onClose();
    } catch (e: any) {
      const code = e?.code ?? "";
      setError(
        code.includes("wrong-password") || code.includes("invalid-credential") ? "Wrong email or password." :
        code.includes("user-not-found") ? "No account with that email." :
        code.includes("email-already-in-use") ? "Email already in use — try signing in." :
        code.includes("weak-password") ? "Password must be at least 6 characters." :
        "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }} className="bg-[#000000] border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-lg font-bold text-white">{title}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="px-5 py-5 space-y-3">
          <div className="text-center mb-2">
            <div className="p-3 rounded-full bg-white/10 w-fit mx-auto mb-3">
              <Lock className="w-6 h-6 text-white/40" />
            </div>
            <div className="font-semibold text-white">Sign in to continue</div>
          </div>
          {!showEmail ? (
            <>
              <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white border border-white/20 font-semibold text-sm hover:bg-white/20 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.5 1.2 8.9 3.2l6.6-6.6C35.5 2.5 30.1 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.7 6C12.2 13.3 17.7 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.1 24.6c0-1.5-.1-3-.4-4.4H24v8.4h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4c4.1-3.8 6.5-9.4 6.5-16.2z"/>
                  <path fill="#FBBC05" d="M10.4 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.7-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.7-6z"/>
                  <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7-5.4c-2 1.3-4.5 2.1-8 2.1-6.3 0-11.7-4.3-13.6-10l-7.7 6C6.7 42.6 14.7 48 24 48z"/>
                </svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-white/40">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <button onClick={() => { setShowEmail(true); setIsSignUp(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 text-white border border-white/10 font-semibold text-sm hover:bg-white/10 transition-colors">
                <LogIn className="w-4 h-4" />
                Sign in with Email
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEmailAuth()} placeholder="Password" className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button onClick={handleEmailAuth} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/20 text-primary border border-primary/40 font-semibold text-sm hover:bg-primary/30 transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" />
                {loading ? "…" : isSignUp ? "Create Account" : "Sign In"}
              </button>
              <div className="flex items-center justify-between text-xs">
                <button onClick={() => setShowEmail(false)} className="text-white/40 hover:text-white">← Back</button>
                <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-primary hover:underline">
                  {isSignUp ? "Have an account? Sign in" : "New here? Create account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
