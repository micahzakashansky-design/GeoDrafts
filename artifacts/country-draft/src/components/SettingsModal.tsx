import { useState } from "react";
import { motion } from "framer-motion";
import X from "lucide-react/dist/esm/icons/x";
import User from "lucide-react/dist/esm/icons/user";
import LogOut from "lucide-react/dist/esm/icons/log-out";
import Check from "lucide-react/dist/esm/icons/check";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Moon from "lucide-react/dist/esm/icons/moon";
import Sun from "lucide-react/dist/esm/icons/sun";
import Settings from "lucide-react/dist/esm/icons/settings";
import Laptop from "lucide-react/dist/esm/icons/laptop";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { updateUsername, checkUsernameExists } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme-context";
import { Switch } from "@/components/ui/switch";
import Bug from "lucide-react/dist/esm/icons/bug";

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
  
  const [devModeEnabled, setDevModeEnabled] = useState(() => localStorage.getItem("geoDraftsDevMode") === "true");

  function toggleDevMode(checked: boolean) {
    setDevModeEnabled(checked);
    localStorage.setItem("geoDraftsDevMode", String(checked));
  }

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
            <div className="grid grid-cols-3 gap-2">
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
                    className={`px-2 py-2.5 rounded-2xl text-[10px] md:text-xs uppercase tracking-widest transition-colors border flex flex-col items-center justify-center gap-1.5 ${
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
              {profile?.username?.toLowerCase().trim() === "devtest" && (
                <div className="pt-5 border-t border-border flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Developer Mode
                  </label>
                  <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Bug className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                    <Switch checked={devModeEnabled} onCheckedChange={toggleDevMode} />
                  </div>
                </div>
              )}

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
