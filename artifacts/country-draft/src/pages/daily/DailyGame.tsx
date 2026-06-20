import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import {
  CountryCard, GameOver, GameState, computeSizePopBonus, seededShuffle, dateStrToSeed,
  CATEGORY_ICONS, CATEGORY_MAX_SCORES, BONUS_CATEGORIES, getCategoryStars, getPtsDisplay
} from "./DailyUI";
import { SidebarRoster } from "./SidebarRoster";
import { ChevronLeft, Home, Globe as GlobeIcon, CalendarDays } from "lucide-react";
import { Logo } from "../../components/Logo";
import { SubmitDialog } from "./SubmitDialog";
import { savePersonalScore, formatRoster } from "@/lib/local-leaderboard";

export default function DailyGame() {
  const [, navigate] = useLocation();

  const [state, setState] = useState<GameState>(() => {
    const dailyDate = new Date().toISOString().slice(0, 10);
    const poolSeed = dateStrToSeed(dailyDate);
    const pool = seededShuffle([...COUNTRIES], poolSeed);
    const mystery = null;
    const selection = null;
    const currentCountry = pool.pop() || null;

    // Check local storage for existing daily state
    try {
        const saved = localStorage.getItem(`countryDraftState_daily_${dailyDate}`);
        if (saved) return JSON.parse(saved);
    } catch {}

    return {
      pool, currentCountry, selectionOptions: selection, mysteryCountry: mystery, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: true,
      dailyDate, leaderboardSubmitted: false, mode: "normal", isHardMode: false,
      roomCode: null, poolSeed
    };
  });

  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [wildcardPhase, setWildcardPhase] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const rosterRef = useRef<HTMLDivElement>(null);
  const localSavedRef = useRef(false);

  // Save state on change
  useEffect(() => {
     localStorage.setItem(`countryDraftState_daily_${state.dailyDate}`, JSON.stringify(state));
  }, [state]);

  const totalScore = useMemo(() => {
    return CATEGORIES.reduce((sum, cat) => {
      const country = state.roster[cat]; if (!country) return sum;
      if (BONUS_CATEGORIES.includes(cat)) return sum;
      const key = getCategoryKey(cat); const score = country.stats[key].score;
      return sum + score;
    }, 0);
  }, [state.roster]);

  const bonus = useMemo(() => computeSizePopBonus(state.roster), [state.roster]);
  const finalScore = totalScore + bonus;

  React.useEffect(() => {
    if (state.gameOver && !localSavedRef.current) {
      savePersonalScore("daily", { score: finalScore, roster: formatRoster(state.roster) });
      localStorage.setItem(`countryDraftDailyResult_${state.dailyDate}`, JSON.stringify({ score: finalScore, completed: true }));
      localSavedRef.current = true;
    }
  }, [state.gameOver, finalScore, state.roster, state.dailyDate]);

  const assignCountry = useCallback((category: Category) => {
    if (state.roster[category]) return;
    setState(prev => {
      if (!prev.currentCountry) return prev;
      const newRoster = { ...prev.roster, [category]: prev.currentCountry };
      const isGameOver = CATEGORIES.every(c => newRoster[c]);
      const newPool = [...prev.pool];
      const nextCountry = isGameOver ? null : newPool.pop() || null;

      return {
        ...prev, roster: newRoster, pool: newPool, currentCountry: nextCountry,
        gameOver: isGameOver
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
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
            <header className="h-14 md:h-16 shrink-0 border-b border-white/5 bg-card/30 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 relative">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors font-bold text-sm uppercase tracking-widest z-10"
        >
          <ChevronLeft className="w-4 h-4" />
          Leave Game
        </button>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-3 font-serif font-bold text-xl">
            <Logo className="w-6 h-6" /> GeoDrafts
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {!state.gameOver && (
          <div className="hidden md:flex w-80 bg-card/30 border-r border-border/50 flex-col overflow-y-auto">
             <div className="p-5 space-y-6">
                <SidebarRoster roster={state.roster} isHardMode={state.isHardMode} />
             </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {state.gameOver ? (
            <GameOver roster={state.roster} totalScore={finalScore} bonus={bonus} onReset={doReset} onDownload={() => {}} onWildcard={() => setWildcardPhase(true)} onWildcardSelect={applyWildcard} setWildcardPhase={setWildcardPhase} wildcardUsed={state.wildcardUsed} wildcardPhase={wildcardPhase} rosterRef={rosterRef} isHardMode={state.isHardMode} isDailyMode={true} onSubmitLeaderboard={() => setShowSubmitDialog(true)} gameMode="daily" leaderboardSubmitted={state.leaderboardSubmitted} />
          ) : state.currentCountry ? (
            <CountryCard country={state.currentCountry} hoveredCategory={hoveredCategory} poolRemaining={state.pool.length} isHardMode={state.isHardMode} roster={state.roster} onAssign={assignCountry} onHover={setHoveredCategory} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading game...</div>
          )}
        </div>
      </main>
      {showSubmitDialog && <SubmitDialog score={finalScore} mode="daily" roster={state.roster} onClose={() => setShowSubmitDialog(false)} onSuccess={() => setState(prev => ({ ...prev, leaderboardSubmitted: true }))} />}
    </div>
  );
}
