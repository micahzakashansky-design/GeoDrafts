import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import X from "lucide-react/dist/esm/icons/x";
import User from "lucide-react/dist/esm/icons/user";
import Users from "lucide-react/dist/esm/icons/users";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";

interface TempUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (username: string) => void;
  title?: string;
  description?: string;
}

export function TempUsernameModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Multiplayer Username",
  description = "Choose a temporary username to display in the multiplayer lobby.",
}: TempUsernameModalProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a username.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }
    setError("");
    onConfirm(trimmed);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans text-xl font-bold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Temporary Username
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  autoFocus
                  maxLength={18}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="e.g. GuestDrafter"
                  className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {error && <p className="text-xs text-red-400 font-medium mt-1.5">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              Continue to Game <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
