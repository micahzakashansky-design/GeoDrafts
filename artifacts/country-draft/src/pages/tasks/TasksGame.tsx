import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  COUNTRIES, ALL_COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import {
  CountryCard, drawRosterPng, GameState,
  CATEGORY_ICONS, CATEGORY_MAX_SCORES, BONUS_CATEGORIES, getCategoryStars, getPtsDisplay, getScoreLabel
} from "../normal/NormalUI";
import { SidebarRoster } from "../normal/SidebarRoster";
import { Home, Target, Clock, ShieldAlert, Sparkles, Dices, RotateCcw } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SettingsButton } from "@/components/SettingsButton";
import { computeSizePopBonus } from "@/lib/achievements-logic";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { type Task, type TaskResult, generateRandomTask, filterPoolForChallenge, calculateTaskGrade } from "@/lib/tasks-logic";
import { TaskStartModal } from "./TaskStartModal";
import { TasksGameOver } from "./TasksGameOver";
import { savePersonalScore, formatRoster } from "@/lib/local-leaderboard";

export default function TasksGame() {
  const [, navigate] = useLocation();
  const { profile } = useFirebaseAuth();

  const [showStartModal, setShowStartModal] = useState(true);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const [pool, setPool] = useState<Country[]>([]);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [roster, setRoster] = useState<Partial<Record<Category, Country>>>({});
  const [gameOver, setGameOver] = useState(false);
  const [isBlindMode, setIsBlindMode] = useState(false);

  const [taskResult, setTaskResult] = useState<TaskResult | null>(null);

  // 5-second timer challenge state
  const [timeLeft, setTimeLeft] = useState<number>(5.0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const rosterRef = useRef<HTMLDivElement>(null);
  const localSavedRef = useRef(false);

  // Initialize or start task draft
  const handleStartTask = (task: Task) => {
    setCurrentTask(task);
    setShowStartModal(false);

    // Apply challenge pool filter & shuffle
    let newPool = filterPoolForChallenge(task.challenge, COUNTRIES);
    newPool = shuffleArray([...newPool]);

    const firstCountry = newPool.pop() || null;

    setPool(newPool);
    setCurrentCountry(firstCountry);
    setRoster({});
    setGameOver(false);
    setIsBlindMode(task.challenge.type === "blind");
    setTaskResult(null);
    localSavedRef.current = false;
    setTimeLeft(5.0);
  };

  const totalScore = useMemo(() => {
    return CATEGORIES.reduce((sum, cat) => {
      const country = roster[cat]; if (!country) return sum;
      if (BONUS_CATEGORIES.includes(cat)) return sum;
      const key = getCategoryKey(cat); const score = country.stats[key].score ?? 0;
      return sum + score;
    }, 0);
  }, [roster]);

  const bonus = useMemo(() => computeSizePopBonus(roster), [roster]);
  const finalScore = totalScore + bonus;

  // Handle auto assignment when 5s timer expires
  const autoAssignFirstAvailable = useCallback(() => {
    const unassigned = CATEGORIES.find(c => !roster[c]);
    if (!unassigned || !currentCountry) return;

    setRoster(prevRoster => {
      if (prevRoster[unassigned]) return prevRoster;
      const newRoster = { ...prevRoster, [unassigned]: currentCountry };
      const isComplete = CATEGORIES.every(c => newRoster[c]);

      setPool(prevPool => {
        const nextPool = [...prevPool];
        const nextCountry = isComplete ? null : (nextPool.pop() || null);
        setCurrentCountry(nextCountry);
        if (isComplete) setGameOver(true);
        return nextPool;
      });

      return newRoster;
    });
    setTimeLeft(5.0);
  }, [currentCountry, roster]);

  // 5s Draft Timer tick
  useEffect(() => {
    if (!currentTask || currentTask.challenge.type !== "timer" || gameOver || showStartModal || !currentCountry) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.15) {
          autoAssignFirstAvailable();
          return 5.0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentTask, gameOver, showStartModal, currentCountry, autoAssignFirstAvailable]);

  // Assign country callback
  const assignCountry = useCallback((category: Category) => {
    if (roster[category] || !currentCountry) return;

    const newRoster = { ...roster, [category]: currentCountry };
    const isComplete = CATEGORIES.every(c => newRoster[c]);

    const nextPool = [...pool];
    const nextCountry = isComplete ? null : (nextPool.pop() || null);

    setRoster(newRoster);
    setPool(nextPool);
    setCurrentCountry(nextCountry);
    setGameOver(isComplete);
    setTimeLeft(5.0);
  }, [currentCountry, roster, pool]);

  // Calculate task grade on game over
  useEffect(() => {
    if (gameOver && currentTask && !localSavedRef.current) {
      const result = calculateTaskGrade(currentTask, roster, finalScore);
      setTaskResult(result);
      savePersonalScore("normal", { score: result.grade, roster: formatRoster(roster) });
      localSavedRef.current = true;
    }
  }, [gameOver, currentTask, roster, finalScore]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <Home className="w-4 h-4" /> Home
          </button>
          <Logo />
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
              Tasks Mode
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStartModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all flex items-center gap-1.5 border border-border/60"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Roll Task
          </button>
          <SettingsButton />
        </div>
      </header>

      {/* Start Task Reel Modal */}
      {showStartModal && (
        <TaskStartModal
          onStartGame={handleStartTask}
          onBackToMenu={() => navigate("/")}
        />
      )}

      {/* Main Game Interface */}
      {currentTask && !showStartModal && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Sidebar Roster Panel */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-card/30 shrink-0 flex flex-col">
            <div className="p-4 border-b border-border/50 bg-muted/20">
              {/* Task Banner Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border border-primary/20 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-primary">
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Active Objective</span>
                  {currentTask.challenge.type === "timer" && (
                    <span className="text-amber-400 font-mono font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-spin" /> {timeLeft.toFixed(1)}s
                    </span>
                  )}
                </div>
                <p className="text-xs font-black text-foreground leading-snug">
                  "{currentTask.fullSentence}"
                </p>
                {currentTask.goal.explanation && (
                  <p className="text-[11px] font-medium text-muted-foreground bg-card/60 p-2 rounded-xl border border-border/40 leading-tight">
                    <span className="font-bold text-primary">Requirements:</span> {currentTask.goal.explanation}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <SidebarRoster
                roster={roster}
                isHardMode={isBlindMode}
              />
            </div>
          </div>

          {/* Center Draft Workspace */}
          <div className="flex-1 flex flex-col overflow-y-auto relative">
            {gameOver && taskResult ? (
              <TasksGameOver
                task={currentTask}
                result={taskResult}
                roster={roster}
                totalScore={totalScore}
                bonus={bonus}
                finalScore={finalScore}
                onNewTask={() => setShowStartModal(true)}
                rosterRef={rosterRef}
              />
            ) : currentCountry ? (
              <div className="flex flex-col h-full">
                {/* 5-second Timer Progress Bar */}
                {currentTask.challenge.type === "timer" && (
                  <div className="w-full h-1.5 bg-muted overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-100 ease-linear"
                      style={{ width: `${(timeLeft / 5.0) * 100}%` }}
                    />
                  </div>
                )}

                {/* Match Country Target Indicator Bar (Goal 3) */}
                {currentTask.goal.type === "match" && currentTask.goal.targetCountry && (
                  <div className="px-6 py-2 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between text-xs font-semibold text-blue-400">
                    <span className="flex items-center gap-2">
                      <Target className="w-4 h-4" /> Goal Target Country: <strong className="text-foreground">{currentTask.goal.targetCountry.flag} {currentTask.goal.targetCountry.name}</strong>
                    </span>
                    <span className="text-[11px] opacity-80">Match category stats for max score</span>
                  </div>
                )}

                {/* Archetype Requirement Bar */}
                {currentTask.goal.type === "archetype" && currentTask.goal.explanation && (
                  <div className="px-6 py-2.5 bg-purple-500/10 border-b border-purple-500/20 flex flex-wrap items-center justify-between text-xs font-medium text-purple-300 gap-2">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" /> Target Archetype: <strong className="text-foreground font-bold">{currentTask.goal.targetArchetype}</strong>
                    </span>
                    <span className="text-xs bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 rounded-lg text-purple-200 font-semibold">
                      💡 Criteria: {currentTask.goal.explanation}
                    </span>
                  </div>
                )}

                {/* Main Country Draft Card */}
                <TaskCountryCard
                  country={currentCountry}
                  poolRemaining={pool.length}
                  isHardMode={isBlindMode}
                  roster={roster}
                  onAssign={assignCountry}
                  task={currentTask}
                />
              </div>
            ) : null}
          </div>

        </div>
      )}
    </div>
  );
}

