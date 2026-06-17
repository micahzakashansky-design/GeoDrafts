import React, { useState, useCallback, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import {
  COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import {
  CountryCard, GameOver, SelectionPhase, GameState, computeSizePopBonus,
  CATEGORY_ICONS, CATEGORY_WEIGHTS, BONUS_CATEGORIES, getCategoryStars, getPtsDisplay
} from "./GameShared";
import { SidebarRoster } from "./SidebarRoster";
import { Home, Globe as GlobeIcon } from "lucide-react";
import { SubmitDialog } from "./SubmitDialog";
import { savePersonalScore, formatRoster } from "@/lib/local-leaderboard";

export default function DoubleDraftGame() {
  const [, navigate] = useLocation();

  const [state, setState] = useState<GameState>(() => {
    const isHardMode = localStorage.getItem("countryDraftHardMode") === "true";
    let pool = [...COUNTRIES];
    shuffleArray(pool);
    const c1 = pool.pop(); const c2 = pool.pop();
    const selection = (c1 && c2) ? [c1, c2] : null;
    return {
      pool, currentCountry: null, selectionOptions: selection, mysteryCountry: null, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "double", isHardMode,
      roomCode: null, poolSeed: 0
    };
  });

  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const rosterRef = useRef<HTMLDivElement>(null);
  const localSavedRef = useRef(false);

  const totalScore = useMemo(() => {
    return CATEGORIES.reduce((sum, cat) => {
      const country = state.roster[cat]; if (!country) return sum;
      if (BONUS_CATEGORIES.includes(cat)) return sum;
      const key = getCategoryKey(cat); const raw = country.stats[key].score; const weight = CATEGORY_WEIGHTS[cat] ?? 1.0;
      return sum + Math.round(raw * weight);
    }, 0);
  }, [state.roster]);

  const bonus = useMemo(() => computeSizePopBonus(state.roster), [state.roster]);
  const finalScore = totalScore + bonus;

  React.useEffect(() => {
    if (state.gameOver && !localSavedRef.current) {
      savePersonalScore("double", { score: finalScore, roster: formatRoster(state.roster) });
      localSavedRef.current = true;
    }
  }, [state.gameOver, finalScore, state.roster]);

  const onSelectionPick = useCallback((country: Country) => {
    setState(prev => ({ ...prev, currentCountry: country, selectionOptions: null }));
  }, []);

  const assignCountry = useCallback((category: Category) => {
    if (state.roster[category]) return;
    setState(prev => {
      if (!prev.currentCountry) return prev;
      const newRoster = { ...prev.roster, [category]: prev.currentCountry };
      const isGameOver = CATEGORIES.every(c => newRoster[c]);
      const newPool = [...prev.pool];

      let nextOptions = null;
      if (!isGameOver) {
        const c1 = newPool.pop(); const c2 = newPool.pop();
        if (c1 && c2) nextOptions = [c1, c2];
      }

      return {
        ...prev, roster: newRoster, pool: newPool, currentCountry: null, selectionOptions: nextOptions,
        gameOver: isGameOver
      };
    });
    setHoveredCategory(null);
  }, [state.roster]);

  const doReset = useCallback(() => {
    const isHardMode = state.isHardMode;
    let pool = [...COUNTRIES];
    shuffleArray(pool);
    const c1 = pool.pop(); const c2 = pool.pop();
    const selection = (c1 && c2) ? [c1, c2] : null;
    setState({
      pool, currentCountry: null, selectionOptions: selection, mysteryCountry: null, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "double", isHardMode,
      roomCode: null, poolSeed: 0
    });
    localSavedRef.current = false;
  }, [state.isHardMode]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
      <header className="h-14 md:h-16 shrink-0 border-b border-border/50 bg-card/50 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"><Home className="w-5 h-5" /></button>
          <div className="h-4 w-px bg-border hidden md:block" />
          <h1 className="font-serif text-lg md:text-xl font-bold tracking-tight flex items-center gap-2"><GlobeIcon className="w-5 h-5 text-primary" />GeoDrafts - Double Draft</h1>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {!state.gameOver && (
          <div className="hidden md:flex w-80 bg-card/30 border-r border-border/50 flex-col overflow-y-auto">
             <div className="p-5 space-y-6">
                <SidebarRoster roster={state.roster} />
             </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {state.gameOver ? (
            <GameOver roster={state.roster} totalScore={finalScore} bonus={bonus} onReset={doReset} onDownload={() => {}} onWildcard={() => {}} onWildcardSelect={() => {}} setWildcardPhase={() => {}} wildcardUsed={false} wildcardPhase={false} rosterRef={rosterRef} isHardMode={state.isHardMode} isDailyMode={false} onSubmitLeaderboard={() => setShowSubmitDialog(true)} gameMode="double" leaderboardSubmitted={state.leaderboardSubmitted} />
          ) : state.selectionOptions ? (
             <SelectionPhase options={state.selectionOptions} onPick={onSelectionPick} isHardMode={state.isHardMode} mode="double" />
          ) : state.currentCountry ? (
            <CountryCard country={state.currentCountry} hoveredCategory={hoveredCategory} poolRemaining={state.pool.length} isHardMode={state.isHardMode} roster={state.roster} onAssign={assignCountry} onHover={setHoveredCategory} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading game...</div>
          )}
        </div>
      </main>
      {showSubmitDialog && <SubmitDialog score={finalScore} mode="double" roster={state.roster} onClose={() => setShowSubmitDialog(false)} onSuccess={() => setState(prev => ({ ...prev, leaderboardSubmitted: true }))} />}
    </div>
  );
}
