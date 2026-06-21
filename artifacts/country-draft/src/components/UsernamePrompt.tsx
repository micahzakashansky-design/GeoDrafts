import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Check } from "lucide-react";
import { createUserProfile, checkUsernameExists } from "@/lib/firestore";
import type { User } from "firebase/auth";

interface Props {
  user: User;
  onComplete: () => void;
}

export function UsernamePrompt({ user, onComplete }: Props) {
  const suggested = (user.displayName || "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 20);

  const [username, setUsername] = useState(suggested);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      setError("Must be at least 2 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError("Only letters, numbers, and underscores.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const exists = await checkUsernameExists(trimmed);
      if (exists) {
        setError("Username is already taken.");
        return;
      }
      await createUserProfile(user.uid, trimmed);
      onComplete();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="bg-[#000000] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <span className="font-serif text-lg font-bold text-white">
            Choose a username
          </span>
        </div>
        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-white/40">
            Welcome to GeoDrafts! Pick a name that will appear on the global
            leaderboard.
          </p>
          <div className="space-y-1.5">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="e.g. DraftMaster42"
              maxLength={30}
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <p className="text-xs text-white/40">
              Letters, numbers, underscores. 2–30 characters.
            </p>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || username.trim().length < 2}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              !saving && username.trim().length >= 2
                ? "bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30"
                : "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
            }`}
          >
            <Check className="w-4 h-4" />
            {saving ? "Saving…" : "Save & Continue"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
