import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Globe, Shield, TrendingUp, Heart, Building, Sun, Cpu,
  Map, Users, BookOpen, Trophy, Info, Camera, GraduationCap,
  MapPin, Mountain, Palette, CalendarDays, X, ChevronRight,
  Calculator, Zap, Star
} from "lucide-react";
import { CATEGORIES } from "../data/countries";

const BONUS_CATEGORIES: string[] = ["Size", "Population"];
const NATION_RANKS = [
  { label: "Superpower", range: "165+", color: "text-yellow-400" },
  { label: "Major Power", range: "140-164", color: "text-blue-400" },
  { label: "Regional Power", range: "110-139", color: "text-green-400" },
  { label: "Developing Nation", range: "80-109", color: "text-orange-400" },
  { label: "Struggling State", range: "0-79", color: "text-red-400" },
];
import { useTheme } from "../lib/theme-context";

// ─── Guidebook Modal ──────────────────────────────────────────────────────────

function GuidebookModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"basics" | "scoring" | "bonus">("basics");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-bold">Game Guidebook</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-border bg-secondary/10">
          {(["basics", "scoring", "bonus"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-all border-b-2 ${
                activeTab === tab ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "basics" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  How to Play
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You are presented with countries one-by-one from a randomized pool. For each country, you must assign it to one of 15 available category slots. Once a slot is filled, it cannot be changed.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-border bg-secondary/20">
                  <div className="font-bold text-sm mb-1">Classic Mode</div>
                  <div className="text-xs text-muted-foreground">Standard gameplay where you see the ratings for each stat as you draft.</div>
                </div>
                <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
                  <div className="font-bold text-sm mb-1 text-blue-400">Daily Challenge</div>
                  <div className="text-xs text-muted-foreground">A fixed daily seed. Everyone gets the same countries in the same order.</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "scoring" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  Point System
                </h3>
                <p className="text-sm text-muted-foreground">
                  Each category is scored from 1 to 10 based on real data. However, some categories are more vital than others and carry higher weights:
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold uppercase">3-Star Categories</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">1.5x Multiplier</span>
                </div>
                <p className="text-[11px] text-muted-foreground px-1 italic">Military, Economy, Government</p>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <Star className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="text-sm font-bold uppercase">2-Star Categories</span>
                  </div>
                  <span className="text-xs font-bold text-blue-400">1.2x Multiplier</span>
                </div>
                <p className="text-[11px] text-muted-foreground px-1 italic">Relationships, Tech, Education, Resources, Healthcare</p>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary border border-border mt-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold uppercase">1-Star Categories</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">1.0x Multiplier</span>
                </div>
                <p className="text-[11px] text-muted-foreground px-1 italic">All others (Culture, Climate, History, etc.)</p>
              </div>
            </div>
          )}

          {activeTab === "bonus" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-400" />
                  Density & Logic Bonus
                </h3>
                <p className="text-sm text-muted-foreground">
                  The <span className="text-foreground font-semibold">Size</span> and <span className="text-foreground font-semibold">Population</span> categories calculate a special bonus when both are filled:
                </p>
              </div>

              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
                <div className="space-y-2">
                  <div className="text-sm font-bold text-blue-400 uppercase tracking-tight">1. Optimal Density</div>
                  <p className="text-xs text-muted-foreground">High population in a small area or low population in a massive area yields penalties. We calculate an "Ideal Density" factor based on your picks.</p>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-bold text-blue-400 uppercase tracking-tight">2. Infrastructure Combo</div>
                  <p className="text-xs text-muted-foreground">If you have strong <span className="text-foreground">Technology</span> and <span className="text-foreground">Economy</span> scores, they act as a "multiplier" for your population efficiency, granting up to +20 bonus pts.</p>
                </div>

                <div className="pt-2 mt-2 border-t border-blue-500/30">
                  <div className="text-blue-300 font-sans font-semibold mb-1">Total bonus = densityBonus + comboBonus</div>
                  <div className="text-muted-foreground font-sans italic">
                    Example: USA (size 9) + China (pop 10) with Germany (tech 9) + USA (eco 9):<br />
                    diff = −1 → fitMult ≈ 0.6; urbFactor = 0.81; densityBonus ≈ min(20, 11) = 11; comboBonus = 5 → <span className="text-primary font-bold">+16 pts</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Nation Rankings</h3>
                <div className="space-y-1.5">
                  {NATION_RANKS.map((r: { label: string; range: string; color: string }) => (
                    <div key={r.label} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                      <span className={`text-sm font-semibold ${r.color}`}>{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Country of the Day card ──────────────────────────────────────────────────

function DailyCard() {
  const [, navigate] = useLocation();

  const todayKey  = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    []
  );

  const dailyResult = useMemo<{ score: number; completed: boolean } | null>(() => {
    try {
      const raw = localStorage.getItem(`countryDraftDailyResult_${todayKey}`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  }, [todayKey]);

  const inProgress = useMemo(() => {
    try {
      const raw = localStorage.getItem(`countryDraftState_daily_${todayKey}`);
      if (!raw) return false;
      const s = JSON.parse(raw);
      return s && !s.gameOver && s.isDailyMode;
    } catch { return false; }
  }, [todayKey]);

  function playDaily() {
    localStorage.setItem("countryDraftDailyMode", "true");
    localStorage.setItem("countryDraftDailyDate", todayKey);
    navigate("/game");
  }

  const alreadyCompleted = dailyResult?.completed === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="w-full max-w-xl mb-2"
    >
      <div className={`rounded-2xl border p-5 relative overflow-hidden ${
        alreadyCompleted
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-amber-400/40 bg-amber-400/5"
      }`}>
        {/* Subtle background glow */}
        <div className={`absolute inset-0 pointer-events-none ${
          alreadyCompleted
            ? "bg-gradient-to-br from-emerald-500/5 to-transparent"
            : "bg-gradient-to-br from-amber-400/8 to-transparent"
        }`} />

        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                alreadyCompleted ? "bg-emerald-500/20" : "bg-amber-400/20"
              }`}>
                🗓️
              </div>
              <div>
                <h2 className={`font-semibold text-base ${alreadyCompleted ? "text-emerald-300" : "text-amber-300"}`}>
                  Country of the Day
                </h2>
                <p className="text-xs text-muted-foreground">{todayLabel}</p>
              </div>
            </div>
            {alreadyCompleted && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                ✅ Completed
              </span>
            )}
            {inProgress && !alreadyCompleted && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold border border-amber-400/30 animate-pulse">
                ⏳ In Progress
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Everyone drafts the <span className="text-foreground/80 font-medium">same shuffled pool</span> today.
          </p>

          {alreadyCompleted ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">{dailyResult!.score} pts</div>
                <div className="text-xs text-muted-foreground mt-0.5">Your score today</div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={playDaily}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors text-sm font-semibold"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  View Result
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={playDaily}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30 transition-colors font-semibold text-sm"
            >
              <CalendarDays className="w-4 h-4" />
              {inProgress ? "Continue Daily Challenge" : "Play Today's Challenge"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Home page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [, navigate] = useLocation();
  const [showGuidebook, setShowGuidebook] = useState(false);
  const { isLight, toggleTheme } = useTheme();

  function startGame(hardMode: boolean) {
    localStorage.setItem("countryDraftHardMode", String(hardMode));
    localStorage.removeItem("countryDraftDailyMode");
    localStorage.removeItem("countryDraftDailyDate");
    localStorage.removeItem("countryDraftState_v4");
    navigate("/game");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-primary" />
          <span className="font-serif text-xl font-bold text-foreground tracking-tight">GeoDrafts</span>
        </div>
        <button
          onClick={toggleTheme}
          className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors"
        >
          {isLight ? "🌙 Dark" : "☀️ Light"}
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex flex-col items-center w-full max-w-xl"
        >
          <div className="text-6xl mb-4">🌍</div>
          <h1 className="font-serif text-5xl font-bold text-foreground mb-2 tracking-tight">GeoDrafts</h1>
          <p className="text-base text-muted-foreground mb-1 text-center">
            Draft random countries one-by-one and build the ideal nation.
          </p>
          <p className="text-sm text-muted-foreground/60 mb-8 text-center">
            Assign each country to one of 15 category slots. Score points based on real-world stats.
          </p>

          {/* Daily Challenge */}
          <DailyCard />

          <div className="grid grid-cols-2 gap-3 w-full mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startGame(false)}
              className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors font-semibold"
            >
              <Globe className="w-6 h-6" />
              <span className="text-base">Classic Mode</span>
              <span className="text-xs font-normal text-primary/60">See ratings for each stat</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startGame(true)}
              className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl bg-red-500/8 border border-red-500/25 text-red-400 hover:bg-red-500/15 transition-colors font-semibold"
            >
              <Shield className="w-6 h-6" />
              <span className="text-base">Hard Mode</span>
              <span className="text-xs font-normal text-red-400/60">No ratings shown</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/leaderboard")}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-sm"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              View Leaderboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGuidebook(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-sm"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              Guidebook
            </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showGuidebook && <GuidebookModal onClose={() => setShowGuidebook(false)} />}
      </AnimatePresence>
    </div>
  );
}
