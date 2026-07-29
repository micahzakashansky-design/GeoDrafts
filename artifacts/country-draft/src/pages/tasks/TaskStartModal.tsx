import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Task, generateRandomTask } from "@/lib/tasks-logic";
import { COUNTRIES, type Country } from "@/data/countries";
import Dices from "lucide-react/dist/esm/icons/dices";
import Play from "lucide-react/dist/esm/icons/play";
import Target from "lucide-react/dist/esm/icons/target";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import Clock from "lucide-react/dist/esm/icons/clock";
import Globe from "lucide-react/dist/esm/icons/globe";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";

const SAMPLE_GOAL_PREVIEWS = [
  "Make the worst country possible...",
  "Make the best country possible...",
  "Make a country most similar to France...",
  "Make a country most similar to Japan...",
  "Make a Spartan Society...",
  "Make a Military Superstate...",
  "Make a Techno-Utopia...",
  "Make a Nordic Model..."
];

const SAMPLE_CHALLENGE_PREVIEWS = [
  "...using countries from Europe only.",
  "...using countries from Asia only.",
  "...using countries from Africa only.",
  "...using low-ranked countries only.",
  "...with 5 seconds per draft.",
  "...in blind mode."
];

interface TaskStartModalProps {
  onStartGame: (task: Task) => void;
  onBackToMenu: () => void;
}

export function TaskStartModal({ onStartGame, onBackToMenu }: TaskStartModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [goalText, setGoalText] = useState(SAMPLE_GOAL_PREVIEWS[0]);
  const [challengeText, setChallengeText] = useState(SAMPLE_CHALLENGE_PREVIEWS[0]);
  
  const [goalLocked, setGoalLocked] = useState(false);
  const [challengeLocked, setChallengeLocked] = useState(false);

  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const rollTask = () => {
    setIsSpinning(true);
    setGoalLocked(false);
    setChallengeLocked(false);

    const newTask = generateRandomTask(COUNTRIES);
    setCurrentTask(newTask);

    let goalStep = 0;
    let challengeStep = 0;

    // Fast cycling for goal
    const goalInterval = setInterval(() => {
      goalStep = (goalStep + 1) % SAMPLE_GOAL_PREVIEWS.length;
      setGoalText(SAMPLE_GOAL_PREVIEWS[goalStep]);
    }, 60);

    // Fast cycling for challenge
    const challengeInterval = setInterval(() => {
      challengeStep = (challengeStep + 1) % SAMPLE_CHALLENGE_PREVIEWS.length;
      setChallengeText(SAMPLE_CHALLENGE_PREVIEWS[challengeStep]);
    }, 65);

    // Lock goal after 1.2 seconds
    setTimeout(() => {
      clearInterval(goalInterval);
      setGoalText(newTask.goal.template);
      setGoalLocked(true);
    }, 1200);

    // Lock challenge after 2.2 seconds
    setTimeout(() => {
      clearInterval(challengeInterval);
      setChallengeText(newTask.challenge.template);
      setChallengeLocked(true);
      setIsSpinning(false);
    }, 2200);
  };

  useEffect(() => {
    rollTask();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-2xl bg-card border border-border/80 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.4)] p-6 md:p-10 flex flex-col items-center relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary shadow-sm">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-black font-sans text-foreground tracking-tight">Task Generator</h2>
            <p className="text-sm text-muted-foreground font-medium">Random Goal + Challenge Objective</p>
          </div>
        </div>

        {/* Reel Display Container */}
        <div className="w-full space-y-4 my-4">
          
          {/* Goal Slot Reel */}
          <div className={`relative p-5 rounded-2xl border transition-all duration-500 overflow-hidden ${
            goalLocked 
              ? "bg-primary/10 border-primary/40 shadow-[0_0_30px_rgba(59,130,246,0.15)]" 
              : "bg-muted/40 border-border/60"
          }`}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> Goal</span>
              {goalLocked && <span className="text-xs text-primary font-black">LOCKED</span>}
            </div>

            <div className="h-14 flex items-center justify-center text-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={goalText}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.08 }}
                  className={`text-xl md:text-2xl font-black tracking-tight ${
                    goalLocked ? "text-foreground drop-shadow" : "text-muted-foreground"
                  }`}
                >
                  {goalText}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Challenge Slot Reel */}
          <div className={`relative p-5 rounded-2xl border transition-all duration-500 overflow-hidden ${
            challengeLocked 
              ? "bg-purple-500/10 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)]" 
              : "bg-muted/40 border-border/60"
          }`}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Dices className="w-3.5 h-3.5 text-purple-400" /> Challenge</span>
              {challengeLocked && <span className="text-xs text-purple-400 font-black">LOCKED</span>}
            </div>

            <div className="h-14 flex items-center justify-center text-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={challengeText}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.08 }}
                  className={`text-xl md:text-2xl font-black tracking-tight ${
                    challengeLocked ? "text-purple-300 drop-shadow" : "text-muted-foreground"
                  }`}
                >
                  {challengeText}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Final Sentence Lock-in Card */}
        {goalLocked && challengeLocked && currentTask && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full my-4 p-5 rounded-2xl bg-gradient-to-r from-primary/15 via-purple-500/15 to-primary/15 border border-primary/30 text-center shadow-lg flex flex-col items-center space-y-2"
          >
            <div className="text-xs uppercase font-bold tracking-widest text-primary">Your Objective</div>
            <p className="text-lg md:text-xl font-black text-foreground leading-snug">
              "{currentTask.fullSentence}"
            </p>
            {currentTask.goal.explanation && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 border border-primary/30 text-xs font-medium text-foreground/90 shadow-sm mt-1">
                <span className="font-bold text-primary">💡 Requirements:</span> {currentTask.goal.explanation}
              </div>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onBackToMenu}
            className="px-6 py-4 rounded-2xl bg-card border border-border text-muted-foreground hover:text-foreground font-bold transition-all text-center"
          >
            Back
          </button>

          <button
            onClick={rollTask}
            disabled={isSpinning}
            className="flex-1 px-6 py-4 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold transition-all flex items-center justify-center gap-2 border border-border disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
            Reroll Task
          </button>

          <button
            onClick={() => currentTask && onStartGame(currentTask)}
            disabled={isSpinning || !currentTask}
            className="flex-1 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Task
          </button>
        </div>
      </motion.div>
    </div>
  );
}
