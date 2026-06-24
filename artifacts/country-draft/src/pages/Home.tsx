import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Globe, Trophy, Play, Users, MapPin, Zap, Crown, User, Brain, HelpCircle, CheckCircle2, ChevronRight, BookOpen, ShieldAlert, ShieldPlus, CalendarDays, X, Moon, Sun, Swords, PartyPopper, ArrowLeftRight, Gamepad2, Search, Star, Calculator, Settings, LogIn, Loader2, Shield, Target, Medal } from "lucide-react";
import { useTheme } from "../lib/theme-context";
import { useFirebaseAuth } from "../lib/use-firebase-auth";
import { checkDailySubmitted, getDailyState, createRoom, joinRoom, getTopScores } from "../lib/firestore";
import { UsernamePrompt } from "../components/UsernamePrompt";
import { SettingsModal } from "../components/SettingsModal";
import { AuthModal } from "../components/AuthModal";
import { ContactModal } from "../components/ContactModal";
import { AboutModal } from "../components/AboutModal";
import { Logo } from "../components/Logo";
import { AchievementsCard } from "../components/AchievementsCard";
import { SettingsButton } from "../components/SettingsButton";
import { toast } from "sonner";

const NATION_RANKS = [
  { label: "Superpower", range: "140+", color: "text-purple-400", icon: <Trophy className="w-4 h-4" /> },
  { label: "Regional Power", range: "110-139", color: "text-green-400", icon: <Shield className="w-4 h-4" /> },
  { label: "Developing Nation", range: "80-109", color: "text-orange-400", icon: <Users className="w-4 h-4" /> },
  { label: "Struggling State", range: "0-79", color: "text-red-400", icon: <Target className="w-4 h-4" /> },
];

const TABS = [
  { id: "basics", label: "How to Play", icon: <Zap className="w-4 h-4" /> },
  { id: "modes", label: "Game Modes", icon: <Gamepad2 className="w-4 h-4" /> },
  { id: "scoring", label: "Point System", icon: <Calculator className="w-4 h-4" /> },
  { id: "rankings", label: "Nation Rankings", icon: <Medal className="w-4 h-4" /> },
  { id: "bonuses", label: "Synergies & Bonuses", icon: <Star className="w-4 h-4" /> },
] as const;

function GuidebookModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]["id"]>("basics");

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-card/95 backdrop-blur-3xl border border-border/50 w-full max-w-4xl rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[600px] relative"
        >
          {/* Header for mobile, hidden on md */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-sans text-xl font-bold text-foreground">Guidebook</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-foreground/10 transition-colors text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar */}
          <div className="md:w-64 bg-muted/20 border-r border-border/50 p-4 flex flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0">
            <div className="hidden md:flex items-center gap-3 px-2 py-4 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl shadow-inner border border-primary/20">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-sans text-xl font-black text-foreground tracking-tight">Guidebook</h2>
            </div>

            <div className="flex md:flex-col gap-1 min-w-max md:min-w-0">
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabBg" 
                        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl" 
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab.icon}</span>
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto relative bg-card/50">
            <button onClick={onClose} className="hidden md:flex absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground z-10 border border-transparent hover:border-border">
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-10 max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8 pb-12"
                >
                  {activeTab === "basics" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-3xl font-black tracking-tight text-foreground mb-4">How to Play</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          GeoDraft is a strategic geography game where you build a hypothetical nation by drafting real-world countries into specialized roles.
                        </p>
                      </div>

                      <div className="grid gap-4">
                        <div className="p-5 rounded-2xl border border-border bg-muted/10 space-y-2">
                          <h4 className="font-bold text-foreground flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">1</span>
                            The Draft
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            You are presented with countries one-by-one from a randomized global pool. For each country, you must analyze its real-world statistics (GDP, Military, Population, etc).
                          </p>
                        </div>
                        <div className="p-5 rounded-2xl border border-border bg-muted/10 space-y-2">
                          <h4 className="font-bold text-foreground flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">2</span>
                            Assign Roles
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Assign the drafted country to one of 15 available category slots. <strong className="text-foreground">Choose wisely: once a slot is filled, it cannot be changed for the rest of the game.</strong>
                          </p>
                        </div>
                        <div className="p-5 rounded-2xl border border-border bg-muted/10 space-y-2">
                          <h4 className="font-bold text-foreground flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">3</span>
                            Maximize Score
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Your goal is to build the ultimate nation by matching countries with their strongest real-world metrics. Drafting the USA for Military will yield a massive score, while drafting Vatican City for Population will earn you very little.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "scoring" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-3xl font-black tracking-tight text-foreground mb-4">Point System</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          Every category evaluates a different real-world metric. Your raw score depends on the category's <strong className="text-foreground">Impact Rating</strong>.
                        </p>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-muted/30 text-muted-foreground text-xs uppercase">
                              <tr>
                                <th className="px-4 py-3 font-semibold">Rating</th>
                                <th className="px-4 py-3 font-semibold text-center text-muted-foreground">★ (Max 10)</th>
                                <th className="px-4 py-3 font-semibold text-center text-blue-400">★★ (Max 12)</th>
                                <th className="px-4 py-3 font-semibold text-center text-yellow-500">★★★ (Max 15)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              <tr className="bg-foreground/[0.02]">
                                <td className="px-4 py-3 font-bold text-emerald-400">World-Class</td>
                                <td className="px-4 py-3 text-center font-mono">9-10</td>
                                <td className="px-4 py-3 text-center font-mono">11-12</td>
                                <td className="px-4 py-3 text-center font-mono">14-15</td>
                              </tr>
                              <tr className="bg-foreground/[0.02]">
                                <td className="px-4 py-3 font-bold text-green-400">Strong</td>
                                <td className="px-4 py-3 text-center font-mono">7-8</td>
                                <td className="px-4 py-3 text-center font-mono">9-10</td>
                                <td className="px-4 py-3 text-center font-mono">12-13</td>
                              </tr>
                              <tr className="bg-foreground/[0.02]">
                                <td className="px-4 py-3 font-bold text-yellow-400">Moderate</td>
                                <td className="px-4 py-3 text-center font-mono">5-6</td>
                                <td className="px-4 py-3 text-center font-mono">6-8</td>
                                <td className="px-4 py-3 text-center font-mono">8-11</td>
                              </tr>
                              <tr className="bg-foreground/[0.02]">
                                <td className="px-4 py-3 font-bold text-orange-400">Weak</td>
                                <td className="px-4 py-3 text-center font-mono">3-4</td>
                                <td className="px-4 py-3 text-center font-mono">4-5</td>
                                <td className="px-4 py-3 text-center font-mono">4-7</td>
                              </tr>
                              <tr className="bg-foreground/[0.02]">
                                <td className="px-4 py-3 font-bold text-red-400">Critical</td>
                                <td className="px-4 py-3 text-center font-mono">1-2</td>
                                <td className="px-4 py-3 text-center font-mono">1-3</td>
                                <td className="px-4 py-3 text-center font-mono">1-3</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="font-bold text-foreground text-lg mb-3">Category Impact Multipliers</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Some categories are more impactful to a nation's overall strength. These have higher maximum scores, indicated by stars next to the category name.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div className="p-4 rounded-xl border border-border/50 bg-foreground/5 flex flex-col gap-1">
                            <span className="text-muted-foreground tracking-widest text-lg font-black">★</span>
                            <span className="font-bold text-foreground text-sm">Standard</span>
                            <span className="text-xs text-muted-foreground">Max 10 points</span>
                          </div>
                          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col gap-1">
                            <span className="text-blue-500 tracking-widest text-lg font-black">★★</span>
                            <span className="font-bold text-foreground text-sm">Medium Impact</span>
                            <span className="text-xs text-muted-foreground">Max 12 points</span>
                          </div>
                          <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex flex-col gap-1">
                            <span className="text-yellow-500 tracking-widest text-lg font-black">★★★</span>
                            <span className="font-bold text-foreground text-sm">High Impact</span>
                            <span className="text-xs text-muted-foreground">Max 15 points</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "rankings" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-3xl font-black tracking-tight text-foreground mb-4">Nation Rankings</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          Your final score determines your new nation's global status. Build a well-rounded roster to achieve Superpower status.
                        </p>
                      </div>

                      <div className="grid gap-3">
                        {NATION_RANKS.map((r) => (
                          <div key={r.label} className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-card p-5">
                            <div className="relative z-10 flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-foreground/5 ${r.color}`}>
                                {r.icon}
                              </div>
                              <span className={`text-base font-bold ${r.color}`}>{r.label}</span>
                            </div>
                            <span className="relative z-10 font-mono text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">{r.range} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "bonuses" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-3xl font-black tracking-tight text-foreground mb-4">Synergies & Bonuses</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          Specialized nations can earn massive bonus points by focusing on specific geographic or economic themes.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <Star className="w-5 h-5 text-yellow-500" />
                          </div>
                          <h4 className="font-bold text-foreground text-lg tracking-tight">Agricultural Giant</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Draft a nation with massive land area but sparse population. Maximizes food production capabilities.
                          </p>
                        </div>
                        
                        <div className="p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Star className="w-5 h-5 text-blue-500" />
                          </div>
                          <h4 className="font-bold text-foreground text-lg tracking-tight">Tech Megacity</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Draft a highly dense population into a small geographical area. Maximizes urbanization and innovation output.
                          </p>
                        </div>
                        
                        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 sm:col-span-2">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Star className="w-5 h-5 text-emerald-500" />
                          </div>
                          <h4 className="font-bold text-foreground text-lg tracking-tight">Resource Extraction Titan</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Combine massive size with moderate population to create an industrial powerhouse focused on raw materials.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "modes" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-3xl font-black tracking-tight text-foreground mb-4">Game Modes</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          Play GeoDraft your way. Test your knowledge across multiple unique and challenging game modes.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                          <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-2"><ShieldPlus className="w-4 h-4"/>Classic</h4>
                          <p className="text-sm text-muted-foreground">Draft one country per turn from 3 options. Build the most balanced nation possible.</p>
                        </div>
                        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                          <h4 className="font-bold text-blue-400 mb-1 flex items-center gap-2"><Globe className="w-4 h-4"/>Double Draft</h4>
                          <p className="text-sm text-muted-foreground">Draft two countries at a time from a grid of 6. Synergies become crucial.</p>
                        </div>
                        <div className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/5">
                          <h4 className="font-bold text-pink-400 mb-1 flex items-center gap-2"><PartyPopper className="w-4 h-4"/>Party</h4>
                          <p className="text-sm text-muted-foreground">Draft countries based on specific required categories. Fast, chaotic, and fun!</p>
                        </div>
                        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                          <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-2"><Search className="w-4 h-4"/>Guess</h4>
                          <p className="text-sm text-muted-foreground">Test your knowledge! Guess the real-world country based purely on its stats.</p>
                        </div>
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                          <h4 className="font-bold text-red-400 mb-1 flex items-center gap-2"><Swords className="w-4 h-4"/>Sabotage</h4>
                          <p className="text-sm text-muted-foreground">Draft for your opponent. Give them the absolute worst stats possible.</p>
                        </div>
                        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                          <h4 className="font-bold text-indigo-400 mb-1 flex items-center gap-2"><CalendarDays className="w-4 h-4"/>Daily Challenge</h4>
                          <p className="text-sm text-muted-foreground">A unique global seed every day. Compete globally with the exact same country pool.</p>
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function DailyCard() {
  const [, navigate] = useLocation(); const { firebaseUser } = useFirebaseAuth(); const [cloudCompleted, setCloudCompleted] = useState(false); const [cloudState, setCloudState] = useState<any>(null);
  const todayKey = useMemo(() => new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }), []); const todayLabel = useMemo(() => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/New_York" }), []);
  useEffect(() => { if (firebaseUser) { checkDailySubmitted(firebaseUser.uid).then(setCloudCompleted); getDailyState(firebaseUser.uid, todayKey).then(setCloudState); } }, [firebaseUser, todayKey]);
  const dailyResult = useMemo<{ score: number; completed: boolean } | null>(() => { try { const raw = localStorage.getItem(`countryDraftDailyResult_${todayKey}`); if (!raw) return null; return JSON.parse(raw); } catch { return null; } }, [todayKey]);
  const inProgressLocal = useMemo(() => { try { const raw = localStorage.getItem(`countryDraftState_daily_${todayKey}`); if (!raw) return false; const s = JSON.parse(raw); return s && !s.gameOver && s.isDailyMode; } catch { return false; } }, [todayKey]);
  const inProgress = inProgressLocal || (cloudState && !cloudState.gameOver);
  function playDaily() { localStorage.setItem("countryDraftDailyMode", "true"); localStorage.setItem("countryDraftDailyDate", todayKey); localStorage.removeItem("countryDraftMode"); navigate("/game/daily"); }
  const alreadyCompleted = dailyResult?.completed === true || cloudCompleted;
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }} className="w-full">
      <button 
        onClick={playDaily} 
        className={`w-full text-left rounded-3xl border p-6 relative overflow-hidden transition-all duration-300 group flex items-center justify-between shadow-sm hover:shadow-xl ${
          alreadyCompleted 
            ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10" 
            : "border-amber-400/40 bg-amber-400/5 hover:bg-amber-400/10"
        }`}
      >
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100 ${alreadyCompleted ? "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" : "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent"}`} />
        
        <div className="relative flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${alreadyCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-400/20 text-amber-400"}`}>
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h2 className={`font-sans text-2xl font-bold tracking-tight ${alreadyCompleted ? "text-emerald-400" : "text-amber-400"}`}>Daily Challenge</h2>
                <p className="text-sm text-muted-foreground font-medium">{todayLabel}</p>
              </div>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">Everyone drafts the exact same pool of countries today. Compare your strategy against the world.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {alreadyCompleted && (
              <div className="flex-1 sm:flex-none bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-8 py-4 text-center backdrop-blur-md">
                <div className="font-sans text-3xl font-bold text-emerald-400 group-hover:scale-105 transition-transform duration-500">{dailyResult?.score || cloudState?.totalScore || 0} pts</div>
                <div className="text-xs font-bold uppercase tracking-widest text-emerald-400/60 mt-1">Your Score</div>
              </div>
            )}
          </div>
        </div>
        
        <div className={`ml-4 flex-shrink-0 transition-all duration-500 transform group-hover:translate-x-2 ${alreadyCompleted ? 'text-emerald-500/50 group-hover:text-emerald-400' : 'text-amber-500/50 group-hover:text-amber-400'}`}>
          <ChevronRight className="w-8 h-8" />
        </div>
      </button>
    </motion.div>
  );
}

