import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Trophy, ChevronDown, ArrowLeft, Globe, CalendarDays, User, Medal, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { Logo } from "@/components/Logo";
import { getTopScores, getCloudPersonalScores, deleteCloudPersonalScore, deleteGlobalScore, type LeaderboardEntry } from "@/lib/firestore";
import { loadPersonalLeaderboard, deleteLocalPersonalScore, type GameMode, type PersonalLeaderboardEntry } from "@/lib/local-leaderboard";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function LeaderboardRow({ rank, entry, isPersonal = false, isOwner = false, onDelete }: { rank: number; entry: LeaderboardEntry | PersonalLeaderboardEntry; isPersonal?: boolean; isOwner?: boolean; onDelete?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const medal = rank === 1 ? <Medal className="w-6 h-6 text-yellow-400" /> : rank === 2 ? <Medal className="w-6 h-6 text-slate-300" /> : rank === 3 ? <Medal className="w-6 h-6 text-amber-600" /> : null;
  const rankColor =
    rank === 1 ? "text-yellow-400" : rank === 2 ? "text-slate-300" : rank === 3 ? "text-amber-600" : "text-muted-foreground";

  const isGlobal = "username" in entry;
  
  const date = isGlobal
    ? (entry as LeaderboardEntry).createdAt ? new Date(((entry as LeaderboardEntry).createdAt as any).toMillis()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : (entry as LeaderboardEntry).date ?? ""
    : (entry as PersonalLeaderboardEntry).date;

  const mode = isGlobal ? (entry as LeaderboardEntry).mode : null;
  const isDaily = mode === "daily";
  const isHard = mode === "hard";
  const isDouble = mode === "double";
  const isGuess = mode === "guess";

  const roster = isGlobal ? (entry as LeaderboardEntry).roster : (entry as PersonalLeaderboardEntry).roster;
  const guesses = isGlobal ? (entry as LeaderboardEntry).guesses : (entry as PersonalLeaderboardEntry).guesses;
  const mysteryCountry = isGlobal ? (entry as LeaderboardEntry).mysteryCountry : (entry as PersonalLeaderboardEntry).mysteryCountry;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/50 bg-card overflow-hidden transition-colors relative"
    >
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-foreground/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`text-base font-black w-8 text-center shrink-0 flex justify-center ${rankColor}`}>
          {medal ?? `#${rank}`}
        </span>
        
        {isGlobal ? (
          <span className="font-bold text-foreground text-lg tracking-tight flex-1">{(entry as LeaderboardEntry).username}</span>
        ) : (
          <span className="font-bold text-foreground text-lg tracking-tight flex-1">You</span>
        )}

        <span className="text-foreground font-black text-lg tracking-tight">{entry.score} pts</span>
        
        {isGlobal && (
          <span
            className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-widest mr-2 ${
              isDaily
                ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                : isHard
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : isDouble
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                : isGuess
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-foreground/10 text-muted-foreground/80 border border-border"
            }`}
          >
            {isDaily ? "Daily" : isHard ? "Hard" : isDouble ? "Double" : isGuess ? "Guess" : "Normal"}
          </span>
        )}

        <span className="text-sm font-medium text-muted-foreground mr-2 hidden sm:block">{date}</span>
        
        {((roster && Object.keys(roster).length > 0) || (guesses && guesses.length > 0)) && (
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </button>
      <AnimatePresence>
        {expanded && ((roster && Object.keys(roster).length > 0) || (guesses && guesses.length > 0)) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-border/50 bg-background/50">
               {roster && Object.keys(roster).length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {Object.entries(roster).map(([cat, name]) => (
                     <div key={cat} className="flex flex-col gap-0.5">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">{cat}</span>
                       <span className="text-foreground font-bold text-sm truncate">{name}</span>
                     </div>
                   ))}
                 </div>
               ) : guesses ? (
                 <div className="text-sm">
                   <div className="mb-3 text-muted-foreground text-xs font-black tracking-widest uppercase">Mystery Country: <span className="font-bold text-foreground capitalize tracking-normal">{mysteryCountry}</span></div>
                   <div className="flex gap-2 flex-wrap">
                     {guesses.map((g, i) => (
                       <span key={i} className="px-3 py-1.5 bg-foreground/5 rounded-lg text-xs font-bold border border-border text-foreground/80">
                         {i + 1}. {g}
                       </span>
                     ))}
                   </div>
                 </div>
               ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {(isPersonal || isOwner) && onDelete && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors bg-card/80 backdrop-blur-sm z-10"
          title="Delete record"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

type ModeFilter = "normal" | "hard" | "daily" | "double" | "double_hard" | "guess";
type ParentMode = "classic" | "double" | "guess" | "daily";
type ScopeFilter = "global" | "personal";

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const [personalEntries, setPersonalEntries] = useState<PersonalLeaderboardEntry[]>([]);
  
  const [parentMode, setParentMode] = useState<ParentMode>("classic");
  const [difficulty, setDifficulty] = useState<"normal" | "hard">("normal");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("global");
  
  const modeFilter = useMemo<ModeFilter>(() => {
    if (parentMode === "classic") return difficulty === "normal" ? "normal" : "hard";
    if (parentMode === "double") return difficulty === "normal" ? "double" : "double_hard";
    return parentMode as ModeFilter;
  }, [parentMode, difficulty]);
  
  const { isLight, toggleTheme } = useTheme();

  const todayLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const { firebaseUser } = useFirebaseAuth();
  const queryClient = useQueryClient();

  const handleDeletePersonalScore = async (entry: any) => {
    if (entry.id) {
      await deleteCloudPersonalScore(entry.id);
      queryClient.invalidateQueries({ queryKey: ["personal_leaderboard", modeFilter, firebaseUser?.uid] });
    } else {
      deleteLocalPersonalScore(modeFilter as GameMode, entry.timestamp);
      setPersonalEntries(loadPersonalLeaderboard(modeFilter as GameMode));
    }
  };

  const handleDeleteGlobalScore = async (entry: LeaderboardEntry) => {
    await deleteGlobalScore(entry.id);
    queryClient.invalidateQueries({ queryKey: ["leaderboard", modeFilter] });
  };

  const { data: globalEntries = [], isLoading: globalLoading, error: globalError } = useQuery({
    queryKey: ["leaderboard", modeFilter],
    queryFn: () => getTopScores(modeFilter, 50),
    enabled: scopeFilter === "global",
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const { data: cloudPersonalEntries = [], isLoading: cloudPersonalLoading } = useQuery({
    queryKey: ["personal_leaderboard", modeFilter, firebaseUser?.uid],
    queryFn: () => getCloudPersonalScores(firebaseUser!.uid, modeFilter),
    enabled: scopeFilter === "personal" && !!firebaseUser,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (scopeFilter === "personal") {
      if (firebaseUser) {
        setPersonalEntries(cloudPersonalEntries as PersonalLeaderboardEntry[]);
      } else {
        setPersonalEntries(loadPersonalLeaderboard(modeFilter as GameMode));
      }
    }
  }, [modeFilter, scopeFilter, firebaseUser, cloudPersonalEntries]);

  const modeTabs: { key: ParentMode; label: string; activeClass: string }[] = [
    { key: "classic", label: "Classic Draft", activeClass: "bg-white text-black font-black" },
    { key: "double",  label: "Double Draft", activeClass: "bg-purple-500 text-white font-black" },
    { key: "guess",   label: "Guess Country", activeClass: "bg-emerald-500 text-white font-black" },
    { key: "daily",   label: `Daily`,   activeClass: "bg-amber-400 text-black font-black" },
  ];

  const entriesToDisplay = scopeFilter === "global" ? globalEntries : personalEntries;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-foreground/20">
      <header className="h-20 shrink-0 px-6 md:px-8 flex items-center justify-between z-20 bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={() => navigate("/")} 
            className="font-sans text-xl md:text-2xl font-black tracking-tighter flex items-center gap-3 hover:opacity-80 transition-opacity text-foreground"
          >
            <Logo className="w-6 h-6 opacity-90" />GeoDrafts
          </motion.button>
          <div className="h-6 w-px bg-foreground/10 hidden md:block" />
          <div className="px-3 py-1.5 rounded-full bg-card border border-border text-xs font-bold text-muted-foreground hidden sm:block tracking-widest uppercase">
            Leaderboards
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        
        {/* Scope Toggle: Global vs Personal */}
        <div className="flex bg-card p-1.5 rounded-2xl mb-12 border border-border/50">
          <button
            onClick={() => setScopeFilter("global")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              scopeFilter === "global" ? "bg-white shadow-sm text-black" : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <Globe className="w-4 h-4" /> Global
          </button>
          <button
            onClick={() => setScopeFilter("personal")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              scopeFilter === "personal" ? "bg-white shadow-sm text-black" : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <User className="w-4 h-4" /> Personal
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <Trophy className={`w-10 h-10 ${scopeFilter === "global" ? "text-yellow-400" : "text-foreground/80"}`} />
          <h1 className="font-sans text-5xl md:text-6xl font-black text-foreground tracking-tighter leading-none">
             {scopeFilter === "global" ? "Global Rankings" : "Personal Records"}
          </h1>
        </motion.div>

        {modeFilter === "daily" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-6 py-5 flex items-center gap-4"
          >
            <CalendarDays className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="text-base font-black text-amber-400 uppercase tracking-widest">Daily Challenge</div>
              <div className="text-sm text-amber-400/60 font-medium mt-1">
                {scopeFilter === "global" ? "Everyone drafts the same pool today — " : "Your previous daily records. Today is "}
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {modeTabs.map((tab) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                key={tab.key}
                onClick={() => setParentMode(tab.key)}
                className={`px-5 py-2.5 rounded-full text-sm uppercase tracking-widest transition-colors border ${
                  parentMode === tab.key
                    ? tab.activeClass + " border-transparent"
                    : "text-muted-foreground font-bold border-border hover:text-foreground hover:bg-foreground/5 bg-card"
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="popLayout">
            {(parentMode === "classic" || parentMode === "double") && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="flex gap-2"
              >
                <div className="flex bg-card p-1.5 rounded-full border border-border">
                  <button
                    onClick={() => setDifficulty("normal")}
                    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                      difficulty === "normal" 
                        ? "bg-green-500 text-white" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setDifficulty("hard")}
                    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                      difficulty === "hard" 
                        ? "bg-red-500 text-white" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Hard Mode
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {globalLoading || (scopeFilter === "personal" && !!firebaseUser && cloudPersonalLoading) ? (
          <div className="flex items-center justify-center py-32">
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-muted-foreground font-black tracking-widest text-sm uppercase"
            >
              Loading scores...
            </motion.div>
          </div>
        ) : globalError && scopeFilter === "global" ? (
          <div className="text-center py-32">
            <div className="text-red-500 font-bold mb-4">{globalError instanceof Error ? globalError.message : "Failed to load global leaderboard."}</div>
            <button onClick={() => window.location.reload()} className="text-sm text-muted-foreground font-bold uppercase tracking-widest hover:text-foreground transition-colors">
              Try again
            </button>
          </div>
        ) : entriesToDisplay.length === 0 ? (
          <div className="text-center py-32">
            {scopeFilter === "global" ? <Globe className="w-16 h-16 mx-auto mb-6 opacity-10 text-foreground" /> : <User className="w-16 h-16 mx-auto mb-6 opacity-10 text-foreground" />}
            <p className="text-muted-foreground font-bold text-lg tracking-tight">
              {modeFilter === "daily"
                ? `No daily scores yet. Be the first today!`
                : `No scores yet. Play a game to record a score!`}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="mt-8 px-8 py-3 rounded-xl bg-white text-black text-sm font-black uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Play Now
            </motion.button>
          </div>
        ) : (
          <div className="grid gap-2">
            {entriesToDisplay.map((entry, i) => {
              const isOwner = scopeFilter === "global" && !!firebaseUser && 'uid' in entry && entry.uid === firebaseUser.uid;
              const handleDelete = scopeFilter === "personal" 
                ? () => handleDeletePersonalScore(entry) 
                : isOwner 
                  ? () => handleDeleteGlobalScore(entry as LeaderboardEntry) 
                  : undefined;

              return (
                <LeaderboardRow 
                  key={"id" in entry ? entry.id : `${entry.timestamp}-${i}`} 
                  rank={i + 1} 
                  entry={entry} 
                  isPersonal={scopeFilter === "personal"} 
                  isOwner={isOwner}
                  onDelete={handleDelete} 
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
