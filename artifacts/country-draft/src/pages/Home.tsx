import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Globe, Shield, Trophy, BookOpen, CalendarDays, X,
  Moon, Sun, Users, Swords, PartyPopper, ArrowLeftRight,
  Search, Zap, Star, Calculator, ChevronRight, Settings, LogIn, User
} from "lucide-react";
import { useTheme } from "../lib/theme-context";
import { useFirebaseAuth } from "../lib/use-firebase-auth";
import { useQueryClient } from "@tanstack/react-query";
import { checkDailySubmitted, getDailyState, createRoom, joinRoom, getTopScores } from "../lib/firestore";
import UsernamePrompt from "../components/UsernamePrompt";
import SettingsModal from "../components/SettingsModal";

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30"><div className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /><h2 className="font-serif text-xl font-bold">Game Guidebook</h2></div><button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors"><X className="w-5 h-5" /></button></div>
        <div className="flex border-b border-border bg-secondary/10">{(["basics", "scoring", "bonus"] as const).map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-semibold capitalize transition-all border-b-2 ${activeTab === tab ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{tab}</button>))}</div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "basics" && (<div className="space-y-4"><div className="space-y-2"><h3 className="text-lg font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" />How to Play</h3><p className="text-sm text-muted-foreground leading-relaxed">You are presented with countries one-by-one from a randomized pool. For each country, you must assign it to one of 15 available category slots. Once a slot is filled, it cannot be changed.</p></div></div>)}
          {activeTab === "scoring" && (<div className="space-y-4"><div className="space-y-2"><h3 className="text-lg font-semibold flex items-center gap-2"><Calculator className="w-4 h-4 text-emerald-400" />Point System</h3><p className="text-sm text-muted-foreground">Each category is scored from 1 to 10 based on real data.</p></div></div>)}
          {activeTab === "bonus" && (<div><h3 className="text-sm font-semibold text-foreground mb-3">Nation Rankings</h3><div className="space-y-1.5">{NATION_RANKS.map((r) => (<div key={r.label} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"><span className={`text-sm font-semibold ${r.color}`}>{r.label}</span><span className="text-xs text-muted-foreground">{r.range}</span></div>))}</div></div>)}
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
  function playDaily() { localStorage.setItem("countryDraftDailyMode", "true"); localStorage.setItem("countryDraftDailyDate", todayKey); localStorage.removeItem("countryDraftMode"); navigate("/game"); }
  const alreadyCompleted = dailyResult?.completed === true || cloudCompleted;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }} className="w-full max-w-xl mb-6">
      <div className={`rounded-2xl border p-5 relative overflow-hidden ${alreadyCompleted ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-400/40 bg-amber-400/5"}`}><div className={`absolute inset-0 pointer-events-none ${alreadyCompleted ? "bg-gradient-to-br from-emerald-500/5 to-transparent" : "bg-gradient-to-br from-amber-400/8 to-transparent"}`} /><div className="relative"><div className="flex items-start justify-between mb-3"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alreadyCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-400/20 text-amber-400"}`}><CalendarDays className="w-6 h-6" /></div><div><h2 className={`font-semibold text-base ${alreadyCompleted ? "text-emerald-300" : "text-amber-300"}`}>Country of the Day</h2><p className="text-xs text-muted-foreground">{todayLabel}</p></div></div></div><p className="text-sm text-muted-foreground mb-4 leading-relaxed">Everyone drafts the <span className="text-foreground/80 font-medium">same shuffled pool</span> today.</p>{alreadyCompleted ? (<div className="flex items-center gap-3"><div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center group"><div className="text-2xl font-bold text-emerald-400 group-hover:scale-110 transition-transform">{dailyResult?.score || cloudState?.totalScore || 0} pts</div><div className="text-xs text-muted-foreground mt-0.5">Your score today</div></div><button onClick={playDaily} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors text-sm font-semibold">View Result</button></div>) : (<button onClick={playDaily} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30 transition-colors font-semibold text-sm"><CalendarDays className="w-4 h-4" />{inProgress ? "Continue Daily Challenge" : "Play Today's Challenge"}</button>)}</div></div>
    </motion.div>
  );
}

