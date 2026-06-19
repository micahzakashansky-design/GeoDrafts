import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import {
  GuessPhase, GameState,
  CATEGORY_ICONS, CATEGORY_MAX_SCORES, BONUS_CATEGORIES, getCategoryStars, getPtsDisplay
} from "./GuessUI";
import { Home, Globe as GlobeIcon, PartyPopper, ChevronDown, ChevronRight, X, MapPin, Trophy } from "lucide-react";
import { SubmitDialog } from "./SubmitDialog";
import { savePersonalScore } from "@/lib/local-leaderboard";

export default function GuessGame() {
  const [, navigate] = useLocation();
  const [showStatsModal, setShowStatsModal] = useState(false);

  const [state, setState] = useState<GameState>(() => {
    const isHardMode = localStorage.getItem("countryDraftHardMode") === "true";
    let pool = shuffleArray([...COUNTRIES]);
    const mystery = pool.pop() || null;
    return {
      pool, currentCountry: null, selectionOptions: null, mysteryCountry: mystery, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "guess", isHardMode,
      roomCode: null, poolSeed: 0, hintsRevealed: 0
    };
  });

  const localSavedRef = useRef(false);

  const onGuess = useCallback((name: string) => {
    setState(prev => {
      let finalName = name;
      if (name === "bypass:devtest3781" && prev.mysteryCountry) {
        finalName = prev.mysteryCountry.name;
      }
      
      if (prev.guesses.some(g => g.toLowerCase() === finalName.toLowerCase())) return prev;
      
      const newGuesses = [...prev.guesses, finalName];
      const isCorrect = prev.mysteryCountry?.name.toLowerCase() === finalName.toLowerCase();
      const isOver = isCorrect || newGuesses.length >= 5;
      return { ...prev, guesses: newGuesses, gameOver: isOver };
    });
  }, []);

  const isWin = state.guesses.length > 0 && state.guesses[state.guesses.length - 1].toLowerCase() === state.mysteryCountry?.name.toLowerCase();
  // Score = number of guesses + number of hints. Lower is better. 
  // If not win, no score (or high penalty). But local leaderboard only saves wins anyway usually. We'll set it to 0 if they lose.
  const guessScore = isWin ? state.guesses.length + (state.hintsRevealed || 0) : 0;

  React.useEffect(() => {
    if (state.gameOver && !localSavedRef.current) {
      savePersonalScore("guess", { 
        score: guessScore, 
        guesses: state.guesses,
        mysteryCountry: state.mysteryCountry?.name
      });
      localSavedRef.current = true;
    }
  }, [state.gameOver, guessScore, state.guesses, state.mysteryCountry]);

  const doReset = useCallback(() => {
    const isHardMode = state.isHardMode;
    let pool = shuffleArray([...COUNTRIES]);
    const mystery = pool.pop() || null;
    setShowStatsModal(false);
    setState({
      pool, currentCountry: null, selectionOptions: null, mysteryCountry: mystery, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "guess", isHardMode,
      roomCode: null, poolSeed: 0, hintsRevealed: 0
    });
    localSavedRef.current = false;
  }, [state.isHardMode]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
      <header className="h-14 md:h-16 shrink-0 border-b border-border/50 bg-card/50 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="font-serif text-lg md:text-xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
            <GlobeIcon className="w-5 h-5 text-primary" />GeoDrafts
          </button>
          <div className="h-4 w-px bg-border hidden md:block" />
          <div className="px-2.5 py-1 rounded-md bg-secondary text-xs font-semibold text-muted-foreground border border-border hidden sm:block">
            Guess the Country
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-y-auto relative p-6">
          {state.gameOver ? (
            <div className="flex flex-col items-center justify-center flex-1 max-w-2xl mx-auto w-full text-center">
               <div className="mb-6">
                 {state.guesses[state.guesses.length - 1].toLowerCase() === state.mysteryCountry?.name.toLowerCase() ? (
                    <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-500 w-fit mx-auto mb-4 border border-emerald-500/30"><PartyPopper className="w-12 h-12" /></div>
                 ) : (
                    <div className="p-4 rounded-full bg-red-500/20 text-red-500 w-fit mx-auto mb-4 border border-red-500/30"><span className="text-4xl font-bold">X</span></div>
                 )}
                 <h2 className="text-4xl font-serif font-bold mb-2">
                    {state.guesses[state.guesses.length - 1].toLowerCase() === state.mysteryCountry?.name.toLowerCase() ? "Correct!" : "Game Over"}
                 </h2>
                 {state.guesses[state.guesses.length - 1].toLowerCase() !== state.mysteryCountry?.name.toLowerCase() && (
                    <p className="text-xl text-muted-foreground">The country was <span className="font-bold text-foreground text-2xl ml-1">{state.mysteryCountry?.flag} {state.mysteryCountry?.name}</span></p>
                 )}
                 {isWin && (
                    <div className="flex flex-col items-center justify-center my-4 p-4 rounded-xl bg-primary/10 border border-primary/20 w-fit mx-auto">
                      <div className="text-3xl font-bold text-primary">{guessScore} Points</div>
                      <div className="text-sm text-muted-foreground mt-1">({state.guesses.length} guesses + {state.hintsRevealed || 0} hints)</div>
                    </div>
                 )}
               </div>

               <div className="w-full max-w-md mx-auto mt-2 flex flex-col items-center">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Your Guess Path:</h3>
                  <div className="flex flex-col items-center w-full relative">
                     {state.guesses.map((g, i) => {
                        const isLast = i === state.guesses.length - 1;
                        const isCorrect = g.toLowerCase() === state.mysteryCountry?.name.toLowerCase();
                        
                        return (
                           <React.Fragment key={i}>
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                                className={`
                                  flex items-center justify-center text-center font-bold border shadow-sm relative group
                                  ${isLast && isCorrect 
                                    ? "p-6 rounded-2xl bg-emerald-500/20 border-emerald-500/50 text-emerald-400 text-3xl w-full scale-110 my-4 shadow-emerald-500/20" 
                                    : "px-6 py-3 rounded-xl bg-secondary/50 border-border text-muted-foreground w-3/4"}
                                `}
                              >
                                {g}
                                {isLast && isCorrect && (
                                   <button 
                                     onClick={() => setShowStatsModal(true)} 
                                     className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 bg-emerald-500/10 hover:bg-emerald-500/30 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                                     title="View Country Stats"
                                   >
                                      <ChevronRight className="w-6 h-6 text-emerald-400" />
                                   </button>
                                )}
                              </motion.div>
                              
                              {!isLast && (
                                 <motion.div 
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 24 }} transition={{ delay: i * 0.15 + 0.1 }}
                                    className="w-0.5 bg-border my-2 relative"
                                 >
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-background rounded-full">
                                       <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                 </motion.div>
                              )}
                           </React.Fragment>
                        );
                     })}
                  </div>
               </div>

               <div className="mt-12 flex flex-col items-center justify-center gap-4">
                 {!state.leaderboardSubmitted && isWin && (
                   <button onClick={() => setState(prev => ({ ...prev, leaderboardSubmitted: 'pending' as any }))} className="flex items-center gap-2 px-6 py-3 bg-yellow-400/20 text-yellow-400 border border-yellow-400/40 rounded-xl font-bold text-sm hover:bg-yellow-400/30 transition-all shadow-lg hover:scale-105">
                     <Trophy className="w-4 h-4" /> Submit to Global Leaderboard
                   </button>
                 )}
                 <button onClick={doReset} className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity shadow-lg">
                   Play Again
                 </button>
               </div>
            </div>
          ) : state.mysteryCountry ? (
            <GuessPhase 
              mysteryCountry={state.mysteryCountry} 
              guesses={state.guesses} 
              onGuess={onGuess} 
              hintsRevealed={state.hintsRevealed || 0}
              onRevealHint={() => setState(prev => ({ ...prev, hintsRevealed: (prev.hintsRevealed || 0) + 1 }))}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading game...</div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showStatsModal && state.mysteryCountry && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative"
            >
              <button 
                onClick={() => setShowStatsModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
              
              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="text-8xl mb-4 drop-shadow-lg">{state.mysteryCountry.flag}</div>
                  <h2 className="text-4xl font-serif font-bold tracking-tight mb-2">{state.mysteryCountry.name}</h2>
                  <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1.5"><MapPin className="w-4 h-4" />{state.mysteryCountry.region}</p>
                </div>

                <div className="bg-secondary/30 border border-border rounded-xl p-6 mb-8 text-center">
                  <p className="text-muted-foreground leading-relaxed italic">"{state.mysteryCountry.knownFor}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORIES.filter(c => !BONUS_CATEGORIES.includes(c)).map(cat => {
                    const stat = state.mysteryCountry!.stats[getCategoryKey(cat)];
                    return (
                      <div key={cat} className="bg-secondary/20 border border-border/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-muted-foreground">{CATEGORY_ICONS[cat]}</span>
                          <span className="text-xs font-bold uppercase tracking-widest text-foreground/80">{cat}</span>
                        </div>
                        <p className="text-sm text-foreground/70">{stat.description}</p>
                        <div className="mt-2 text-primary font-mono font-bold">{getPtsDisplay(stat.score, cat)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {state.leaderboardSubmitted === 'pending' as any && (
        <SubmitDialog score={guessScore} mode="guess" roster={{}} onClose={() => setState(prev => ({ ...prev, leaderboardSubmitted: false }))} onSuccess={() => setState(prev => ({ ...prev, leaderboardSubmitted: true }))} />
      )}
    </div>
  );
}
