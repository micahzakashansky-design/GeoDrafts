import { useState } from "react";
import { useLocation } from "wouter";
import { Globe, Trophy, BookOpen, Shield, TrendingUp, Palette, Heart, Sun, Cpu, Map, Users, BookOpen as BookIcon, GraduationCap, MapPin, Mountain, Camera, Building, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES, CATEGORIES, getCategoryKey, type Category } from "@/data/countries";
import { useTheme } from "@/lib/theme-context";

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

const SCORING_TIERS = [
  { label: "★★★ Three-star categories", example: "Military, Economy, Government", max: "15 pts max", weight: "1.5×", color: "text-yellow-400" },
  { label: "★★ Two-star categories", example: "Healthcare, Technology, Education, Location, Natural Resources, International Relationships", max: "12 pts max", weight: "1.2×", color: "text-yellow-400/70" },
  { label: "★ One-star categories", example: "Culture, Climate, History, Tourism", max: "10 pts max", weight: "1.0×", color: "text-yellow-400/40" },
  { label: "💡 Size + Population bonus", example: "Based on density fit with Climate, Tech & Economy", max: "Up to +25 pts", weight: "Formula", color: "text-blue-400" },
];

const NATION_RANKS = [
  { label: "Superpower", range: "148+ pts", color: "text-yellow-400" },
  { label: "Major Power", range: "120–147 pts", color: "text-blue-400" },
  { label: "Regional Power", range: "95–119 pts", color: "text-green-400" },
  { label: "Developing Nation", range: "72–94 pts", color: "text-orange-400" },
  { label: "Struggling State", range: "< 72 pts", color: "text-red-400" },
];

function getTop3ForCategory(category: Category) {
  const catKey = getCategoryKey(category);
  const bonusCategories = ["Size", "Population"];
  if (bonusCategories.includes(category)) {
    return [...COUNTRIES].sort((a, b) => b.stats[catKey].score - a.stats[catKey].score).slice(0, 3);
  }
  return [...COUNTRIES].sort((a, b) => b.stats[catKey].score - a.stats[catKey].score).slice(0, 3);
}

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
            <BookOpen className="w-5 h-5 text-primary" />
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
                      <span className="text-primary/70">{CATEGORY_ICONS[cat]}</span>
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
                                    <span className="text-xs font-bold text-primary/60">#{i+1}</span>
                                    <span className="text-lg leading-none">{country.flag}</span>
                                  </div>
                                  <div className="text-xs font-semibold text-foreground truncate">{country.name}</div>
                                  <div className="text-xs text-emerald-400 font-bold">{stat.score}/10</div>
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
                          <span className="text-xs font-bold text-primary">{tier.max}</span>
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
                    { label: "World-Class", range: "9–10", color: "text-emerald-400" },
                    { label: "Strong", range: "7–8", color: "text-green-400" },
                    { label: "Moderate", range: "5–6", color: "text-yellow-400" },
                    { label: "Weak", range: "3–4", color: "text-orange-400" },
                    { label: "Critical", range: "1–2", color: "text-red-400" },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                      <span className={`text-sm font-semibold ${r.color}`}>{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.range}/10</span>
                    </div>
                  ))}
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

export default function Home() {
  const [, navigate] = useLocation();
  const [showGuidebook, setShowGuidebook] = useState(false);
  const { isLight, toggleTheme } = useTheme();

  function startGame(hardMode: boolean) {
    localStorage.setItem("countryDraftHardMode", String(hardMode));
    localStorage.removeItem("countryDraftState_v3");
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
          title={isLight ? "Switch to dark mode" : "Switch to light mode"}
        >
          {isLight ? "🌙 Dark" : "☀️ Light"}
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-center max-w-xl"
        >
          <div className="text-7xl mb-6">🌍</div>
          <h1 className="font-serif text-5xl font-bold text-foreground mb-3 tracking-tight">GeoDrafts</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Draft random countries one-by-one and build the ideal nation.
          </p>
          <p className="text-sm text-muted-foreground/70 mb-10">
            Assign each country to one of 15 category slots — Military, Economy, Culture, and more.
            Score points based on each country's real-world stats.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startGame(false)}
              className="flex flex-col items-center gap-2 px-6 py-5 rounded-xl bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-colors font-semibold"
            >
              <Globe className="w-7 h-7" />
              <span className="text-lg">Easy Mode</span>
              <span className="text-xs font-normal text-primary/70">See ratings & get hints</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startGame(true)}
              className="flex flex-col items-center gap-2 px-6 py-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors font-semibold"
            >
              <Shield className="w-7 h-7" />
              <span className="text-lg">Hard Mode</span>
              <span className="text-xs font-normal text-red-400/70">No ratings or hints</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/leaderboard")}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-card border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-sm"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              View Leaderboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGuidebook(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-card border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-sm"
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
