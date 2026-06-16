import React, { useState, useCallback, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import {
  COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import {
  CountryCard, GameOver, GameState, computeSizePopBonus,
  CATEGORY_ICONS, CATEGORY_WEIGHTS, BONUS_CATEGORIES, getCategoryStars, getPtsDisplay
} from "./GameShared";
import { Home, Globe as GlobeIcon } from "lucide-react";
import { SubmitDialog } from "./SubmitDialog";

export default function NormalGame() {
  const [, navigate] = useLocation();

  const [state, setState] = useState<GameState>(() => {
    const isHardMode = localStorage.getItem("countryDraftHardMode") === "true";
    let pool = [...COUNTRIES];
    shuffleArray(pool);
    const currentCountry = pool.pop() || null;
    return {
      pool, currentCountry, selectionOptions: null, mysteryCountry: null, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "normal", isHardMode,
      roomCode: null, poolSeed: 0
    };
  });

  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [wildcardPhase, setWildcardPhase] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const rosterRef = useRef<HTMLDivElement>(null);

  const totalScore = useMemo(() => {
    return CATEGORIES.reduce((sum, cat) => {
      const country = state.roster[cat]; if (!country) return sum;
      if (BONUS_CATEGORIES.includes(cat)) return sum;
      const key = getCategoryKey(cat); const raw = country.stats[key].score; const weight = CATEGORY_WEIGHTS[cat] ?? 1.0;
      return sum + raw * weight;
    }, 0);
  }, [state.roster]);

  const bonus = useMemo(() => computeSizePopBonus(state.roster), [state.roster]);
  const finalScore = totalScore + bonus;

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
    const isHardMode = state.isHardMode;
    let pool = [...COUNTRIES];
    shuffleArray(pool);
    setState({
      pool, currentCountry: pool.pop() || null, selectionOptions: null, mysteryCountry: null, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "normal", isHardMode,
      roomCode: null, poolSeed: 0
    });
  }, [state.isHardMode]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
      <header className="h-14 md:h-16 shrink-0 border-b border-border/50 bg-card/50 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"><Home className="w-5 h-5" /></button>
          <div className="h-4 w-px bg-border hidden md:block" />
          <h1 className="font-serif text-lg md:text-xl font-bold tracking-tight flex items-center gap-2"><GlobeIcon className="w-5 h-5 text-primary" />GeoDrafts</h1>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {!state.gameOver && (
          <div className="hidden md:flex w-80 bg-card/30 border-r border-border/50 flex-col overflow-y-auto">
             <div className="p-5 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1"><h3 className="text-sm font-bold text-foreground">Your Roster</h3><span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{Object.keys(state.roster).length}/{CATEGORIES.length}</span></div>
                  <div className="space-y-1.5">
                    {Object.keys(state.roster).length === 0 ? (
                      <div className="py-6 text-center rounded-xl border border-dashed border-border/50 bg-secondary/10"><p className="text-xs text-muted-foreground font-medium">Select a category on the right<br/>to begin drafting.</p></div>
                    ) : (
                      CATEGORIES.filter(c => state.roster[c]).map(category => {
                        const assigned = state.roster[category]!; const catKey = getCategoryKey(category); const isBonus = BONUS_CATEGORIES.includes(category); const stars = getCategoryStars(category); const score = !isBonus ? assigned.stats[catKey].score : null;
                        return (
                          <div key={category} className="w-full rounded-lg border border-border/25 bg-muted/10 opacity-80 text-left transition-all">
                            <div className="px-3 py-2 flex items-center justify-between">
                              <div className="flex items-center gap-2 overflow-hidden"><span className="text-muted-foreground shrink-0">{CATEGORY_ICONS[category]}</span><div className="truncate"><div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground truncate">{category}</div><div className="text-xs font-semibold text-foreground/80 truncate">{assigned.flag} {assigned.name}</div></div></div>
                              <div className="flex flex-col items-end gap-1 shrink-0"><span className="text-[9px] text-yellow-400/40">{stars}</span>{!isBonus && score !== null && (<span className="text-[10px] font-bold text-primary">{getPtsDisplay(score, category)}</span>)}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Draft Categories</p>
                  {CATEGORIES.map(category => {
                    const assigned = state.roster[category]; const isAssignable = !assigned && !!state.currentCountry && !state.gameOver; const stars = getCategoryStars(category);
                    return (
                      <button key={category} onClick={() => { if (isAssignable) assignCountry(category); }} onMouseEnter={() => setHoveredCategory(category)} onMouseLeave={() => setHoveredCategory(null)} disabled={!isAssignable} className={`w-full rounded-lg border text-left transition-all ${assigned ? "border-border/25 bg-muted/10 opacity-60" : isAssignable ? "border-primary/30 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/60" : "border-border/10 bg-card/5 opacity-40"}`}>
                        <div className="px-3 py-2 flex items-center justify-between"><div className="flex items-center gap-2 overflow-hidden"><span className="text-muted-foreground shrink-0">{CATEGORY_ICONS[category]}</span><div className="truncate"><div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground truncate">{category}</div>{assigned && <div className="text-xs font-semibold text-foreground/80 truncate">{assigned.flag} {assigned.name}</div>}</div></div><span className="text-[9px] text-yellow-400/40 shrink-0">{stars}</span></div>
                      </button>
                    );
                  })}
                </div>
             </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {state.gameOver ? (
            <GameOver roster={state.roster} totalScore={finalScore} bonus={bonus} onReset={doReset} onDownload={() => {}} onWildcard={() => setWildcardPhase(true)} onWildcardSelect={applyWildcard} setWildcardPhase={setWildcardPhase} wildcardUsed={state.wildcardUsed} wildcardPhase={wildcardPhase} rosterRef={rosterRef} isHardMode={state.isHardMode} isDailyMode={false} onSubmitLeaderboard={() => setShowSubmitDialog(true)} gameMode="normal" leaderboardSubmitted={state.leaderboardSubmitted} />
          ) : state.currentCountry ? (
            <CountryCard country={state.currentCountry} hoveredCategory={hoveredCategory} poolRemaining={state.pool.length} isHardMode={state.isHardMode} roster={state.roster} onAssign={assignCountry} onHover={setHoveredCategory} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading game...</div>
          )}
        </div>
      </main>
      {showSubmitDialog && <SubmitDialog score={finalScore} mode="normal" roster={state.roster} onClose={() => setShowSubmitDialog(false)} onSuccess={() => setState(prev => ({ ...prev, leaderboardSubmitted: true }))} />}
    </div>
  );
}
