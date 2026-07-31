import { useState } from "react";
import Settings from "lucide-react/dist/esm/icons/settings";
import LogIn from "lucide-react/dist/esm/icons/log-in";
import { SettingsModal } from "./SettingsModal";
import { AuthModal } from "./AuthModal";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function SettingsButton() {
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { firebaseUser, profile, isGuest } = useFirebaseAuth();
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setShowSettings(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold bg-card border border-border text-card-foreground hover:bg-muted transition-colors shadow-sm"
      >
        <Settings className="w-4 h-4 opacity-70" />
        <span className="hidden sm:inline">
          {firebaseUser && profile ? profile.username : isGuest ? "Guest Settings" : "Settings"}
        </span>
      </button>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

