import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ALL_COUNTRIES as COUNTRIES, Country } from "@/data/countries";
import { AssociationsUI } from "./AssociationsUI";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Brain } from "lucide-react";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";

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
        const task = storedTasks[Math.floor(Math.random() * storedTasks.length)];
        
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

  if (isGameOver) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 pt-12 md:p-12 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-background border border-border p-8 rounded-2xl text-center space-y-6"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold font-sans">Game Over!</h1>
          <p className="text-muted-foreground text-lg">
            You scored <span className="font-bold text-foreground">{score}</span> out of {questions.length}.
          </p>
          <div className="pt-4 space-y-3">
            <Button className="w-full font-bold" size="lg" onClick={() => setLocation("/game/associations/setup")}>
              Play Again
            </Button>
            <Button variant="secondary" className="w-full font-bold" size="lg" onClick={() => setLocation("/")}>
              Main Menu
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

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
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AssociationsUI 
          question={currentQuestion}
          onCorrect={handleCorrect}
          onSkip={handleSkip}
          validIsos={validIsos}
          key={currentIndex} // forces remount for new question
        />
      </main>
    </div>
  );
}