function LoginScreen({ onSignIn, onShowGuidebook }: { onSignIn: () => void, onShowGuidebook: () => void }) {
  const [, setLocation] = useLocation();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 max-w-4xl mx-auto w-full text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-12 w-full">
        <div className="flex flex-col items-center">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
            <img src="/logo.svg" alt="GeoDrafts Logo" className="w-32 h-32 mb-8 rounded-full object-cover" />
          </motion.div>
          <h1 className="font-sans text-6xl md:text-8xl font-black text-foreground mb-6 tracking-tighter leading-none">GeoDrafts</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
            The premier strategic geography game. Draft real countries, maximize your stats, and build the ultimate nation.
          </p>
        </div>

        <div className="max-w-md mx-auto w-full space-y-4 pt-4">
          <button
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-3 px-8 py-6 rounded-3xl bg-primary text-primary-foreground font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 group"
          >
            <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            Sign In
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setLocation("/leaderboard")} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-card border border-border text-card-foreground hover:bg-muted active:scale-[0.98] transition-all font-bold shadow-sm">
              <Trophy className="w-5 h-5 text-yellow-400" />Ranks
            </button>
            <button onClick={() => onShowGuidebook()} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-card border border-border text-card-foreground hover:bg-muted active:scale-[0.98] transition-all font-bold shadow-sm">
              <BookOpen className="w-5 h-5 text-blue-400" />Guide
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Pre-load all leaderboards
    const modes = ["normal", "hard", "daily", "double", "guess"];
    for (const mode of modes) {
      queryClient.prefetchQuery({
        queryKey: ["leaderboard", mode],
        queryFn: () => getTopScores(mode),
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [queryClient]);

  const [, navigate] = useLocation();
  const [showGuidebook, setShowGuidebook] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { firebaseUser, profile, needsUsername, refreshProfile, isLoading } = useFirebaseAuth();

  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isHosting, setIsHosting] = useState(false);

  useEffect(() => {
    if (firebaseUser) refreshProfile();
  }, [firebaseUser, refreshProfile]);

  async function handleHost() {
    if (!firebaseUser || !profile) return;
    setIsHosting(true);
    try {
      const code = await createRoom(firebaseUser.uid, profile.username, "party", "easy");
      navigate(`/lobby?room=${code}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create room");
    } finally {
      setIsHosting(false);
    }
  }

  async function handleJoin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!firebaseUser || !profile) return;
    if (joinCode.length !== 6) {
      toast.error("Room code must be 6 characters");
      return;
    }
    setIsJoining(true);
    try {
      await joinRoom(joinCode.toUpperCase(), firebaseUser.uid, profile.username);
      navigate(`/lobby?room=${joinCode.toUpperCase()}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  }

  function startGame(mode: string, hardMode: boolean) {
    localStorage.setItem("countryDraftHardMode", String(hardMode));
    localStorage.setItem("countryDraftMode", mode);
    localStorage.removeItem("countryDraftDailyMode");
    localStorage.removeItem("countryDraftDailyDate");
    localStorage.removeItem("countryDraftState_v4");
    localStorage.removeItem("countryDraftRoomCode");
    if (mode === "normal") navigate("/game/normal");
    else if (mode === "double") navigate("/game/double");
    else if (mode === "guess") navigate("/game/guess");
    else navigate(`/game/${mode}`);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-3 flex items-center justify-end bg-transparent sticky top-0 z-40">
        <SettingsButton />
      </header>

      {!firebaseUser ? (
        <LoginScreen onSignIn={() => setShowAuthModal(true)} onShowGuidebook={() => setShowGuidebook(true)} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-start px-4 md:px-8 py-16 max-w-6xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex flex-col w-full">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-8 text-center md:text-left">
              <div className="flex items-center gap-6">
                <img src="/logo.svg" alt="GeoDrafts Logo" className="w-20 h-20 rounded-full object-cover" />
                <div>
                  <h1 className="font-sans text-5xl md:text-6xl font-black text-foreground tracking-tighter mb-2">GeoDrafts</h1>
                  <p className="text-lg text-muted-foreground font-medium">Draft your way to a superpower.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate("/leaderboard")} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-card border border-border text-card-foreground hover:bg-muted active:scale-95 transition-all font-bold shadow-sm"><Trophy className="w-5 h-5 text-yellow-400" />Ranks</button>
                <button onClick={() => setShowGuidebook(true)} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-card border border-border text-card-foreground hover:bg-muted active:scale-95 transition-all font-bold shadow-sm"><BookOpen className="w-5 h-5 text-blue-400" />Guide</button>
              </div>
            </div>

            <DailyCard />

            {/* Gapless Bento Grid */}
            <div className="border border-border rounded-[2rem] shadow-2xl overflow-hidden mt-8 bg-card text-card-foreground">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                
                {/* Row 1: Classic Mode & Double Draft */}
                <div className="col-span-1 relative bg-card border-b md:border-r border-border p-8 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground mb-5 transition-transform duration-500">
                      <Globe className="w-6 h-6" />
                    </div>
                    <h3 className="font-sans text-2xl font-bold mb-2 text-card-foreground">Classic Draft</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-8">The original experience. See all ratings before assigning them to slots to carefully construct your nation.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button onClick={() => startGame("normal", false)} className="py-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-sm font-bold transition-colors flex items-center justify-center gap-1"><ShieldPlus className="w-3.5 h-3.5"/> Normal</button>
                    <button onClick={() => startGame("normal", true)} className="py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-bold transition-colors flex items-center justify-center gap-1"><ShieldAlert className="w-3.5 h-3.5"/> Hard Mode</button>
                  </div>
                </div>

                <div className="col-span-1 bg-card border-b border-border p-8 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-5 transition-transform duration-500">
                      <ArrowLeftRight className="w-6 h-6" />
                    </div>
                    <h3 className="font-sans text-2xl font-bold mb-2 text-card-foreground">Double Draft</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-8">Pick between two randomly generated countries each round. Adapt your strategy on the fly to build the strongest nation possible.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button onClick={() => startGame("double", false)} className="py-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-sm font-bold transition-colors flex items-center justify-center gap-1"><ShieldPlus className="w-3.5 h-3.5"/> Normal</button>
                    <button onClick={() => startGame("double", true)} className="py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-bold transition-colors flex items-center justify-center gap-1"><ShieldAlert className="w-3.5 h-3.5"/> Hard</button>
                  </div>
                </div>

                {/* Row 2: Guess the Country & Associations */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 border-b border-border">
                  <button onClick={() => startGame("guess", false)} className="col-span-1 bg-card border-b md:border-b-0 md:border-r border-border p-8 hover:bg-muted transition-colors group text-left active:scale-[0.99] duration-300">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-5 group-hover:scale-110 transition-transform duration-500">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="font-sans text-2xl font-bold mb-2 text-card-foreground">Guess the Country</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Identify a mystery nation by looking solely at its stats.</p>
                  </button>

                  <button onClick={() => navigate("/game/associations/setup")} className="col-span-1 bg-card p-8 hover:bg-muted transition-colors group text-left active:scale-[0.99] duration-300">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 mb-5 group-hover:scale-110 transition-transform duration-500">
                      <Brain className="w-6 h-6" />
                    </div>
                    <h3 className="font-sans text-2xl font-bold mb-2 text-card-foreground">Associations</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Test your knowledge by mapping flags, capitals, and countries together.</p>
                  </button>
                </div>

                {/* Multiplayer Section - Full Width */}
                <div className="col-span-1 md:col-span-2 bg-muted/30 border-t border-border p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-blue-500/5 pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
                    <div className="w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-sans text-2xl font-bold mb-2 text-card-foreground">Multiplayer Mode</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">Host a Party or Sabotage game with your friends in real-time.</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
                    <button onClick={handleHost} disabled={isHosting} className="w-full sm:w-auto px-6 py-4 rounded-xl bg-foreground text-background font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50">
                      {isHosting ? "Hosting..." : "Host Game"}
                    </button>
                    <form onSubmit={handleJoin} className="w-full sm:w-auto relative flex items-center">
                      <input
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        placeholder="CODE"
                        className="w-full sm:w-32 bg-card text-foreground placeholder-muted-foreground border border-border rounded-xl px-4 py-4 font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-ring uppercase text-center text-sm"
                      />
                      <button type="submit" disabled={isJoining || joinCode.length !== 6} className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-foreground text-background font-bold hover:bg-foreground/90 active:scale-95 transition-all disabled:opacity-0 disabled:scale-90 duration-300 text-xs">
                        Join
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </div>

            {/* Beta 1.0 Draft for DevTest */}
            {profile?.username?.toLowerCase().trim() === "devtest" && (
              <div className="mt-8 border border-primary/30 rounded-2xl p-6 bg-primary/5 shadow-xl w-full text-center">
                <div className="flex items-center justify-center gap-2 mb-3 text-primary">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-sans text-xl font-bold">BETA 1.0 Classic Draft</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Test the new size/population synergy formula and economy industry types!
                </p>
                <button 
                  onClick={() => startGame("beta-normal", false)}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-95 transition-all shadow-md"
                >
                  Play Beta Draft
                </button>
              </div>
            )}

            <AchievementsCard profile={profile} />

          </motion.div>
        </div>
      )}

      <footer className="mt-8 md:mt-12 py-8 text-center flex items-center justify-center gap-4">
        <button onClick={() => setShowAboutModal(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold">
          About
        </button>
        <span className="text-muted-foreground/50 text-xs font-black">&bull;</span>
        <button 
          onClick={() => setShowContactModal(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold"
        >
          Contact the Devs
        </button>
      </footer>

      <AnimatePresence>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        {showGuidebook && <GuidebookModal onClose={() => setShowGuidebook(false)} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}
        {needsUsername && firebaseUser && (
          <UsernamePrompt user={firebaseUser} onComplete={refreshProfile} />
        )}
        {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
