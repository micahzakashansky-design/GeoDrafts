import { useState } from "react";
import { Settings, Bug } from "lucide-react";
import { SettingsModal } from "./SettingsModal";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { Switch } from "@/components/ui/switch";

export function SettingsButton() {
  const [showSettings, setShowSettings] = useState(false);
  const { firebaseUser, profile } = useFirebaseAuth();

  const [devModeEnabled, setDevModeEnabled] = useState(() => localStorage.getItem("geoDraftsDevMode") === "true");

  function toggleDevMode(checked: boolean) {
    setDevModeEnabled(checked);
    localStorage.setItem("geoDraftsDevMode", String(checked));
    // Optionally reload to apply state immediately everywhere if needed, 
    // but the state is read by hooks/logic where it's used.
    window.dispatchEvent(new Event('storage'));
  }

  const isDevTest = profile?.username?.toLowerCase().trim() === "devtest";

  return (
    <div className="flex items-center gap-3">
      {isDevTest && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
          <Bug className="w-4 h-4 text-primary" />
          <Switch checked={devModeEnabled} onCheckedChange={toggleDevMode} />
        </div>
      )}
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
