import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Globe, Trophy, BookOpen, Shield, TrendingUp, Palette, Heart, Sun, Cpu, Map,
  Users, BookOpen as BookIcon, GraduationCap, MapPin, Mountain, Camera,
  Building, X, ChevronRight, CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES, CATEGORIES, getCategoryKey, type Category } from "@/data/countries";
import { useTheme } from "@/lib/theme-context";

// ─── Icons ────────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  Military: <Shield className="w-4 h-4" />,
  Economy: <TrendingUp className="w-4 h-4" />,
  Culture: <Palette className="w-4 h-4" />,
  Healthcare: <Heart className="w-4 h-4" />,
  "International Relationships": <Globe className="w-4 h-4" />,
  Government: <Building className="w-4 h-4" />,
  Climate: <Sun className="w-4 h-4" />,
  Technology: <Cpu className="w-4 h-4" />,
  Size: <Map className="w-4 h-4" />,
  Population: <Users className="w-4 h-4" />,
  History: <BookIcon className="w-4 h-4" />,
  Tourism: <Camera className="w-4 h-4" />,
  Education: <GraduationCap className="w-4 h-4" />,
  Location: <MapPin className="w-4 h-4" />,
  "Natural Resources": <Mountain className="w-4 h-4" />,
};

// ─── Scoring tiers / ranks (for guidebook) ────────────────────────────────────

const SCORING_TIERS = [
  { label: "★★★ Three-star", example: "Military, Economy, Government", max: "15 pts max", weight: "1.5×", color: "text-yellow-400" },
  { label: "★★ Two-star", example: "Healthcare, Technology, Education, Natural Resources, International Relationships", max: "12 pts max", weight: "1.2×", color: "text-yellow-400/70" },
  { label: "★ One-star", example: "Culture, Climate, History, Tourism, Location", max: "10 pts max", weight: "1.0×", color: "text-yellow-400/40" },
  { label: "💡 Size + Population", example: "Bonus formula based on density fit with Climate, Tech & Economy", max: "Up to +25 pts", weight: "Formula", color: "text-blue-400" },
];

const NATION_RANKS = [
  { label: "Superpower",        range: "148+ pts",  color: "text-yellow-400" },
  { label: "Major Power",       range: "120–147 pts", color: "text-blue-400" },
  { label: "Regional Power",    range: "95–119 pts",  color: "text-green-400" },
  { label: "Developing Nation", range: "72–94 pts",   color: "text-orange-400" },
  { label: "Struggling State",  range: "< 72 pts",    color: "text-red-400" },
];

function getTop3ForCategory(category: Category) {
  const catKey = getCategoryKey(category);
  return [...COUNTRIES].sort((a, b) => b.stats[catKey].score - a.stats[catKey].score).slice(0, 3);
}

// ─── Guidebook modal ──────────────────────────────────────────────────────────

function GuidebookModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"top3" | "scoring">("top3");
  const [expandedCat, setExpandedCat] = useState<Category | null>(null);
  const nonBonusCategories = CATEGORIES.filter(c => c !== "Size" && c !== "Population");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5" />
            <span className="font-serif text-lg font-bold text-foreground">GeoDrafts Guidebook</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-border shrink-0">
          {(["top3", "scoring"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "top3" ? "🌍 Top Countries per Category" : "📊 Scoring System"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "top3" ? (
            <div className="space-y-2">
              {nonBonusCategories.map(cat => {
                const top3 = getTop3ForCategory(cat);
                const isOpen = expandedCat === cat;
                return (
                  <div key={cat} className="rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setExpandedCat(isOpen ? null : cat)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-secondary/20 transition-colors"
                    >
                      <span className="text-muted-foreground">{CATEGORY_ICONS[cat]}</span>
                      <span className="font-semibold text-sm text-foreground flex-1">{cat}</span>
                      <span className="text-xs text-muted-foreground mr-1">
                        {top3.map(c => c.flag).join(" ")}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 pt-1 border-t border-border/40 grid grid-cols-3 gap-2">
                            {top3.map((country, i) => {
                              const catKey = getCategoryKey(cat);
                              const stat = country.stats[catKey];
                              return (
                                <div key={country.name} className="bg-secondary/30 rounded-lg p-2.5">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-xs font-bold/60">#{i+1}</span>
                                    <span className="text-lg leading-none">{country.flag}</span>
                                  </div>
                                  <div className="text-xs font-semibold text-foreground truncate">{country.name}</div>
                                  <div className="text-xs text-foreground font-bold">{stat.score}/10</div>
                                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{stat.description}</p>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Category Weights</h3>
                <div className="space-y-2">
                  {SCORING_TIERS.map(tier => (
                    <div key={tier.label} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-semibold ${tier.color}`}>{tier.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{tier.weight}</span>
                          <span className="text-xs font-bold">{tier.max}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{tier.example}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Stat Ratings</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "World-Class", range: "9–10", color: "text-foreground" },
                    { label: "Strong",      range: "7–8",  color: "text-green-400" },
                    { label: "Moderate",    range: "5–6",  color: "text-yellow-400" },
                    { label: "Weak",        range: "3–4",  color: "text-orange-400" },
                    { label: "Critical",    range: "1–2",  color: "text-red-400" },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                      <span className={`text-sm font-semibold ${r.color}`}>{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.range}/10</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size + Population Bonus — detailed formula */}
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💡</span>
                  <h3 className="text-sm font-semibold text-blue-300">Size + Population Bonus — Full Formula</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Size and Population don't contribute points directly. Instead, they unlock a <span className="text-blue-300 font-semibold">density bonus</span> based on how well the two scores pair with your other slots. Max total bonus ≈ <span className="text-primary font-bold">+25 pts</span>.
                </p>

                <div className="space-y-3 text-xs font-mono">
                  <div className="bg-background/60 rounded-lg p-3 border border-border/50">
                    <div className="text-muted-foreground mb-1 font-sans font-semibold not-italic">Step 1 — Overcrowding penalty</div>
                    <div className="text-foreground">diff = size_score − population_score</div>
                    <div className="text-foreground mt-1">
                      if diff &lt; −2 → fitMult = max(0, 1.0 − (−diff − 2) × 0.4)<br />
                      if diff &gt;  6 → fitMult = max(0.3, 1.0 − (diff − 6) × 0.15)<br />
                      else            → fitMult = 1.0
                    </div>
                    <div className="text-muted-foreground mt-1 font-sans italic not-italic">
                      Best fit: size ≥ population (sweet spot: diff 0–6). Overcrowded nations (diff &lt; −2) lose up to 100% bonus. Vast empty nations (diff &gt; 6) lose up to 70%.
                    </div>
                  </div>

                  <div className="bg-background/60 rounded-lg p-3 border border-border/50">
                    <div className="text-muted-foreground mb-1 font-sans font-semibold">Step 2 — Path multipliers</div>
                    <div className="text-foreground">agFactor  = (size / 10) × (climate / 10)</div>
                    <div className="text-foreground">urbFactor = (tech / 10) × (economy / 10)</div>
                    <div className="text-muted-foreground mt-1 font-sans italic">
                      Agricultural path: big land + good climate.<br />
                      Urban path: high tech + strong economy.
                    </div>
                  </div>

                  <div className="bg-background/60 rounded-lg p-3 border border-border/50">
                    <div className="text-muted-foreground mb-1 font-sans font-semibold">Step 3 — Density bonus</div>
                    <div className="text-foreground">densityBonus = min(20, round(fitMult × max(agFactor, urbFactor) × 22))</div>
                  </div>

                  <div className="bg-background/60 rounded-lg p-3 border border-border/50">
                    <div className="text-muted-foreground mb-1 font-sans font-semibold">Step 4 — Combo bonus</div>
                    <div className="text-foreground">matchedPop = min(population, size + 2)</div>
                    <div className="text-foreground">comboBonus = min(5, round((size × matchedPop) / 20))</div>
                    <div className="text-muted-foreground mt-1 font-sans italic">
                      Rewards large, well-populated nations. Capped at +5.
                    </div>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                    <div className="text-blue-300 font-sans font-semibold mb-1">Total bonus = densityBonus + comboBonus</div>
                    <div className="text-muted-foreground font-sans italic">
                      Example: USA (size 9) + China (pop 10) with Germany (tech 9) + USA (eco 9):<br />
                      diff = −1 → fitMult ≈ 0.6; urbFactor = 0.81; densityBonus ≈ min(20, 11) = 11; comboBonus = 5 → <span className="text-primary font-bold">+16 pts</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Nation Rankings</h3>
                <div className="space-y-1.5">
                  {NATION_RANKS.map(r => (
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
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-foreground text-xs font-bold border border-emerald-500/30">
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
            Compare your score on the global leaderboard!
          </p>

          {alreadyCompleted ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{dailyResult!.score} pts</div>
                <div className="text-xs text-muted-foreground mt-0.5">Your score today</div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={playDaily}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/20 text-foreground border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors text-sm font-semibold"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  View Result
                </button>
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-muted-foreground border border-border hover:text-foreground hover:bg-secondary/70 transition-colors text-sm font-semibold"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Leaderboard
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
          <Globe className="w-6 h-6" />
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

          {/* Easy / Hard mode */}
          <div className="grid grid-cols-2 gap-3 w-full mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startGame(false)}
              className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors font-semibold"
            >
              <Globe className="w-6 h-6" />
              <span className="text-base">Easy Mode</span>
              <span className="text-xs font-normal/60">See ratings for each stat</span>
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

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/leaderboard")}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-sm"
            >
              <Trophy className="w-4 h-4" />
              View Leaderboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGuidebook(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-sm"
            >
              <BookOpen className="w-4 h-4" />
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
