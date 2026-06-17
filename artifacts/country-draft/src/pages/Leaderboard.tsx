import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Trophy, ChevronDown, ArrowLeft, Globe, CalendarDays, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { getTopScores, type LeaderboardEntry } from "@/lib/firestore";
import { loadPersonalLeaderboard, type GameMode, type PersonalLeaderboardEntry } from "@/lib/local-leaderboard";

function LeaderboardRow({ rank, entry, isPersonal = false }: { rank: number; entry: LeaderboardEntry | PersonalLeaderboardEntry; isPersonal?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
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
  const guesses = !isGlobal ? (entry as PersonalLeaderboardEntry).guesses : undefined;
  const mysteryCountry = !isGlobal ? (entry as PersonalLeaderboardEntry).mysteryCountry : undefined;

  return (
    <div className="rounded-lg border border-border/60 bg-card/30 overflow-hidden transition-colors">
      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`text-sm font-bold w-6 text-center shrink-0 ${rankColor}`}>
          {medal ?? `#${rank}`}
        </span>
        
        {isGlobal ? (
          <span className="font-bold text-foreground text-base flex-1">{(entry as LeaderboardEntry).username}</span>
        ) : (
          <span className="font-bold text-foreground text-base flex-1">You</span>
        )}

        <span className="text-primary font-bold text-sm">{entry.score} pts</span>
        
        {isGlobal && (
          <span
            className={`text-xs px-2 py-0.5 rounded font-semibold mr-1 ${
              isDaily
                ? "bg-amber-400/20 text-amber-400"
                : isHard
                ? "bg-red-500/20 text-red-400"
                : isDouble
                ? "bg-purple-500/20 text-purple-400"
                : isGuess
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-primary/20 text-primary"
            }`}
          >
            {isDaily ? "🗓️ Daily" : isHard ? "⚠️ Hard" : isDouble ? "👯 Double" : isGuess ? "❓ Guess" : "Easy"}
          </span>
        )}

        <span className="text-xs text-muted-foreground mr-1 hidden sm:block">{date}</span>
        
        {(roster || guesses) && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </button>
      <AnimatePresence>
        {expanded && (roster || guesses) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-2 border-t border-border/40">
               {roster ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                   {Object.entries(roster).map(([cat, name]) => (
                     <div key={cat} className="flex items-center gap-1.5 text-xs">
                       <span className="text-muted-foreground shrink-0 truncate">{cat}:</span>
                       <span className="text-foreground font-medium truncate">{name}</span>
                     </div>
                   ))}
                 </div>
               ) : guesses ? (
                 <div className="text-sm">
                   <div className="mb-2 text-muted-foreground">Mystery Country: <span className="font-bold text-foreground">{mysteryCountry}</span></div>
                   <div className="flex gap-2 flex-wrap">
                     {guesses.map((g, i) => (
                       <span key={i} className="px-2 py-1 bg-secondary/50 rounded-md text-xs font-medium border border-border">
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
    </div>
  );
}

type ModeFilter = "normal" | "hard" | "daily" | "double" | "guess";
type ScopeFilter = "global" | "personal";

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [personalEntries, setPersonalEntries] = useState<PersonalLeaderboardEntry[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modeFilter, setModeFilter] = useState<ModeFilter>("normal");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("global");
  
  const { isLight, toggleTheme } = useTheme();

  const todayLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  useEffect(() => {
    if (scopeFilter === "global") {
      setLoading(true);
      setError(null);
      getTopScores(modeFilter, 50)
        .then((data) => { setGlobalEntries(data); setLoading(false); })
        .catch(() => { setError("Failed to load global leaderboard."); setLoading(false); });
    } else {
      setPersonalEntries(loadPersonalLeaderboard(modeFilter as GameMode));
      setLoading(false);
    }
  }, [modeFilter, scopeFilter]);

  const modeTabs: { key: ModeFilter; label: string; activeClass: string }[] = [
    { key: "normal", label: "Normal (Easy)", activeClass: "bg-primary/20 text-primary border-primary/40" },
    { key: "hard",   label: "⚠️ Hard",      activeClass: "bg-red-500/20 text-red-400 border-red-500/40" },
    { key: "double", label: "👯 Double Draft", activeClass: "bg-purple-500/20 text-purple-400 border-purple-500/40" },
    { key: "guess",  label: "❓ Guess Country", activeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
    { key: "daily",  label: `🗓️ Daily`,   activeClass: "bg-amber-400/20 text-amber-400 border-amber-400/40" },
  ];

  const entriesToDisplay = scopeFilter === "global" ? globalEntries : personalEntries;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Globe className="w-5 h-5 text-primary" />
          <span className="font-serif text-xl font-bold text-foreground tracking-tight">GeoDrafts</span>
          <span className="text-muted-foreground text-sm hidden sm:block">Leaderboards</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors"
          >
            {isLight ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 transition-colors font-semibold"
          >
            Play Now
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        
        {/* Scope Toggle: Global vs Personal */}
        <div className="flex bg-secondary/50 p-1.5 rounded-xl mb-6">
          <button
            onClick={() => setScopeFilter("global")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
              scopeFilter === "global" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-4 h-4" /> Global
          </button>
          <button
            onClick={() => setScopeFilter("personal")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
              scopeFilter === "personal" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" /> Personal
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Trophy className={`w-6 h-6 ${scopeFilter === "global" ? "text-yellow-400" : "text-primary"}`} />
          <h1 className="font-serif text-2xl font-bold text-foreground">
             {scopeFilter === "global" ? "Global Leaderboard" : "Personal Records"}
          </h1>
        </div>

        {modeFilter === "daily" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 flex items-center gap-3"
          >
            <CalendarDays className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-amber-300">Daily Challenge</div>
              <div className="text-xs text-muted-foreground">
                {scopeFilter === "global" ? "Everyone drafts the same pool today — " : "Your previous daily records. Today is "}
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {modeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setModeFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                modeFilter === tab.key
                  ? tab.activeClass
                  : "text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground text-sm animate-pulse">Loading scores…</div>
          </div>
        ) : error && scopeFilter === "global" ? (
          <div className="text-center py-20">
            <div className="text-red-400 text-sm mb-3">{error}</div>
            <button onClick={() => window.location.reload()} className="text-sm text-primary hover:underline">
              Try again
            </button>
          </div>
        ) : entriesToDisplay.length === 0 ? (
          <div className="text-center py-20">
            {scopeFilter === "global" ? <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" /> : <User className="w-12 h-12 mx-auto mb-3 opacity-20" />}
            <p className="text-muted-foreground text-sm">
              {modeFilter === "daily"
                ? `No daily scores yet — be the first today!`
                : `No scores yet. Play a game to record a score!`}
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/40 text-sm font-semibold hover:bg-primary/30 transition-colors"
            >
              Play Now
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {entriesToDisplay.map((entry, i) => (
              <LeaderboardRow key={"id" in entry ? entry.id : `${entry.timestamp}-${i}`} rank={i + 1} entry={entry} isPersonal={scopeFilter === "personal"} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
