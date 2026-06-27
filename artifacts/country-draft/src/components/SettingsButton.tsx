import { useState } from "react";
import Settings from "lucide-react/dist/esm/icons/settings";
import Bug from "lucide-react/dist/esm/icons/bug";
import { SettingsModal } from "./SettingsModal";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { Switch } from "@/components/ui/switch";

export function SettingsButton() {
  const [showSettings, setShowSettings] = useState(false);
  const { firebaseUser, profile } = useFirebaseAuth();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setShowSettings(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold bg-card border border-border text-card-foreground hover:bg-muted transition-colors shadow-sm"
      >
        <Settings className="w-4 h-4 opacity-70" />
        <span className="hidden sm:inline">{firebaseUser ? profile?.username || "Account" : "Settings"}</span>
      </button>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
