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
  const [localValue, setLocalValue] = React.useState<number>(difficultyIndex);
  const [rawPos, setRawPos] = React.useState<number>(difficultyIndex);
  const isDraggingRef = React.useRef(false);
  const currentStepRef = React.useRef<number>(difficultyIndex);

  React.useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalValue(difficultyIndex);
      setRawPos(difficultyIndex);
      currentStepRef.current = difficultyIndex;
    }
  }, [difficultyIndex]);

  // Hysteresis Buffer Zone algorithm (requires passing past dead-band buffer before step switches)
  const updateHysteresis = (continuousVal: number) => {
    setRawPos(continuousVal);
    const curr = currentStepRef.current;
    let nextStep = curr;

    // Buffer zone threshold (requires +0.65 / -0.65 hysteresis margin to switch step)
    if (continuousVal > curr + 0.65 && curr < 3) {
      nextStep = Math.min(3, Math.floor(continuousVal + 0.35));
    } else if (continuousVal < curr - 0.65 && curr > 0) {
      nextStep = Math.max(0, Math.ceil(continuousVal - 0.35));
    }

    if (nextStep !== curr) {
      currentStepRef.current = nextStep;
      setLocalValue(nextStep);
    }
  };

  const handleCommit = () => {
    isDraggingRef.current = false;
    const finalStep = currentStepRef.current;
    setRawPos(finalStep);
    if (finalStep !== difficultyIndex) {
      onDifficultyChange(finalStep);
    }
  };

  const currentConfig = BETA_DIFFICULTY_CONFIG[localValue] || BETA_DIFFICULTY_CONFIG[3];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Difficulty Slider & Pill Group */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:inline">
          Difficulty:
        </span>
        
        {/* Active Badge */}
        <span
          className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border transition-all ${currentConfig.badgeBg} ${currentConfig.color} ${currentConfig.border}`}
        >
          {currentConfig.name} ({currentConfig.poolSize})
        </span>

        {/* Continuous Range Slider with Hysteresis Buffer Zone */}
        <input
          type="range"
          min="0"
          max="3"
          step="0.01"
          value={rawPos}
          onPointerDown={() => { isDraggingRef.current = true; }}
          onMouseDown={() => { isDraggingRef.current = true; }}
          onTouchStart={() => { isDraggingRef.current = true; }}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            updateHysteresis(val);
          }}
          onPointerUp={handleCommit}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          onKeyUp={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              handleCommit();
            }
          }}
          style={{ accentColor: currentConfig.accent }}
          className="w-20 sm:w-28 md:w-32 h-1.5 rounded-lg appearance-none cursor-pointer bg-muted transition-colors touch-none"
        />

        {/* Quick Select Pill Buttons */}
        <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-border/60">
          {BETA_DIFFICULTY_CONFIG.map((cfg, idx) => {
            const isActive = localValue === idx;
            return (
              <button
                key={cfg.name}
                onClick={() => {
                  currentStepRef.current = idx;
                  setLocalValue(idx);
                  setRawPos(idx);
                  if (idx !== difficultyIndex) {
                    onDifficultyChange(idx);
                  }
                }}
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-all cursor-pointer border ${
                  isActive
                    ? `${cfg.badgeBg} ${cfg.color} ${cfg.border}`
                    : "text-muted-foreground/60 border-transparent hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {cfg.name}
              </button>
            );
          })}
        </div>
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
