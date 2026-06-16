import { useState } from "react";
import { motion } from "framer-motion";
import { X, User, LogOut, Check, Loader2 } from "lucide-react";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { updateUsername } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const { profile, logout, refreshProfile, firebaseUser } = useFirebaseAuth();
  const { toast } = useToast();
  const [newUsername, setNewUsername] = useState(profile?.username || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleUpdateUsername() {
    if (!firebaseUser || !newUsername.trim()) return;
    if (newUsername === profile?.username) return;

    const trimmed = newUsername.trim();
    if (trimmed.length < 2) {
      toast({
        title: "Invalid Username",
        description: "Username must be at least 2 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateUsername(firebaseUser.uid, trimmed);
      await refreshProfile();
      toast({
        title: "Username Updated",
        description: "Your username has been successfully changed.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating your username. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-bold text-foreground">Account Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Change Username
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="New username"
                className="flex-1 px-4 py-2 rounded-xl bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
              <button
                onClick={handleUpdateUsername}
                disabled={isUpdating || !newUsername.trim() || newUsername === profile?.username}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Update
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              This name will be visible to other players on the leaderboard.
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold hover:bg-red-500/20 transition-all disabled:opacity-50"
            >
              {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
