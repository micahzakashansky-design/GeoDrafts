import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "wouter";
import {
  Globe, Shield, Trophy, BookOpen, CalendarDays, X,
  Moon, Sun, Users, Swords, PartyPopper, ArrowLeftRight,
  Search, Zap, Star, Calculator, ChevronRight, Settings, LogIn, User, Loader2, Brain
} from "lucide-react";
import { useTheme } from "../lib/theme-context";
import { useFirebaseAuth } from "../lib/use-firebase-auth";
import { checkDailySubmitted, getDailyState, createRoom, joinRoom } from "../lib/firestore";
import { UsernamePrompt } from "../components/UsernamePrompt";
import { SettingsModal } from "../components/SettingsModal";
import { AuthModal } from "../components/AuthModal";
import { ContactModal } from "../components/ContactModal";
import { AboutModal } from "../components/AboutModal";
import { Logo } from "../components/Logo";
import { toast } from "sonner";

const NATION_RANKS = [
  { label: "Superpower", range: "165+", color: "text-yellow-400" },
  { label: "Major Power", range: "140-164", color: "text-blue-400" },
  { label: "Regional Power", range: "110-139", color: "text-green-400" },
  { label: "Developing Nation", range: "80-109", color: "text-orange-400" },
  { label: "Struggling State", range: "0-79", color: "text-red-400" },
];

function GuidebookModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"basics" | "scoring" | "bonus">("basics");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#000000] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5"><div className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /><h2 className="font-serif text-xl font-bold text-white">Game Guidebook</h2></div><button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white"><X className="w-5 h-5" /></button></div>
        <div className="flex border-b border-white/10 bg-black">{(["basics", "scoring", "bonus"] as const).map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-semibold capitalize transition-all border-b-2 ${activeTab === tab ? "border-primary text-primary bg-primary/5" : "border-transparent text-white/40 hover:text-white"}`}>{tab}</button>))}</div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "basics" && (<div className="space-y-4"><div className="space-y-2"><h3 className="text-lg font-semibold flex items-center gap-2 text-white"><Zap className="w-4 h-4 text-amber-400" />How to Play</h3><p className="text-sm text-white/40 leading-relaxed">You are presented with countries one-by-one from a randomized pool. For each country, you must assign it to one of 15 available category slots. Once a slot is filled, it cannot be changed.</p></div></div>)}
          {activeTab === "scoring" && (<div className="space-y-4"><div className="space-y-2"><h3 className="text-lg font-semibold flex items-center gap-2 text-white"><Calculator className="w-4 h-4 text-emerald-400" />Point System</h3><p className="text-sm text-white/40">Each category is scored from 1 to 10 based on real data.</p></div></div>)}
          {activeTab === "bonus" && (<div><h3 className="text-sm font-semibold text-white mb-3">Nation Rankings</h3><div className="space-y-1.5">{NATION_RANKS.map((r) => (<div key={r.label} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"><span className={`text-sm font-semibold ${r.color}`}>{r.label}</span><span className="text-xs text-white/40">{r.range}</span></div>))}</div></div>)}
        </div>
      </motion.div>
    </motion.div>
  );
}

function DailyCard() {
  const [, navigate] = useLocation(); const { firebaseUser } = useFirebaseAuth(); const [cloudCompleted, setCloudCompleted] = useState(false); const [cloudState, setCloudState] = useState<any>(null);
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []); const todayLabel = useMemo(() => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }), []);
  useEffect(() => { if (firebaseUser) { checkDailySubmitted(firebaseUser.uid).then(setCloudCompleted); getDailyState(firebaseUser.uid, todayKey).then(setCloudState); } }, [firebaseUser, todayKey]);
  const dailyResult = useMemo<{ score: number; completed: boolean } | null>(() => { try { const raw = localStorage.getItem(`countryDraftDailyResult_${todayKey}`); if (!raw) return null; return JSON.parse(raw); } catch { return null; } }, [todayKey]);
  const inProgressLocal = useMemo(() => { try { const raw = localStorage.getItem(`countryDraftState_daily_${todayKey}`); if (!raw) return false; const s = JSON.parse(raw); return s && !s.gameOver && s.isDailyMode; } catch { return false; } }, [todayKey]);
  const inProgress = inProgressLocal || (cloudState && !cloudState.gameOver);
  function playDaily() { localStorage.setItem("countryDraftDailyMode", "true"); localStorage.setItem("countryDraftDailyDate", todayKey); localStorage.removeItem("countryDraftMode"); navigate("/game/daily"); }
  const alreadyCompleted = dailyResult?.completed === true || cloudCompleted;
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }} className="w-full mb-8">
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
                <h2 className={`font-serif text-2xl font-bold tracking-tight ${alreadyCompleted ? "text-emerald-400" : "text-amber-400"}`}>Daily Challenge</h2>
                <p className="text-sm text-white/40 font-medium">{todayLabel}</p>
              </div>
            </div>
            <p className="text-base text-white/40 leading-relaxed max-w-md">Everyone drafts the exact same pool of countries today. Compare your strategy against the world.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {alreadyCompleted && (
              <div className="flex-1 sm:flex-none bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-8 py-4 text-center backdrop-blur-md">
                <div className="font-serif text-3xl font-bold text-emerald-400 group-hover:scale-105 transition-transform duration-500">{dailyResult?.score || cloudState?.totalScore || 0} pts</div>
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
            <img src="/logo.svg" alt="GeoDrafts Logo" className="w-32 h-32 mb-8 rounded-full object-cover shadow-2xl ring-4 ring-white/10" />
          </motion.div>
          <h1 className="font-serif text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none">GeoDrafts</h1>
          <p className="text-xl md:text-2xl text-white/40 max-w-2xl leading-relaxed font-medium">
            The premier strategic geography game. Draft real countries, maximize your stats, and build the ultimate nation.
          </p>
        </div>

        <div className="max-w-md mx-auto w-full space-y-4 pt-4">
          <button
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-3 px-8 py-6 rounded-3xl bg-primary text-primary-foreground font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 group"
          >
            <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            Enter the Draft
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setLocation("/leaderboard")} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#000000] border border-white/10 text-white hover:bg-[#0a0a0a] active:scale-[0.98] transition-all font-bold shadow-sm">
              <Trophy className="w-5 h-5 text-yellow-400" />Ranks
            </button>
            <button onClick={onShowGuidebook} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#000000] border border-white/10 text-white hover:bg-[#0a0a0a] active:scale-[0.98] transition-all font-bold shadow-sm">
              <BookOpen className="w-5 h-5 text-blue-400" />Guide
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const [showGuidebook, setShowGuidebook] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const { isLight, toggleTheme } = useTheme();
  const { firebaseUser, profile, signInWithGoogle, needsUsername, refreshProfile, isLoading } = useFirebaseAuth();

  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isHosting, setIsHosting] = useState(false);

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
        <div className="flex items-center gap-2">
          {firebaseUser && (
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-white/40 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{profile?.username || "Account"}</span>
              <Settings className="w-3.5 h-3.5 opacity-60" />
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-white/40 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>{isLight ? "Dark" : "Light"}</span>
          </button>
        </div>
      </header>

      {!firebaseUser ? (
        <LoginScreen onSignIn={() => setShowAuthModal(true)} onShowGuidebook={() => setShowGuidebook(true)} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-start px-4 md:px-8 py-16 max-w-6xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex flex-col w-full">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 text-center md:text-left">
              <div className="flex items-center gap-6">
                <img src="/logo.svg" alt="GeoDrafts Logo" className="w-20 h-20 rounded-full object-cover shadow-lg ring-2 ring-white/10" />
                <div>
                  <h1 className="font-serif text-5xl md:text-6xl font-black text-white tracking-tighter mb-2">GeoDrafts</h1>
                  <p className="text-lg text-white/40 font-medium">Draft your way to a superpower.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate("/leaderboard")} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#000000] border border-white/10 text-white hover:bg-[#0a0a0a] active:scale-95 transition-all font-bold shadow-sm"><Trophy className="w-5 h-5 text-yellow-400" />Ranks</button>
                <button onClick={() => setShowGuidebook(true)} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#000000] border border-white/10 text-white hover:bg-[#0a0a0a] active:scale-95 transition-all font-bold shadow-sm"><BookOpen className="w-5 h-5 text-blue-400" />Guide</button>
              </div>
            </div>

            <DailyCard />

            {/* Gapless Bento Grid */}
            <div className="border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden mt-8 bg-[#000000]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                
                {/* Classic Mode - Spans 2 cols on Desktop */}
                <button onClick={() => startGame("normal", false)} className="col-span-1 md:col-span-2 relative bg-[#000000] border-b md:border-r border-white/10 p-8 md:p-12 hover:bg-[#0a0a0a] transition-colors group text-left active:scale-[0.99] duration-300">
                  <div className="absolute top-8 right-8 w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-4xl font-bold mb-4 text-white">Classic Draft</h3>
                  <p className="text-lg text-white/40 max-w-sm leading-relaxed">The original experience. See all ratings before assigning them to slots to carefully construct your nation.</p>
                </button>

                {/* Hard Mode */}
                <button onClick={() => startGame("normal", true)} className="col-span-1 bg-[#000000] border-b border-white/10 p-8 md:p-12 hover:bg-red-500/5 transition-colors group text-left active:scale-[0.99] duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Shield className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif text-3xl font-bold mb-3 text-white">Hard Mode</h3>
                  <p className="text-base text-white/40 leading-relaxed">No ratings shown until assigned. Pure geography knowledge.</p>
                </button>

                {/* Special Variants - Row 2 */}
                <div className="col-span-1 bg-[#000000] border-b md:border-b-0 md:border-r border-white/10 p-8 hover:bg-[#0a0a0a] transition-colors group flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform duration-500">
                      <ArrowLeftRight className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold mb-2 text-white">Double Draft</h3>
                    <p className="text-sm text-white/40 leading-relaxed mb-8">Pick between two countries every single round.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button onClick={(e) => { e.stopPropagation(); startGame("double", false); }} className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors">Normal</button>
                    <button onClick={(e) => { e.stopPropagation(); startGame("double", true); }} className="py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-bold transition-colors">Hard</button>
                  </div>
                </div>

                <button onClick={() => startGame("guess", false)} className="col-span-1 bg-[#000000] border-b md:border-b-0 md:border-r border-white/10 p-8 hover:bg-[#0a0a0a] transition-colors group text-left active:scale-[0.99] duration-300">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform duration-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2 text-white">Guess the Country</h3>
                  <p className="text-sm text-white/40 leading-relaxed">Identify a mystery nation by looking solely at its stats.</p>
                </button>

                <button onClick={() => navigate("/game/associations/setup")} className="col-span-1 bg-[#000000] border-b md:border-b-0 border-white/10 p-8 hover:bg-[#0a0a0a] transition-colors group text-left active:scale-[0.99] duration-300">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform duration-500">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2 text-white">Associations</h3>
                  <p className="text-sm text-white/40 leading-relaxed">Test your knowledge by mapping flags, capitals, and countries together.</p>
                </button>

                {/* Multiplayer Section - Full Width */}
                <div className="col-span-1 md:col-span-3 bg-[#080808] border-t border-white/10 p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-blue-500/5 pointer-events-none" />
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-serif text-3xl font-bold mb-2 text-white">Multiplayer Mode</h3>
                      <p className="text-lg text-white/40 max-w-sm">Host a Party or Sabotage game with your friends in real-time.</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                    <button onClick={handleHost} disabled={isHosting} className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-white text-black font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50">
                      {isHosting ? "Hosting..." : "Host Game"}
                    </button>
                    <form onSubmit={handleJoin} className="w-full sm:w-auto relative flex items-center">
                      <input
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        placeholder="CODE"
                        className="w-full sm:w-40 bg-[#000000] text-white placeholder-white/20 border border-white/10 rounded-2xl px-6 py-5 font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-white/20 uppercase text-center text-lg"
                      />
                      <button type="submit" disabled={isJoining || joinCode.length !== 6} className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-white text-black font-bold hover:bg-white/90 active:scale-95 transition-all disabled:opacity-0 disabled:scale-90 duration-300">
                        Join
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        </div>
      )}

      <footer className="w-full py-8 border-t border-white/10 mt-auto flex items-center justify-center gap-6 bg-card/30">
        <button onClick={() => setShowAboutModal(true)} className="text-sm text-white/40 hover:text-white transition-colors font-semibold">
          About GeoDrafts
        </button>
        <span className="text-white/40/50 text-xs font-black">&bull;</span>
        <button 
          onClick={() => setShowContactModal(true)}
          className="text-sm text-white/40 hover:text-white transition-colors font-semibold"
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
