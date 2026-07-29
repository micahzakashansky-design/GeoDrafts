import React from "react";
import { motion } from "framer-motion";
import { type Task, type TaskResult } from "@/lib/tasks-logic";
import { CATEGORIES, getCategoryKey, type Category, type Country } from "@/data/countries";
import { drawRosterPng, CATEGORY_ICONS } from "../normal/NormalUI";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import Download from "lucide-react/dist/esm/icons/download";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Target from "lucide-react/dist/esm/icons/target";
import Home from "lucide-react/dist/esm/icons/home";
import { useLocation } from "wouter";

interface TasksGameOverProps {
  task: Task;
  result: TaskResult;
  roster: Partial<Record<Category, Country>>;
  totalScore: number;
  bonus: number;
  finalScore: number;
  onNewTask: () => void;
  rosterRef: React.RefObject<HTMLDivElement>;
}

export function TasksGameOver({
  task,
  result,
  roster,
  totalScore,
  bonus,
  finalScore,
  onNewTask,
  rosterRef
}: TasksGameOverProps) {
  const [, navigate] = useLocation();

  const getGradeBadgeColor = (grade: number) => {
    if (grade === 100) return "from-emerald-500 to-green-600 text-white border-emerald-400/50 shadow-emerald-500/30";
    if (grade >= 90) return "from-green-500 to-emerald-600 text-white border-green-400/50 shadow-green-500/30";
    if (grade >= 80) return "from-blue-500 to-indigo-600 text-white border-blue-400/50 shadow-blue-500/30";
    if (grade >= 70) return "from-amber-500 to-yellow-600 text-white border-amber-400/50 shadow-amber-500/30";
    if (grade >= 60) return "from-orange-500 to-amber-600 text-white border-orange-400/50 shadow-orange-500/30";
    return "from-red-500 to-rose-700 text-white border-red-400/50 shadow-red-500/30";
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-6"
      >
        {/* Header Grade Card */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" /> Task Result
            </div>

            <h2 className="text-2xl md:text-3xl font-black font-sans text-foreground leading-snug">
              "{task.fullSentence}"
            </h2>

            <p className="text-base text-muted-foreground font-medium">
              {result.details}
            </p>

            <div className="text-sm font-bold text-foreground/80 bg-muted/30 px-3 py-2 rounded-xl inline-block border border-border/40">
              {result.summary}
            </div>
          </div>

          {/* Grade Badge */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br border shadow-2xl flex flex-col items-center justify-center ${getGradeBadgeColor(result.grade)}`}>
              <span className="text-4xl font-black tracking-tighter leading-none">{result.grade}</span>
              <span className="text-xs font-bold uppercase opacity-90">/ 100</span>
              <span className="text-lg font-black mt-1 bg-white/20 px-2.5 py-0.5 rounded-full">Grade {result.letterGrade}</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown (For Match Goal) */}
        {result.categoryBreakdown && result.categoryBreakdown.length > 0 && (
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Category Match Comparison
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.categoryBreakdown.map(item => {
                const isExact = item.diff === 0;
                return (
                  <div
                    key={item.category}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                      isExact
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : item.diff <= 2
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        : "bg-muted/40 border-border/60 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{CATEGORY_ICONS[item.category]}</span>
                      <span className="truncate">{item.category}</span>
                    </div>

                    <div className="font-bold text-right shrink-0">
                      <div>You: {item.yourScore} vs Target: {item.targetScore}</div>
                      <div className={`text-[10px] ${isExact ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {isExact ? "Exact Match (0 diff)" : `Diff: -${item.diff} pts`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-4 px-6 rounded-2xl bg-card border border-border text-card-foreground hover:bg-muted font-bold transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> Home
          </button>

          <button
            onClick={() => drawRosterPng(roster, finalScore, bonus, false)}
            className="flex-1 py-4 px-6 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold transition-all flex items-center justify-center gap-2 border border-border"
          >
            <Download className="w-5 h-5" /> Download Roster
          </button>

          <button
            onClick={onNewTask}
            className="flex-1 py-4 px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Next Task
          </button>
        </div>
      </motion.div>
    </div>
  );
}
