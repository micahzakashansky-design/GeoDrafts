import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  COUNTRIES, ALL_COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import {
  CountryCard, GameOver, drawRosterPng, GameState, seededShuffle, dateStrToSeed,
  CATEGORY_ICONS, CATEGORY_MAX_SCORES, BONUS_CATEGORIES, getCategoryStars, getPtsDisplay
} from "./NormalUI";
import { SidebarRoster } from "./SidebarRoster";
import { Home, CalendarDays, ShieldAlert, ShieldPlus } from "lucide-react";
import { Logo } from "../../components/Logo";
import { SubmitDialog } from "./SubmitDialog";
import { savePersonalScore, formatRoster } from "@/lib/local-leaderboard";
import { SettingsButton } from "@/components/SettingsButton";
import { drawDevCountry, isDevModeActive } from "@/lib/dev-logic";
import { computeBetaSizePopBonus, getBetaPoolForDifficulty } from "@/lib/beta-logic";
import { computeSizePopBonus } from "@/lib/achievements-logic";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { BetaControls } from "./BetaControls";

export default function NormalGame({ isBetaMode = false }: { isBetaMode?: boolean }) {
  const [, navigate] = useLocation();
  const { profile } = useFirebaseAuth();

  const [difficultyIndex, setDifficultyIndex] = useState<number>(3); // 0: Easy, 1: Interm, 2: Hard, 3: Expert
  const [isBlindMode, setIsBlindMode] = useState<boolean>(false);

  const [state, setState] = useState<GameState>(() => {
    const isHardMode = isBetaMode ? isBlindMode : (localStorage.getItem("countryDraftHardMode") === "true");
    const sourcePool = isBetaMode ? getBetaPoolForDifficulty(ALL_COUNTRIES, 3) : COUNTRIES;
    let pool = shuffleArray([...sourcePool]);
    
    // We can't access profile easily in useState initializer without it being a dependency,
    // but on initial load, roster is empty, so pool.pop() is fine even in dev mode.
    const currentCountry = pool.pop() || null;

    

    return {
      pool, currentCountry, selectionOptions: null, mysteryCountry: null, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: true,
      dailyDate: "", leaderboardSubmitted: false, mode: "normal", isHardMode,
      roomCode: null, poolSeed: 0, categoryTimes: {}, currentTurnStartTime: Date.now()
    };
  });

  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [wildcardPhase, setWildcardPhase] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const rosterRef = useRef<HTMLDivElement>(null);
  const localSavedRef = useRef(false);

  

  const totalScore = useMemo(() => {
    return CATEGORIES.reduce((sum, cat) => {
      const country = state.roster[cat]; if (!country) return sum;
      
      if (BONUS_CATEGORIES.includes(cat)) return sum;
      const key = getCategoryKey(cat); const score = country.stats[key].score ?? 0;
      return sum + score;
    }, 0);
  }, [state.roster]);

  const bonus = useMemo(() => isBetaMode ? computeBetaSizePopBonus(state.roster) : computeSizePopBonus(state.roster), [state.roster, isBetaMode]);
  const finalScore = totalScore + bonus;

  React.useEffect(() => {
    if (state.gameOver && !localSavedRef.current) {
      savePersonalScore(state.isHardMode ? "hard" : "normal", { score: finalScore, roster: formatRoster(state.roster) });
      
      localSavedRef.current = true;
    }
  }, [state.gameOver, finalScore, state.roster, state.isHardMode]);

  const assignCountry = useCallback((category: Category) => {
    if (state.roster[category]) return;
    setState(prev => {
      if (!prev.currentCountry) return prev;
      const timeTaken = Date.now() - (prev.currentTurnStartTime || Date.now());
      const newCategoryTimes = { ...(prev.categoryTimes || {}), [category]: timeTaken };
      const newRoster = { ...prev.roster, [category]: prev.currentCountry };
      const isGameOver = CATEGORIES.every(c => newRoster[c]);
      const newPool = [...prev.pool];
      
      let nextCountry = null;
      if (!isGameOver) {
        if (isDevModeActive(profile?.username)) {
          nextCountry = drawDevCountry(newPool, newRoster);
        } else {
          nextCountry = newPool.pop() || null;
        }
      }

      return {
        ...prev, roster: newRoster, pool: newPool, currentCountry: nextCountry,
        gameOver: isGameOver, categoryTimes: newCategoryTimes, currentTurnStartTime: Date.now()
      };
    });
    setHoveredCategory(null);
  }, [state.roster]);

  const applyWildcard = useCallback((categoryToReplace: Category) => {
    if (!wildcardPhase || state.wildcardUsed) return;
    setState(prev => {
      const newPool = [...prev.pool];
      
      let newCountry = null;
      if (isDevModeActive(profile?.username)) {
        const tempRoster = { ...prev.roster };
        delete tempRoster[categoryToReplace];
        newCountry = drawDevCountry(newPool, tempRoster);
      } else {
        newCountry = newPool.pop() || null;
      }

      if (!newCountry) {
        const sourcePool = isBetaMode ? getBetaPoolForDifficulty(ALL_COUNTRIES, difficultyIndex) : COUNTRIES;
        const available = sourcePool.filter(c => !Object.values(prev.roster).some(rc => rc?.name === c.name));
        newCountry = shuffleArray(available)[0] || null;
      }
      
      if (!newCountry) return prev;
      return {
        ...prev,
        roster: { ...prev.roster, [categoryToReplace]: newCountry },
        pool: newPool,
        wildcardUsed: true,
      };
    });
    setWildcardPhase(false);
  }, [wildcardPhase, state.wildcardUsed, isBetaMode, difficultyIndex, profile?.username]);

  React.useEffect(() => {
    if (!state.currentCountry && !state.gameOver) {
      const sourcePool = isBetaMode ? getBetaPoolForDifficulty(ALL_COUNTRIES, difficultyIndex) : COUNTRIES;
      if (sourcePool.length > 0) {
        setState(prev => {
          if (prev.currentCountry) return prev;
          let newPool = shuffleArray([...sourcePool]);
          const nextCountry = newPool.pop() || null;
          return { ...prev, pool: newPool, currentCountry: nextCountry };
        });
      }
    }
  }, [state.currentCountry, state.gameOver, isBetaMode, difficultyIndex]);

  const [pendingChange, setPendingChange] = useState<{ type: "difficulty" | "blind"; value: number | boolean } | null>(null);

  const startNewRoundWithSettings = useCallback((newDiff?: number, newBlind?: boolean) => {
    const nextDiff = newDiff !== undefined ? newDiff : difficultyIndex;
    const nextBlind = newBlind !== undefined ? newBlind : isBlindMode;

    if (newDiff !== undefined) setDifficultyIndex(newDiff);
    if (newBlind !== undefined) setIsBlindMode(newBlind);

    localSavedRef.current = false;
    const isHardMode = isBetaMode ? nextBlind : state.isHardMode;
    const sourcePool = isBetaMode ? getBetaPoolForDifficulty(ALL_COUNTRIES, nextDiff) : COUNTRIES;
    let pool = shuffleArray([...sourcePool]);
    const currentCountry = pool.pop() || null;

    setState({
      pool, currentCountry, selectionOptions: null, mysteryCountry: null, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "normal", isHardMode,
      roomCode: null, poolSeed: 0, categoryTimes: {}, currentTurnStartTime: Date.now()
    });
    setWildcardPhase(false);
  }, [difficultyIndex, isBlindMode, isBetaMode, state.isHardMode]);

  const handleDifficultyChange = useCallback((newIdx: number) => {
    const isMidRound = Object.keys(state.roster).length > 0 && !state.gameOver;
    if (isMidRound) {
      setPendingChange({ type: "difficulty", value: newIdx });
    } else {
      startNewRoundWithSettings(newIdx, undefined);
    }
  }, [state.roster, state.gameOver, startNewRoundWithSettings]);

  const handleBlindModeChange = useCallback((val: boolean) => {
    const isMidRound = Object.keys(state.roster).length > 0 && !state.gameOver;
    if (isMidRound) {
      setPendingChange({ type: "blind", value: val });
    } else {
      startNewRoundWithSettings(undefined, val);
    }
  }, [state.roster, state.gameOver, startNewRoundWithSettings]);

  const confirmPendingChange = useCallback(() => {
    if (!pendingChange) return;
    if (pendingChange.type === "difficulty") {
      startNewRoundWithSettings(pendingChange.value as number, undefined);
    } else if (pendingChange.type === "blind") {
      startNewRoundWithSettings(undefined, pendingChange.value as boolean);
    }
    setPendingChange(null);
  }, [pendingChange, startNewRoundWithSettings]);

  const doReset = useCallback(() => {
    startNewRoundWithSettings(difficultyIndex, isBlindMode);
  }, [startNewRoundWithSettings, difficultyIndex, isBlindMode]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground selection:bg-primary/20 overflow-hidden font-sans">
      <header className="h-20 shrink-0 border-b border-border bg-background px-4 md:px-8 flex items-center justify-between z-20 gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => navigate("/")} className="font-sans text-lg md:text-xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity duration-75">
            <Logo className="w-5 h-5" />GeoDrafts
          </button>
          <div className="h-4 w-px bg-border hidden md:block" />
          <div className="px-3 py-1.5 rounded-full bg-card border border-border text-xs font-bold text-muted-foreground hidden sm:flex items-center gap-2 tracking-widest uppercase">
            {isBetaMode ? "BETA 1.0" : "Classic"} {state.isHardMode ? <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> : <ShieldPlus className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
        </div>

        {isBetaMode && (
          <BetaControls
            difficultyIndex={difficultyIndex}
            onDifficultyChange={handleDifficultyChange}
            isBlindMode={isBlindMode}
            onBlindModeChange={handleBlindModeChange}
          />
        )}

        <div className="flex items-center gap-3 shrink-0">
          <SettingsButton />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {!state.gameOver && (
          <div className="hidden md:flex w-80 bg-card border-r border-border flex-col overflow-y-auto">
             <div className="p-5 space-y-6">
                <SidebarRoster roster={state.roster} categoryTimes={state.categoryTimes} isHardMode={state.isHardMode} isBetaMode={isBetaMode} />
             </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {state.gameOver ? (
            <GameOver roster={state.roster} categoryTimes={state.categoryTimes} totalScore={finalScore} bonus={bonus} onReset={doReset} onDownload={() => drawRosterPng(state.roster, finalScore, bonus, state.isHardMode, isBetaMode)} onWildcard={() => setWildcardPhase(true)} onWildcardSelect={applyWildcard} setWildcardPhase={setWildcardPhase} wildcardUsed={state.wildcardUsed} wildcardPhase={wildcardPhase} rosterRef={rosterRef} isHardMode={state.isHardMode} isDailyMode={false} onSubmitLeaderboard={() => setShowSubmitDialog(true)} gameMode="daily" leaderboardSubmitted={state.leaderboardSubmitted} isBetaMode={isBetaMode} />
          ) : state.currentCountry ? (
            <CountryCard country={state.currentCountry} hoveredCategory={hoveredCategory} poolRemaining={state.pool.length} isHardMode={state.isHardMode} roster={state.roster} onAssign={assignCountry} onHover={setHoveredCategory} isBetaMode={isBetaMode} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading game...</div>
          )}
        </div>
      </main>
      {showSubmitDialog && !isDevModeActive(profile?.username) && (
        <SubmitDialog score={finalScore} mode={state.isHardMode ? "hard" : "normal"} roster={state.roster} onClose={() => setShowSubmitDialog(false)} onSuccess={() => setState(prev => ({ ...prev, leaderboardSubmitted: true }))} />
      )}

      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Abandon Current Draft?</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are currently in the middle of a draft round. Changing difficulty settings or toggling Blind Mode will abandon your current progress and start a brand new round.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingChange(null)}
                className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground font-bold text-sm hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmPendingChange}
                className="px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-md cursor-pointer"
              >
                Start New Round
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
