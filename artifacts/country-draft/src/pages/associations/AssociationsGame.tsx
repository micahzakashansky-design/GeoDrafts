import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ALL_COUNTRIES as COUNTRIES, Country } from "@/data/countries";
import { AssociationsUI } from "./AssociationsUI";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Brain } from "lucide-react";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";
import { SettingsButton } from "@/components/SettingsButton";
import { isDevModeActive } from "@/lib/dev-logic";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";

export type TaskType = 
  | "identify_from_flag" 
  | "identify_from_map" 
  | "click_on_map" 
  | "find_flag" 
  | "identify_capital" 
  | "identify_country_from_capital";

export interface Question {
  country: Country;
  task: TaskType;
  options?: Country[]; // Used for find_flag (9 options)
}

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function AssociationsGame() {
  const [, setLocation] = useLocation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [validIsos, setValidIsos] = useState<string[]>([]);
  const { profile } = useFirebaseAuth();
  const [showDevAnswer, setShowDevAnswer] = useState(false);

  useEffect(() => {
    try {
      const storedTasks = JSON.parse(sessionStorage.getItem("associations_tasks") || "[]") as TaskType[];
      const storedCountries = JSON.parse(sessionStorage.getItem("associations_countries") || "[]") as string[];

      if (storedTasks.length === 0 || storedCountries.length === 0) {
        setLocation("/game/associations/setup");
        return;
      }

      const pool = COUNTRIES.filter(c => storedCountries.includes(c.name));
      const poolIsos = pool.map(c => c.isoNumeric);
      setValidIsos(poolIsos);

      const generated: Question[] = [];
      const shuffledPool = shuffleArray(pool);

      for (const country of shuffledPool) {
        // Pick a random task for this country
        let task = storedTasks[Math.floor(Math.random() * storedTasks.length)];
        
        // Prevent giveaway capital questions
        const isGiveaway = () => {
          const cName = country.name.toLowerCase();
          const cap = country.capital.toLowerCase();
          if (cName.includes(cap) || cap.includes(cName)) return true;
          const cWords = cName.split(/[\s-]+/).filter(w => w.length > 3);
          const capWords = cap.split(/[\s-]+/).filter(w => w.length > 3);
          for (const cw of cWords) {
            if (capWords.includes(cw)) return true;
          }
          return false;
        };

        if (task === "identify_country_from_capital" && isGiveaway()) {
          const otherTasks = storedTasks.filter(t => t !== "identify_country_from_capital");
          if (otherTasks.length > 0) {
            task = otherTasks[Math.floor(Math.random() * otherTasks.length)];
          }
        }
        
        let options: Country[] | undefined;
        if (task === "find_flag") {
          // generate 9 options including the correct one
          const others = shuffleArray(COUNTRIES.filter(c => c.name !== country.name)).slice(0, 8);
          options = shuffleArray([country, ...others]);
        }

        generated.push({ country, task, options });
      }

      setQuestions(generated);
    } catch (e) {
      setLocation("/game/associations/setup");
    }
  }, [setLocation]);

  const handleCorrect = () => {
    setScore(s => s + 1);
    nextQuestion();
  };

  const handleWrong = () => {
    nextQuestion();
  };

  const handleSkip = () => {
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setIsGameOver(true);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (questions.length === 0) return null;

  

  const currentQuestion = questions[currentIndex];

  const handleDoubleClick = () => {
    if (isDevModeActive(profile?.username)) {
      setShowDevAnswer(true);
      setTimeout(() => setShowDevAnswer(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-20 shrink-0 border-b border-border bg-card/50 backdrop-blur-md px-6 md:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="font-sans text-lg md:text-xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity duration-75">
            <Logo className="w-5 h-5" />GeoDrafts
          </button>
          <div className="h-4 w-px bg-border hidden md:block" />
          <div className="px-3 py-1.5 rounded-full bg-card border border-border text-xs font-bold text-muted-foreground hidden sm:flex items-center gap-2 tracking-widest uppercase">
            <Brain className="w-3.5 h-3.5" /> Associations
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium bg-muted/50 px-3 py-1 rounded-full flex items-center gap-2 border border-border shadow-sm">
            <span className="text-muted-foreground font-bold">{currentIndex + 1} / {questions.length}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="font-bold text-foreground">Score: {score}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SettingsButton />
        </div>
      </header>

      <main className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden" onDoubleClick={handleDoubleClick}>
        {showDevAnswer && currentQuestion && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white px-8 py-4 rounded-xl z-50 text-4xl font-bold tracking-widest pointer-events-none">
            {currentQuestion.country.name}
          </div>
        )}
        {isGameOver ? (
          <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 flex flex-col items-center justify-center w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-md w-full bg-card border-2 border-border p-10 rounded-[2rem] text-center shadow-xl flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-8 rotate-12">
              <span className="text-6xl drop-shadow-md -rotate-12">🏆</span>
            </div>
            
            <h1 className="text-4xl font-black font-sans tracking-tighter mb-2 text-foreground">
              Game Over!
            </h1>
            <p className="text-muted-foreground text-lg mb-10 font-medium">
              You scored <span className="font-black text-foreground">{score}</span> out of {questions.length}.
            </p>
            
            <div className="w-full space-y-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLocation("/game/associations/setup")}
                className="w-full py-5 rounded-2xl bg-foreground text-background font-black text-xl transition-all shadow-md uppercase tracking-widest"
              >
                Play Again
              </motion.button>
            </div>
          </motion.div>
        </div>
        ) : (
          <AssociationsUI 
            question={currentQuestion}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onSkip={handleSkip}
            validIsos={validIsos}
            key={currentIndex} // forces remount for new question
          />
        )}
      </main>
    </div>
  );
}