// Custom Country Card for Tasks Mode (with Match target scores overlay if applicable)
function TaskCountryCard({
  country,
  poolRemaining,
  isHardMode,
  roster,
  onAssign,
  task
}: {
  country: Country;
  poolRemaining: number;
  isHardMode: boolean;
  roster: Partial<Record<Category, Country>>;
  onAssign: (cat: Category) => void;
  task: Task;
}) {
  const isComplete = CATEGORIES.every(c => roster[c]);
  if (isComplete) return null;

  const targetCountry = task.goal.type === "match" ? task.goal.targetCountry : null;

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-8">
      {/* Header section */}
      <div className="flex justify-between items-start mb-6 w-full">
        <div className="flex items-start gap-4 md:gap-6">
          <div className="text-4xl md:text-5xl mt-1 drop-shadow-md">{country.flag}</div>
          <div>
            <h2 className="text-2xl md:text-3xl font-sans font-bold text-foreground tracking-tight">{country.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{country.capital} &bull; {country.region}</p>
            <div className="mt-3 max-w-2xl text-sm text-foreground/80 leading-relaxed">
              {country.knownFor}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pool Remaining</div>
          <div className="text-2xl font-black text-foreground font-mono">{poolRemaining}</div>
        </div>
      </div>

      {/* Category Choices Grid */}
      <div className="flex-1 overflow-y-auto p-2 pb-8 -mx-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.filter(cat => !roster[cat]).map((cat) => {
            const stat = country.stats[getCategoryKey(cat)];
            const maxScore = CATEGORY_MAX_SCORES[cat] ?? 10;
            const scoreLabel = getScoreLabel(stat.score ?? 0, maxScore);

            const targetScore = targetCountry ? (targetCountry.stats[getCategoryKey(cat)]?.score ?? 0) : null;

            return (
              <button
                key={cat}
                onClick={() => onAssign(cat)}
                className="group relative p-4 rounded-2xl border border-border bg-card hover:bg-muted/60 hover:border-primary/50 transition-all duration-200 text-left flex flex-col justify-between shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <span>{CATEGORY_ICONS[cat]}</span>
                      <span>{cat}</span>
                    </div>

                    {/* Match Target Overlay Badge */}
                    {targetScore !== null && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Target: {targetScore}
                      </span>
                    )}
                  </div>

                  {!isHardMode ? (
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`text-sm font-bold ${BONUS_CATEGORIES.includes(cat) ? "text-foreground" : scoreLabel.color}`}>
                        {BONUS_CATEGORIES.includes(cat) ? "Bonus Contributor" : scoreLabel.label}
                      </div>
                      <div className={`text-sm font-bold ${BONUS_CATEGORIES.includes(cat) ? "text-foreground" : scoreLabel.color}`}>
                        {!BONUS_CATEGORIES.includes(cat) && getPtsDisplay(stat.score ?? 0, cat)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-muted-foreground italic mb-1">
                      Stat hidden in Blind Mode
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                    {stat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-end text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                  Assign to {cat} &rarr;
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
