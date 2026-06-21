import { computeSizePopBonus } from "@/lib/achievements-logic";
import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import {
  CountryCard, GameOver, GameState, seededShuffle, dateStrToSeed,
  CATEGORY_ICONS, CATEGORY_MAX_SCORES, BONUS_CATEGORIES, getCategoryStars, getPtsDisplay
} from "./NormalUI";
import { SidebarRoster } from "./SidebarRoster";
import { Home, CalendarDays, ShieldAlert, ShieldPlus } from "lucide-react";
import { Logo } from "../../components/Logo";
import { SubmitDialog } from "./SubmitDialog";
import { savePersonalScore, formatRoster } from "@/lib/local-leaderboard";

export default function NormalGame() {
  const [, navigate] = useLocation();

  const [state, setState] = useState<GameState>(() => {
    const isHardMode = localStorage.getItem("countryDraftHardMode") === "true";
    
    let pool = shuffleArray([...COUNTRIES]);
    
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

  const bonus = useMemo(() => computeSizePopBonus(state.roster), [state.roster]);
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
      const nextCountry = isGameOver ? null : newPool.pop() || null;

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
      const newCountry = newPool.pop();
      if (!newCountry) return prev;
      return {
        ...prev,
        roster: { ...prev.roster, [categoryToReplace]: newCountry },
        pool: newPool,
        wildcardUsed: true,
      };
    });
    setWildcardPhase(false);
  }, [wildcardPhase, state.wildcardUsed]);

  const doReset = useCallback(() => {
     localSavedRef.current = false;
     navigate("/");
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground selection:bg-primary/20 overflow-hidden font-sans">
      <header className="h-20 shrink-0 border-b border-border bg-background px-6 md:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="font-sans text-lg md:text-xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity duration-75">
            <Logo className="w-5 h-5" />GeoDrafts
          </button>
          <div className="h-4 w-px bg-border hidden md:block" />
          <div className="px-3 py-1.5 rounded-full bg-card border border-border text-xs font-bold text-muted-foreground hidden sm:flex items-center gap-2 tracking-widest uppercase">
            Classic {state.isHardMode ? <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> : <ShieldPlus className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {!state.gameOver && (
          <div className="hidden md:flex w-80 bg-card border-r border-border flex-col overflow-y-auto">
             <div className="p-5 space-y-6">
                <SidebarRoster roster={state.roster} categoryTimes={state.categoryTimes} isHardMode={state.isHardMode} />
             </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {state.gameOver ? (
            <GameOver roster={state.roster} categoryTimes={state.categoryTimes} totalScore={finalScore} bonus={bonus} onReset={doReset} onDownload={() => {}} onWildcard={() => setWildcardPhase(true)} onWildcardSelect={applyWildcard} setWildcardPhase={setWildcardPhase} wildcardUsed={state.wildcardUsed} wildcardPhase={wildcardPhase} rosterRef={rosterRef} isHardMode={state.isHardMode} isDailyMode={false} onSubmitLeaderboard={() => setShowSubmitDialog(true)} gameMode="daily" leaderboardSubmitted={state.leaderboardSubmitted} />
          ) : state.currentCountry ? (
            <CountryCard country={state.currentCountry} hoveredCategory={hoveredCategory} poolRemaining={state.pool.length} isHardMode={state.isHardMode} roster={state.roster} onAssign={assignCountry} onHover={setHoveredCategory} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading game...</div>
          )}
        </div>
      </main>
      {showSubmitDialog && <SubmitDialog score={finalScore} mode={state.isHardMode ? "hard" : "normal"} roster={state.roster} onClose={() => setShowSubmitDialog(false)} onSuccess={() => setState(prev => ({ ...prev, leaderboardSubmitted: true }))} />}
    </div>
  );
}
