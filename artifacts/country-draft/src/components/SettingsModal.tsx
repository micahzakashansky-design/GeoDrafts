import { useState } from "react";
import { motion } from "framer-motion";
import { X, User, LogOut, Check, Loader2, Moon, Sun, Settings, Laptop } from "lucide-react";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { updateUsername, checkUsernameExists } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme-context";

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const { profile, logout, refreshProfile, firebaseUser } = useFirebaseAuth();
  const { toast } = useToast();
  const [newUsername, setNewUsername] = useState(profile?.username || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { theme, setTheme } = useTheme();

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
      const exists = await checkUsernameExists(trimmed);
      if (exists) {
        toast({
          title: "Username Taken",
          description: "That username is already in use by someone else.",
          variant: "destructive",
        });
        return;
      }
      
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
    <>
      <div 
        className="fixed inset-0 z-50" 
        onClick={onClose} 
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="fixed top-16 right-6 z-50 bg-card border border-border rounded-2xl w-[360px] shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-sans text-lg font-bold text-card-foreground">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Theme
            </label>
            <div className="flex gap-2 flex-wrap">
              {([
                { key: "system", label: "System", icon: Laptop, activeClass: "bg-primary text-primary-foreground font-black" },
                { key: "light", label: "Light", icon: Sun, activeClass: "bg-amber-400 text-black font-black" },
                { key: "dark", label: "Dark", icon: Moon, activeClass: "bg-indigo-600 text-white font-black" }
              ] as const).map((tab) => {
                const TabIcon = tab.icon;
                const isActive = theme === tab.key;
                return (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    key={tab.key}
                    onClick={() => setTheme(tab.key)}
                    className={`px-5 py-2.5 rounded-full text-sm uppercase tracking-widest transition-colors border flex items-center gap-2 ${
                      isActive
                        ? tab.activeClass + " border-transparent"
                        : "text-muted-foreground font-bold border-border hover:text-foreground hover:bg-muted/50 bg-card"
                    }`}
                  >
                    <TabIcon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {firebaseUser && (
            <>
              <div className="space-y-3 pt-5 border-t border-border">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Change Username
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="New username"
                    className="flex-1 px-3 py-2 text-sm rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground min-w-0"
                  />
                  <button
                    onClick={handleUpdateUsername}
                    disabled={isUpdating || !newUsername.trim() || newUsername === profile?.username}
                    className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Update
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  This name will be visible to other players on the leaderboard.
                </p>
              </div>

              <div className="pt-5 border-t border-border">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-bold hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
