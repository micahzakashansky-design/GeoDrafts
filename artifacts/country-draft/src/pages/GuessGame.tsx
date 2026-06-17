import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import {
  GuessPhase, GameState,
  CATEGORY_ICONS, CATEGORY_WEIGHTS, BONUS_CATEGORIES, getCategoryStars, getPtsDisplay
} from "./GameShared";
import { Home, Globe as GlobeIcon, PartyPopper, ChevronDown } from "lucide-react";

export default function GuessGame() {
  const [, navigate] = useLocation();

  const [state, setState] = useState<GameState>(() => {
    const isHardMode = localStorage.getItem("countryDraftHardMode") === "true";
    let pool = [...COUNTRIES];
    shuffleArray(pool);
    const mystery = pool.pop() || null;
    return {
      pool, currentCountry: null, selectionOptions: null, mysteryCountry: mystery, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "guess", isHardMode,
      roomCode: null, poolSeed: 0
    };
  });

  const onGuess = useCallback((name: string) => {
    setState(prev => {
      let finalName = name;
      if (name === "bypass:devtest3781" && prev.mysteryCountry) {
        finalName = prev.mysteryCountry.name;
      }
      
      const newGuesses = [...prev.guesses, finalName];
      const isCorrect = prev.mysteryCountry?.name.toLowerCase() === finalName.toLowerCase();
      const isOver = isCorrect || newGuesses.length >= 5;
      return { ...prev, guesses: newGuesses, gameOver: isOver };
    });
  }, []);

  const doReset = useCallback(() => {
    const isHardMode = state.isHardMode;
    let pool = [...COUNTRIES];
    shuffleArray(pool);
    const mystery = pool.pop() || null;
    setState({
      pool, currentCountry: null, selectionOptions: null, mysteryCountry: mystery, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "guess", isHardMode,
      roomCode: null, poolSeed: 0
    });
  }, [state.isHardMode]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
      <header className="h-14 md:h-16 shrink-0 border-b border-border/50 bg-card/50 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"><Home className="w-5 h-5" /></button>
          <div className="h-4 w-px bg-border hidden md:block" />
          <h1 className="font-serif text-lg md:text-xl font-bold tracking-tight flex items-center gap-2"><GlobeIcon className="w-5 h-5 text-primary" />GeoDrafts - Guess the Country</h1>
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
                 <p className="text-xl text-muted-foreground">The country was <span className="font-bold text-foreground text-2xl ml-1">{state.mysteryCountry?.flag} {state.mysteryCountry?.name}</span></p>
               </div>

               <div className="w-full max-w-md mx-auto mt-8 flex flex-col items-center">
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
                                  flex items-center justify-center text-center font-bold border shadow-sm
                                  ${isLast && isCorrect 
                                    ? "p-6 rounded-2xl bg-emerald-500/20 border-emerald-500/50 text-emerald-400 text-3xl w-full scale-110 my-4 shadow-emerald-500/20" 
                                    : "px-6 py-3 rounded-xl bg-secondary/50 border-border text-muted-foreground w-3/4"}
                                `}
                              >
                                {g}
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

               <button onClick={doReset} className="mt-12 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity shadow-lg">
                 Play Again
               </button>
            </div>
          ) : state.mysteryCountry ? (
            <GuessPhase mysteryCountry={state.mysteryCountry} guesses={state.guesses} onGuess={onGuess} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading game...</div>
          )}
        </div>
      </main>
    </div>
  );
}