function MultiplayerModal({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation(); const { firebaseUser, profile, signInWithGoogle } = useFirebaseAuth(); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null); const [joinCode, setJoinCode] = useState(""); const [isJoining, setIsJoining] = useState(false); const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");
  async function handleHost(mode: "sabotage" | "party") { if (!firebaseUser || !profile) return; setLoading(true); try { const code = await createRoom(firebaseUser.uid, profile.username, mode, difficulty); localStorage.setItem("countryDraftRoomCode", code); navigate("/game"); } catch (e) { setError(e instanceof Error ? e.message : "Failed to create room"); } finally { setLoading(false); } }
  async function handleJoin() { if (!firebaseUser || !profile) return; if (joinCode.length !== 6) return; setLoading(true); try { await joinRoom(joinCode.toUpperCase(), firebaseUser.uid, profile.username); localStorage.setItem("countryDraftRoomCode", joinCode.toUpperCase()); navigate("/game"); } catch (e) { setError(e instanceof Error ? e.message : "Failed to join room"); } finally { setLoading(false); } }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30"><div className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /><h2 className="font-serif text-xl font-bold">Multiplayer Hub</h2></div><button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors"><X className="w-5 h-5" /></button></div>
        {!firebaseUser ? (
          <div className="p-8 text-center space-y-4"><div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2"><Users className="w-8 h-8 text-primary" /></div><h3 className="text-xl font-bold">Sign in Required</h3><p className="text-muted-foreground">You need an account to play with others and save your progress.</p><button onClick={signInWithGoogle} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">Sign in with Google</button></div>
        ) : isJoining ? (
          <div className="p-6 space-y-6"><div className="space-y-2 text-center"><h3 className="text-lg font-bold">Join Game</h3><p className="text-sm text-muted-foreground">Enter the 6-character room code</p></div>{error && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-xs border border-red-500/20">{error}</div>}<div className="flex justify-center"><input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} className="w-48 bg-secondary border border-border rounded-xl px-4 py-3 text-xl font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="ABCDEF" /></div><button onClick={handleJoin} disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50">{loading ? "Joining..." : "Join Game"}</button><button onClick={() => setIsJoining(false)} className="w-full text-sm text-muted-foreground hover:text-foreground">Back to Hosting</button></div>
        ) : (
          <div className="space-y-6 p-6"><div className="space-y-3"><h3 className="text-sm font-semibold text-muted-foreground uppercase">Host Difficulty</h3><div className="flex gap-2 p-1 bg-secondary/30 rounded-xl border border-border"><button onClick={() => setDifficulty("easy")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${difficulty === "easy" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Classic</button><button onClick={() => setDifficulty("hard")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${difficulty === "hard" ? "bg-red-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Hard</button></div></div>
            <div className="space-y-3"><h3 className="text-sm font-semibold text-muted-foreground uppercase">Host a Game</h3><div className="grid grid-cols-1 gap-3"><button onClick={() => handleHost("sabotage")} className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors text-left"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400"><Swords className="w-5 h-5" /></div><div><div className="font-bold">Sabotage (2 Player)</div><div className="text-xs text-muted-foreground">Pick for your opponent</div></div></div><ChevronRight className="w-4 h-4 text-muted-foreground" /></button><button onClick={() => handleHost("party")} className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors text-left"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400"><PartyPopper className="w-5 h-5" /></div><div><div className="font-bold">Party (No Limit)</div><div className="text-xs text-muted-foreground">Same countries for everyone</div></div></div><ChevronRight className="w-4 h-4 text-muted-foreground" /></button></div></div>
            <div className="flex items-center gap-2"><div className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground uppercase">or</span><div className="h-px flex-1 bg-border" /></div><button onClick={() => setIsJoining(true)} className="w-full py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors">Join Existing Game</button></div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showGuidebook, setShowGuidebook] = useState(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { isLight, toggleTheme } = useTheme();
  const { firebaseUser, profile, signInWithGoogle, needsUsername, refreshProfile } = useFirebaseAuth();

  function startGame(mode: string, hardMode: boolean) {
    localStorage.setItem("countryDraftHardMode", String(hardMode));
    localStorage.setItem("countryDraftMode", mode);
    localStorage.removeItem("countryDraftDailyMode");
    localStorage.removeItem("countryDraftDailyDate");
    localStorage.removeItem("countryDraftState_v4");
    localStorage.removeItem("countryDraftRoomCode");
    navigate("/game");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-primary" />
          <span className="font-serif text-xl font-bold text-foreground tracking-tight">GeoDrafts</span>
        </div>
        <div className="flex items-center gap-2">
          {firebaseUser ? (
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{profile?.username || "Account"}</span>
              <Settings className="w-3.5 h-3.5 opacity-60" />
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors font-semibold"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors"
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>{isLight ? "Dark" : "Light"}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-3xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }} className="flex flex-col items-center w-full"><div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-4"><Globe className="w-12 h-12 text-primary" /></div><h1 className="font-serif text-5xl font-bold text-foreground mb-2 tracking-tight">GeoDrafts</h1><p className="text-base text-muted-foreground mb-8 text-center max-w-md">Draft countries and build the ideal nation in various competitive and solo modes.</p>
          <DailyCard /><div className="w-full space-y-8">
            <section><h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2"><Star className="w-3.5 h-3.5" />Classic Experience</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><button onClick={() => startGame("normal", false)} className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform"><Globe className="w-5 h-5" /></div><div className="font-bold text-lg">Easy Mode</div><div className="text-sm text-muted-foreground">See all ratings as you draft.</div></button><button onClick={() => startGame("normal", true)} className="flex flex-col items-start p-5 rounded-2xl bg-card border border-border hover:border-red-500/50 hover:bg-red-500/5 transition-all group"><div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 mb-3 group-hover:scale-110 transition-transform"><Shield className="w-5 h-5" /></div><div className="font-bold text-lg">Hard Mode</div><div className="text-sm text-muted-foreground">No ratings shown until assigned.</div></button></div></section>
            <section><h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2"><Zap className="w-3.5 h-3.5" />Special Variants</h3><div className="space-y-6"><div className="p-5 rounded-2xl bg-card border border-border"><div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400"><ArrowLeftRight className="w-6 h-6" /></div><div><div className="font-bold text-lg">Double Draft</div><div className="text-sm text-muted-foreground">Pick between two countries every round.</div></div></div><div className="grid grid-cols-2 gap-2"><button onClick={() => startGame("double", false)} className="py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-sm font-bold transition-colors">Classic Difficulty</button><button onClick={() => startGame("double", true)} className="py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-bold transition-colors border border-red-500/20">Hard Difficulty</button></div></div><button onClick={() => startGame("guess", false)} className="w-full flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:bg-secondary/50 transition-colors text-left"><div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400"><Search className="w-6 h-6" /></div><div><div className="font-bold text-lg">Guess the Country</div><div className="text-sm text-muted-foreground">Identify a nation by its stats alone.</div></div></button></div></section>
            <section><h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2"><Users className="w-3.5 h-3.5" />Social Play</h3><button onClick={() => setShowMultiplayer(true)} className="w-full flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-blue-500/20 border border-primary/30 hover:opacity-90 transition-opacity"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-background/50 flex items-center justify-center"><Users className="w-8 h-8 text-primary" /></div><div className="text-left"><div className="font-bold text-xl">Multiplayer Hub</div><div className="text-sm text-primary/80">Play Sabotage or Party mode with friends.</div></div></div><div className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">Enter Hub</div></button></section>
            <div className="grid grid-cols-2 gap-3 pt-4"><button onClick={() => navigate("/leaderboard")} onMouseEnter={() => queryClient.prefetchQuery({ queryKey: ["leaderboard", "all"], queryFn: () => getTopScores("all", 10) })} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-sm"><Trophy className="w-4 h-4 text-yellow-400" />Leaderboard</button><button onClick={() => setShowGuidebook(true)} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-sm"><BookOpen className="w-4 h-4 text-blue-400" />Guidebook</button></div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showGuidebook && <GuidebookModal onClose={() => setShowGuidebook(false)} />}
        {showMultiplayer && <MultiplayerModal onClose={() => setShowMultiplayer(false)} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {needsUsername && firebaseUser && (
          <UsernamePrompt user={firebaseUser} onComplete={refreshProfile} />
        )}
      </AnimatePresence>
    </div>
  );
}
