import React, { useState, useCallback, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import {
  COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import {
  CountryCard, GameOver, SelectionPhase, GameState, computeSizePopBonus,
  CATEGORY_ICONS, CATEGORY_MAX_SCORES, BONUS_CATEGORIES, getCategoryStars, getPtsDisplay
} from "./DoubleUI";
import { SidebarRoster } from "./SidebarRoster";
import { Home, Globe as GlobeIcon } from "lucide-react";
import { Logo } from "../../components/Logo";
import { SubmitDialog } from "./SubmitDialog";
import { savePersonalScore, formatRoster } from "@/lib/local-leaderboard";

export default function DoubleDraftGame() {
  const [, navigate] = useLocation();

  const [state, setState] = useState<GameState>(() => {
    const isHardMode = localStorage.getItem("countryDraftHardMode") === "true";
    let pool = shuffleArray([...COUNTRIES]);
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
      savePersonalScore("double", { score: finalScore, roster: formatRoster(state.roster) });
      localSavedRef.current = true;
    }
  }, [state.gameOver, finalScore, state.roster]);

  const onSelectionPick = useCallback((country: Country) => {
    setState(prev => ({ ...prev, currentCountry: country, selectionOptions: null }));
  }, []);


  const applyWildcard = useCallback((cat: Category) => {
    if (!wildcardPhase || state.wildcardUsed) return;
    setState(prev => {
      const newRoster = { ...prev.roster };
      delete newRoster[cat];
      const newPool = [...prev.pool];
      const nextCountry = newPool.pop() || null;
      return { ...prev, roster: newRoster, currentCountry: nextCountry, pool: newPool, wildcardUsed: true, selectionOptions: null };
    });
    setWildcardPhase(false);
  }, [wildcardPhase, state.wildcardUsed]);

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
    let pool = shuffleArray([...COUNTRIES]);
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
    <div className="flex flex-col h-screen bg-[#000000] text-white selection:bg-white/20 overflow-hidden font-sans">
      <header className="h-14 md:h-16 shrink-0 border-b border-white/10 bg-[#000000] px-4 md:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="font-serif text-lg md:text-xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity duration-75">
            <Logo className="w-5 h-5" />GeoDrafts
          </button>
          <div className="h-4 w-px bg-white/20 hidden md:block" />
          <div className="px-2.5 py-1 rounded-md bg-[#111111] text-xs font-semibold text-white/70 border border-white/10 hidden sm:block">
            Double Draft {state.isHardMode ? "(Hard)" : "(Easy)"}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {!state.gameOver && (
          <div className="hidden md:flex w-80 bg-[#080808] border-r border-white/10 flex-col overflow-y-auto">
             <div className="p-5 space-y-6">
                <SidebarRoster roster={state.roster} isHardMode={state.isHardMode} />
             </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {state.gameOver ? (
            <GameOver roster={state.roster} totalScore={finalScore} bonus={bonus} onReset={doReset} onDownload={() => {}} onWildcard={() => setWildcardPhase(true)} onWildcardSelect={applyWildcard} setWildcardPhase={setWildcardPhase} wildcardUsed={state.wildcardUsed} wildcardPhase={wildcardPhase} rosterRef={rosterRef} isHardMode={state.isHardMode} isDailyMode={false} onSubmitLeaderboard={() => setShowSubmitDialog(true)} gameMode="double" leaderboardSubmitted={state.leaderboardSubmitted} />
          ) : state.selectionOptions ? (
             <SelectionPhase options={state.selectionOptions} onPick={onSelectionPick} isHardMode={state.isHardMode} mode="double" />
          ) : state.currentCountry ? (
            <CountryCard country={state.currentCountry} hoveredCategory={hoveredCategory} poolRemaining={state.pool.length} isHardMode={state.isHardMode} roster={state.roster} onAssign={assignCountry} onHover={setHoveredCategory} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">Loading game...</div>
          )}
        </div>
      </main>
      {showSubmitDialog && <SubmitDialog score={finalScore} mode="double" roster={state.roster} onClose={() => setShowSubmitDialog(false)} onSuccess={() => setState(prev => ({ ...prev, leaderboardSubmitted: true }))} />}
    </div>
  );
}
