import React from "react";
import { Eye, EyeOff } from "lucide-react";

export const BETA_DIFFICULTY_CONFIG = [
  {
    name: "Easy",
    poolSize: 55,
    color: "text-emerald-400",
    border: "border-emerald-500/50",
    bg: "bg-emerald-500",
    badgeBg: "bg-emerald-500/20",
    accent: "#10b981",
  },
  {
    name: "Intermediate",
    poolSize: 85,
    color: "text-yellow-400",
    border: "border-yellow-500/50",
    bg: "bg-yellow-500",
    badgeBg: "bg-yellow-500/20",
    accent: "#eab308",
  },
  {
    name: "Hard",
    poolSize: 125,
    color: "text-red-500",
    border: "border-red-500/50",
    bg: "bg-red-500",
    badgeBg: "bg-red-500/20",
    accent: "#ef4444",
  },
  {
    name: "Expert",
    poolSize: 179,
    color: "text-purple-400",
    border: "border-purple-500/50",
    bg: "bg-purple-500",
    badgeBg: "bg-purple-500/20",
    accent: "#a855f7",
  },
];

export function BetaControls({
  difficultyIndex,
  onDifficultyChange,
  isBlindMode,
  onBlindModeChange,
}: {
  difficultyIndex: number;
  onDifficultyChange: (index: number) => void;
  isBlindMode: boolean;
  onBlindModeChange: (val: boolean) => void;
}) {
  const currentConfig = BETA_DIFFICULTY_CONFIG[difficultyIndex] || BETA_DIFFICULTY_CONFIG[3];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Difficulty Slider */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Difficulty:
        </span>
        <span
          className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border transition-all ${currentConfig.badgeBg} ${currentConfig.color} ${currentConfig.border}`}
        >
          {currentConfig.name} ({currentConfig.poolSize})
        </span>
        <input
          type="range"
          min="0"
          max="3"
          step="1"
          value={difficultyIndex}
          onChange={(e) => onDifficultyChange(parseInt(e.target.value, 10))}
          style={{ accentColor: currentConfig.accent }}
          className="w-24 md:w-32 h-1.5 rounded-lg appearance-none cursor-pointer bg-muted transition-colors"
        />
      </div>

      {/* Blind Mode Button */}
      <button
        onClick={() => onBlindModeChange(!isBlindMode)}
        title="Blind Mode hides all score numbers until the end of the draft"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm cursor-pointer ${
          isBlindMode
            ? "text-red-500 border-red-500/60 bg-red-500/15 shadow-red-500/10"
            : "text-muted-foreground border-border bg-card opacity-70 hover:opacity-100"
        }`}
      >
        {isBlindMode ? (
          <EyeOff className="w-4 h-4 text-red-500 shrink-0" />
        ) : (
          <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <span>Blind Mode</span>
      </button>
    </div>
  );
}
