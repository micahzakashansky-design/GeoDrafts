import { useState, useCallback, useRef, useEffect } from "react";
import {
  Shield,
  TrendingUp,
  Palette,
  Heart,
  Globe,
  Landmark,
  Sun,
  Cpu,
  Map,
  Users,
  BookOpen,
  Building,
  ChevronRight,
  Download,
  RotateCcw,
  Trophy,
  Star,
  Zap,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  COUNTRIES,
  CATEGORIES,
  getCategoryKey,
  shuffleArray,
  type Country,
  type Category,
} from "@/data/countries";

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
  History: <BookOpen className="w-4 h-4" />,
  "Cities/Landmarks": <Landmark className="w-4 h-4" />,
};

type GameState = {
  pool: Country[];
  currentCountry: Country | null;
  roster: Partial<Record<Category, Country>>;
  gameOver: boolean;
};

function loadGameState(): GameState | null {
  try {
    const saved = localStorage.getItem("countryDraftState");
    if (saved) return JSON.parse(saved) as GameState;
  } catch {
    // ignore
  }
  return null;
}

function saveGameState(state: GameState) {
  try {
    localStorage.setItem("countryDraftState", JSON.stringify(state));
  } catch {
    // ignore
  }
}

function freshGame(): GameState {
  const pool = shuffleArray(COUNTRIES);
  return {
    pool: pool.slice(1),
    currentCountry: pool[0],
    roster: {},
    gameOver: false,
  };
}

function getScoreColor(score: number): string {
  if (score >= 9) return "text-emerald-400";
  if (score >= 7) return "text-green-400";
  if (score >= 5) return "text-yellow-400";
  if (score >= 3) return "text-orange-400";
  return "text-red-400";
}

function getScoreBarColor(score: number): string {
  if (score >= 9) return "bg-emerald-500";
  if (score >= 7) return "bg-green-500";
  if (score >= 5) return "bg-yellow-500";
  if (score >= 3) return "bg-orange-500";
  return "bg-red-500";
}

function getRating(total: number): { label: string; color: string; icon: React.ReactNode } {
  if (total >= 100) return { label: "Superpower", color: "text-yellow-400", icon: <Trophy className="w-5 h-5" /> };
  if (total >= 85) return { label: "Major Power", color: "text-blue-400", icon: <Star className="w-5 h-5" /> };
  if (total >= 70) return { label: "Regional Power", color: "text-green-400", icon: <Zap className="w-5 h-5" /> };
  if (total >= 55) return { label: "Developing Nation", color: "text-orange-400", icon: <Globe className="w-5 h-5" /> };
  return { label: "Struggling State", color: "text-red-400", icon: <Shield className="w-5 h-5" /> };
}

