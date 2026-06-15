import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Trophy, ChevronDown, ArrowLeft, Globe, CalendarDays, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { getTopScores, type LeaderboardEntry } from "@/lib/firestore";

function LeaderboardRow({ rank, entry }: { rank: number; entry: LeaderboardEntry }) {
  const [expanded, setExpanded] = useState(false);
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  const rankColor =
    rank === 1 ? "text-yellow-400" : rank === 2 ? "text-slate-300" : rank === 3 ? "text-amber-600" : "text-muted-foreground";
  const date = entry.createdAt
    ? new Date(entry.createdAt.toMillis()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : entry.date ?? "";
  const isDaily = entry.mode === "daily";

  return (
    <div className="rounded-lg border border-border/60 bg-card/30 overflow-hidden transition-colors">
      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`text-sm font-bold w-6 text-center shrink-0 ${rankColor}`}>
          {medal ?? `#${rank}`}
        </span>
        <span className="font-bold text-foreground text-base flex-1">{entry.username}</span>
        <span className="text-primary font-bold text-sm">{entry.score} pts</span>
        <span
          className={`text-xs px-2 py-0.5 rounded font-semibold mr-1 ${
            isDaily
              ? "bg-amber-400/20 text-amber-400"
              : entry.mode === "hard"
              ? "bg-red-500/20 text-red-400"
              : "bg-primary/20 text-primary"
          }`}
        >
          {isDaily ? "🗓️ Daily" : entry.mode === "hard" ? "⚠️ Hard" : "Easy"}
        </span>
        <span className="text-xs text-muted-foreground mr-1 hidden sm:block">{date}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-2 border-t border-border/40 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {Object.entries(entry.roster).map(([cat, name]) => (
                <div key={cat} className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground shrink-0 truncate">{cat}:</span>
                  <span className="text-foreground font-medium truncate">{name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type ModeFilter = "all" | "easy" | "hard" | "daily";

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const { isLight, toggleTheme } = useTheme();

  const todayLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const { data: entries = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["leaderboard", modeFilter],
    queryFn: () => getTopScores(modeFilter, 10),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const error = queryError ? "Failed to load leaderboard." : null;

  const tabs: { key: ModeFilter; label: string; activeClass: string }[] = [
    { key: "all",   label: "All",                        activeClass: "bg-primary/20 text-primary border-primary/40" },
    { key: "daily", label: `🗓️ Daily · ${todayLabel}`,   activeClass: "bg-amber-400/20 text-amber-400 border-amber-400/40" },
    { key: "easy",  label: "Easy",                       activeClass: "bg-primary/20 text-primary border-primary/40" },
    { key: "hard",  label: "⚠️ Hard",                    activeClass: "bg-red-500/20 text-red-400 border-red-500/40" },
  ];

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
          <span className="text-muted-foreground text-sm hidden sm:block">Leaderboard</span>
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
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h1 className="font-serif text-2xl font-bold text-foreground">Global Leaderboard</h1>
        </div>

        {modeFilter === "daily" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 flex items-center gap-3"
          >
            <CalendarDays className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-amber-300">Daily Challenge Leaderboard</div>
              <div className="text-xs text-muted-foreground">
                Everyone drafts the same pool today —{" "}
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
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
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-400 text-sm mb-3">{error}</div>
            <button onClick={() => window.location.reload()} className="text-sm text-primary hover:underline">
              Try again
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground text-sm">
              {modeFilter === "daily"
                ? "No daily scores yet — be the first today!"
                : "No scores yet. Be the first!"}
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
            {entries.map((entry, i) => (
              <LeaderboardRow key={entry.id} rank={i + 1} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