export default function Game() {
  const [state, setState] = useState<GameState>(() => {
    return loadGameState() || freshGame();
  });
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [lastAssigned, setLastAssigned] = useState<Category | null>(null);
  const rosterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const assignCountry = useCallback(
    (category: Category) => {
      if (!state.currentCountry) return;
      if (state.roster[category]) return;

      const newRoster = { ...state.roster, [category]: state.currentCountry };
      const allFilled = CATEGORIES.every((c) => newRoster[c]);
      const nextCountry = state.pool[0] ?? null;
      const newPool = state.pool.slice(1);

      setLastAssigned(category);
      setTimeout(() => setLastAssigned(null), 600);

      setState({
        pool: newPool,
        currentCountry: allFilled ? null : nextCountry,
        roster: newRoster,
        gameOver: allFilled,
      });
    },
    [state]
  );

  const resetGame = useCallback(() => {
    localStorage.removeItem("countryDraftState");
    setState(freshGame());
    setHoveredCategory(null);
  }, []);

  const downloadPng = useCallback(async () => {
    if (!rosterRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(rosterRef.current, {
      backgroundColor: "#0a0f1e",
      scale: 2,
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = "my-ideal-country.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const filledCount = CATEGORIES.filter((c) => state.roster[c]).length;
  const totalScore = CATEGORIES.reduce((sum, cat) => {
    const country = state.roster[cat];
    if (!country) return sum;
    return sum + country.stats[getCategoryKey(cat)].score;
  }, 0);

  const currentStats = state.currentCountry ? state.currentCountry.stats : null;

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="game-container">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            <span className="font-serif text-xl font-bold text-foreground tracking-tight">
              Country Draft
            </span>
          </div>
          <span className="text-muted-foreground text-sm hidden sm:block">
            Build the ideal nation
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">{filledCount}</span>
            <span className="text-muted-foreground">/12 slots filled</span>
          </div>
          <button
            data-testid="button-reset"
            onClick={resetGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Draft
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Category Slots */}
        <div className="w-72 shrink-0 border-r border-border flex flex-col bg-card/30 overflow-y-auto">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your Nation's Roster
            </h2>
          </div>
          <div className="flex-1 p-3 space-y-1.5">
            {CATEGORIES.map((category) => {
              const assigned = state.roster[category];
              const catKey = getCategoryKey(category);
              const isHovered = hoveredCategory === category;
              const isAssignable = !assigned && !!state.currentCountry && !state.gameOver;
              const score = assigned ? assigned.stats[catKey].score : null;
              const isLastAssigned = lastAssigned === category;

              return (
                <motion.button
                  key={category}
                  data-testid={`slot-${category.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => isAssignable && assignCountry(category)}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  disabled={!!assigned || !state.currentCountry || state.gameOver}
                  className={`w-full rounded-lg border text-left transition-all duration-200 ${
                    assigned
                      ? `border-border/50 bg-card/60 ${isLastAssigned ? "slot-fill" : ""}`
                      : isAssignable
                      ? "border-primary/30 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/60 cursor-pointer pulse-gold"
                      : "border-border/30 bg-card/20 cursor-default"
                  }`}
                  whileTap={isAssignable ? { scale: 0.97 } : {}}
                >
                  <div className="px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`${
                            assigned
                              ? "text-primary"
                              : isHovered && isAssignable
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {CATEGORY_ICONS[category]}
                        </span>
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            assigned ? "text-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {category}
                        </span>
                      </div>
                      {assigned && score !== null && (
                        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                          {score}/10
                        </span>
                      )}
                    </div>

                    {assigned ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl leading-none">{assigned.flag}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">
                            {assigned.name}
                          </div>
                          {score !== null && (
                            <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden w-full">
                              <div
                                className={`h-full rounded-full score-bar-fill ${getScoreBarColor(score)}`}
                                style={{ width: `${(score / 10) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                      </div>
                    ) : isAssignable ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <ChevronRight className="w-3 h-3 text-primary/60" />
                        <span className="text-xs text-primary/70">
                          {isHovered
                            ? `Assign ${state.currentCountry?.name}`
                            : "Click to assign current country"}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground/40 mt-1">Empty</div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Center: Country Card or Game Over */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {state.gameOver ? (
            <GameOver
              roster={state.roster}
              totalScore={totalScore}
              onReset={resetGame}
              onDownload={downloadPng}
              rosterRef={rosterRef}
            />
          ) : state.currentCountry ? (
            <CountryCard
              country={state.currentCountry}
              hoveredCategory={hoveredCategory}
              poolRemaining={state.pool.length}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No more countries available.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Stats panel for hovered category */}
        <AnimatePresence>
          {hoveredCategory && currentStats && !state.roster[hoveredCategory] && (
            <motion.div
              key="stats-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-64 shrink-0 border-l border-border bg-card/30 flex flex-col overflow-y-auto"
            >
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-primary">{CATEGORY_ICONS[hoveredCategory]}</span>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {hoveredCategory} Preview
                  </h3>
                </div>
              </div>
              <div className="p-4">
                {state.currentCountry && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-3xl">{state.currentCountry.flag}</span>
                      <div>
                        <div className="font-semibold text-foreground">{state.currentCountry.name}</div>
                        <div className="text-xs text-muted-foreground">{state.currentCountry.region}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Score</span>
                        <span className={`text-2xl font-bold ${getScoreColor(currentStats[getCategoryKey(hoveredCategory)].score)}`}>
                          {currentStats[getCategoryKey(hoveredCategory)].score}/10
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full score-bar-fill ${getScoreBarColor(currentStats[getCategoryKey(hoveredCategory)].score)}`}
                          style={{ width: `${(currentStats[getCategoryKey(hoveredCategory)].score / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {currentStats[getCategoryKey(hoveredCategory)].description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CountryCard({
  country,
  hoveredCategory,
  poolRemaining,
}: {
  country: Country;
  hoveredCategory: Category | null;
  poolRemaining: number;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={country.name}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        className="p-6 flex flex-col gap-6"
        data-testid="country-card"
      >
        {/* Country Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-border">
          <div className="text-6xl leading-none">{country.flag}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="font-serif text-3xl font-bold text-foreground">{country.name}</h1>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                  country.tier === "first"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary text-muted-foreground border border-border"
                }`}
              >
                {country.tier === "first" ? "1st World" : "2nd World"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
              <span>{country.capital}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>{country.region}</span>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed max-w-xl">{country.knownFor}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pool</div>
            <div className="text-2xl font-bold text-foreground">{poolRemaining}</div>
            <div className="text-xs text-muted-foreground">remaining</div>
          </div>
        </div>

        {/* Instruction */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5 flex items-center gap-3">
          <ChevronRight className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm text-foreground/80">
            <span className="text-primary font-semibold">Hover a category slot</span> on the left to preview this country's score, then click to assign it.
          </p>
        </div>

        {/* All Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {CATEGORIES.map((category) => {
            const catKey = getCategoryKey(category);
            const stat = country.stats[catKey];
            const isHighlighted = hoveredCategory === category;

            return (
              <motion.div
                key={category}
                animate={{
                  borderColor: isHighlighted ? "hsl(43 90% 55% / 0.6)" : "hsl(217 30% 18%)",
                  backgroundColor: isHighlighted ? "hsl(43 90% 55% / 0.05)" : "hsl(222 40% 10%)",
                }}
                transition={{ duration: 0.15 }}
                className={`rounded-lg border p-3 ${isHighlighted ? "ring-1 ring-primary/30" : ""}`}
                data-testid={`stat-${catKey}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`${isHighlighted ? "text-primary" : "text-muted-foreground"}`}>
                      {CATEGORY_ICONS[category]}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {category}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(stat.score)}`}>
                    {stat.score}
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full score-bar-fill ${getScoreBarColor(stat.score)}`}
                    style={{ width: `${(stat.score / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function GameOver({
  roster,
  totalScore,
  onReset,
  onDownload,
  rosterRef,
}: {
  roster: Partial<Record<Category, Country>>;
  totalScore: number;
  onReset: () => void;
  onDownload: () => void;
  rosterRef: React.RefObject<HTMLDivElement>;
}) {
  const rating = getRating(totalScore);

  return (
    <div className="flex-1 flex flex-col p-6 gap-6" data-testid="game-over-screen">
      {/* Header */}
      <div className="text-center pb-4 border-b border-border">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={rating.color}>{rating.icon}</span>
            <h1 className="font-serif text-3xl font-bold text-foreground">Draft Complete</h1>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{totalScore}</div>
              <div className="text-sm text-muted-foreground">/ 120 total</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className={`text-xl font-bold ${rating.color}`}>{rating.label}</div>
              <div className="text-sm text-muted-foreground">Your nation's ranking</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <button
          data-testid="button-download"
          onClick={onDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg"
        >
          <Download className="w-4 h-4" />
          Download as PNG
        </button>
        <button
          data-testid="button-new-draft"
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground rounded-lg font-semibold text-sm hover:bg-secondary/70 transition-colors border border-border"
        >
          <RotateCcw className="w-4 h-4" />
          New Draft
        </button>
      </div>

      {/* Final Roster for PNG export */}
      <div ref={rosterRef} className="rounded-xl overflow-hidden border border-border bg-background">
        {/* PNG Header */}
        <div className="bg-card px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-serif text-lg font-bold text-foreground">Country Draft — My Ideal Nation</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Score:</span>
            <span className="font-bold text-primary text-lg">{totalScore}/120</span>
            <span className={`font-semibold ${rating.color}`}>{rating.label}</span>
          </div>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-px bg-border">
          {CATEGORIES.map((category) => {
            const country = roster[category];
            const catKey = getCategoryKey(category);
            const score = country ? country.stats[catKey].score : null;

            return (
              <div key={category} className="bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{CATEGORY_ICONS[category]}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {category}
                    </span>
                  </div>
                  {score !== null && (
                    <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}/10</span>
                  )}
                </div>
                {country && score !== null ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground text-sm">{country.name}</div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${getScoreBarColor(score)}`}
                          style={{ width: `${(score / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                        {country.stats[catKey].description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground/40 italic">Not assigned</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
