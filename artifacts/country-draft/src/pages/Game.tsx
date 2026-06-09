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
  Lightbulb,
  Shuffle,
  X,
  Info,
  ArrowLeftRight,
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

// ─── Canvas PNG export ────────────────────────────────────────────────────────

const PNG_COLORS = {
  bg:       "#08111e",
  cardBg:   "#0d1a2a",
  cardBg2:  "#0f1e30",
  border:   "#1b2d40",
  gold:     "#d4a420",
  fg:       "#ccd9e8",
  fgDim:    "#8099b0",
  muted:    "#4a6278",
  barTrack: "#192736",
  scoreColors: ["#ef4444","#ef4444","#ef4444","#f97316","#f97316","#eab308","#eab308","#22c55e","#22c55e","#10b981","#10b981"],
  ratingColors: { superpower: "#facc15", major: "#60a5fa", regional: "#4ade80", developing: "#fb923c", struggling: "#f87171" },
};

function canvasRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function pngScoreBar(score: number): string {
  return PNG_COLORS.scoreColors[Math.max(0, Math.min(10, score)) - 1] ?? "#eab308";
}

function pngRatingColor(total: number): string {
  if (total >= 100) return PNG_COLORS.ratingColors.superpower;
  if (total >= 85)  return PNG_COLORS.ratingColors.major;
  if (total >= 70)  return PNG_COLORS.ratingColors.regional;
  if (total >= 55)  return PNG_COLORS.ratingColors.developing;
  return PNG_COLORS.ratingColors.struggling;
}

function pngScoreLabel(score: number): string {
  if (score >= 9) return "World-Class";
  if (score >= 7) return "Strong";
  if (score >= 5) return "Moderate";
  if (score >= 3) return "Weak";
  return "Critical";
}

function pngRatingLabel(total: number): string {
  if (total >= 100) return "Superpower";
  if (total >= 85)  return "Major Power";
  if (total >= 70)  return "Regional Power";
  if (total >= 55)  return "Developing Nation";
  return "Struggling State";
}

async function drawRosterPng(
  roster: Partial<Record<Category, Country>>,
  totalScore: number
): Promise<void> {
  const DPR    = 2;
  const W      = 1180;
  const HDR    = 80;
  const PAD    = 20;
  const GAP    = 10;
  const COLS   = 2;
  const CARD_W = (W - PAD * 3) / COLS;   // ~570
  const CARD_H = 112;
  const ROWS   = Math.ceil(CATEGORIES.length / COLS);
  const H      = HDR + PAD + ROWS * (CARD_H + GAP) - GAP + PAD;

  const canvas = document.createElement("canvas");
  canvas.width  = W  * DPR;
  canvas.height = H  * DPR;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(DPR, DPR);

  const C = PNG_COLORS;

  // ── Background ──
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // ── Header ──
  ctx.fillStyle = C.cardBg;
  ctx.fillRect(0, 0, W, HDR);
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, HDR); ctx.lineTo(W, HDR); ctx.stroke();

  ctx.fillStyle = C.gold;
  ctx.font = "bold 18px 'Georgia', serif";
  ctx.fillText("Country Draft — My Ideal Nation", PAD, 32);

  ctx.fillStyle = C.fgDim;
  ctx.font = "13px sans-serif";
  ctx.fillText("Final Roster · Score:", PAD, 60);

  ctx.fillStyle = C.gold;
  ctx.font = "bold 15px sans-serif";
  ctx.fillText(`${totalScore} / 120`, PAD + 138, 60);

  const rLabel = pngRatingLabel(totalScore);
  const rColor = pngRatingColor(totalScore);
  ctx.fillStyle = rColor;
  ctx.font = "bold 15px sans-serif";
  ctx.fillText(`· ${rLabel}`, PAD + 138 + ctx.measureText(`${totalScore} / 120`).width + 8, 60);

  // ── Cards ──
  CATEGORIES.forEach((category, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const cx  = PAD + col * (CARD_W + PAD);
    const cy  = HDR + PAD + row * (CARD_H + GAP);

    const country  = roster[category];
    const catKey   = getCategoryKey(category);
    const score    = country ? country.stats[catKey].score : null;

    // Card background
    ctx.fillStyle = C.cardBg2;
    canvasRoundRect(ctx, cx, cy, CARD_W, CARD_H, 8);
    ctx.fill();
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 1;
    canvasRoundRect(ctx, cx, cy, CARD_W, CARD_H, 8);
    ctx.stroke();

    // Category label
    ctx.fillStyle = C.muted;
    ctx.font = "bold 10px sans-serif";
    ctx.fillText(category.toUpperCase(), cx + 12, cy + 20);

    if (country && score !== null) {
      // Flag + name
      ctx.font = "22px sans-serif";
      ctx.fillText(country.flag, cx + 12, cy + 55);

      ctx.fillStyle = C.fg;
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(country.name, cx + 46, cy + 47);

      // Score bar track
      const barX = cx + 46;
      const barY = cy + 56;
      const barW = CARD_W - 58;
      const barH = 6;

      ctx.fillStyle = C.barTrack;
      canvasRoundRect(ctx, barX, barY, barW, barH, 3);
      ctx.fill();

      // Score bar fill
      ctx.fillStyle = pngScoreBar(score);
      canvasRoundRect(ctx, barX, barY, barW * (score / 10), barH, 3);
      ctx.fill();

      // Score label
      ctx.fillStyle = pngScoreBar(score);
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(pngScoreLabel(score), cx + 46, cy + 80);

      // Short description (truncated)
      const desc = country.stats[catKey].description;
      const maxDescW = CARD_W - 60;
      ctx.fillStyle = C.fgDim;
      ctx.font = "11px sans-serif";
      let truncated = desc;
      while (ctx.measureText(truncated).width > maxDescW && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
      }
      if (truncated !== desc) truncated = truncated.slice(0, -3) + "...";
      ctx.fillText(truncated, cx + 46, cy + 97);
    } else {
      ctx.fillStyle = C.muted;
      ctx.font = "italic 13px sans-serif";
      ctx.fillText("Not assigned", cx + 12, cy + 62);
    }
  });

  // ── Download ──
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-ideal-country.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

// ─── Constants & icons ──────────────────────────────────────────────────────

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

const MAX_HINTS = 5;

// ─── Types ───────────────────────────────────────────────────────────────────

type GameState = {
  pool: Country[];
  currentCountry: Country | null;
  roster: Partial<Record<Category, Country>>;
  gameOver: boolean;
  hintsRemaining: number;
  wildcardUsed: boolean;
};

type InfoModal = { category: Category; country: Country } | null;
type HintResult = { category: Category; score: number; reason: string };

// ─── Persistence ─────────────────────────────────────────────────────────────

function loadGameState(): GameState | null {
  try {
    const saved = localStorage.getItem("countryDraftState_v2");
    if (saved) return JSON.parse(saved) as GameState;
  } catch { /* ignore */ }
  return null;
}

function saveGameState(state: GameState) {
  try {
    localStorage.setItem("countryDraftState_v2", JSON.stringify(state));
  } catch { /* ignore */ }
}

function freshGame(): GameState {
  const pool = shuffleArray(COUNTRIES);
  return {
    pool: pool.slice(1),
    currentCountry: pool[0],
    roster: {},
    gameOver: false,
    hintsRemaining: MAX_HINTS,
    wildcardUsed: false,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getScoreBarColor(score: number): string {
  if (score >= 9) return "bg-emerald-500";
  if (score >= 7) return "bg-green-500";
  if (score >= 5) return "bg-yellow-500";
  if (score >= 3) return "bg-orange-500";
  return "bg-red-500";
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 9) return { label: "World-Class", color: "text-emerald-400" };
  if (score >= 7) return { label: "Strong", color: "text-green-400" };
  if (score >= 5) return { label: "Moderate", color: "text-yellow-400" };
  if (score >= 3) return { label: "Weak", color: "text-orange-400" };
  return { label: "Critical", color: "text-red-400" };
}

function getRating(total: number): { label: string; color: string; icon: React.ReactNode } {
  if (total >= 100) return { label: "Superpower", color: "text-yellow-400", icon: <Trophy className="w-5 h-5" /> };
  if (total >= 85) return { label: "Major Power", color: "text-blue-400", icon: <Star className="w-5 h-5" /> };
  if (total >= 70) return { label: "Regional Power", color: "text-green-400", icon: <Zap className="w-5 h-5" /> };
  if (total >= 55) return { label: "Developing Nation", color: "text-orange-400", icon: <Globe className="w-5 h-5" /> };
  return { label: "Struggling State", color: "text-red-400", icon: <Shield className="w-5 h-5" /> };
}

function computeHints(country: Country, roster: Partial<Record<Category, Country>>): HintResult[] {
  const empty = CATEGORIES.filter((c) => !roster[c]);
  return empty
    .map((cat) => {
      const catKey = getCategoryKey(cat);
      const stat = country.stats[catKey];
      return { category: cat, score: stat.score, reason: stat.description };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Game() {
  const [state, setState] = useState<GameState>(() => loadGameState() || freshGame());
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [lastAssigned, setLastAssigned] = useState<Category | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [hintResults, setHintResults] = useState<HintResult[]>([]);
  const [wildcardPhase, setWildcardPhase] = useState(false);
  const [infoModal, setInfoModal] = useState<InfoModal>(null);
  const rosterRef = useRef<HTMLDivElement>(null);

  useEffect(() => { saveGameState(state); }, [state]);

  // Normal assign
  const assignCountry = useCallback((category: Category) => {
    if (!state.currentCountry || state.roster[category] || state.gameOver) return;
    const newRoster = { ...state.roster, [category]: state.currentCountry };
    const allFilled = CATEGORIES.every((c) => newRoster[c]);
    const newPool = state.pool.slice(1);
    setLastAssigned(category);
    setTimeout(() => setLastAssigned(null), 600);
    setShowHints(false);
    setState((prev) => ({
      ...prev,
      pool: newPool,
      currentCountry: allFilled ? null : state.pool[0] ?? null,
      roster: newRoster,
      gameOver: allFilled,
    }));
  }, [state]);

  // Use hint
  const useHint = useCallback(() => {
    if (!state.currentCountry || state.hintsRemaining <= 0) return;
    const results = computeHints(state.currentCountry, state.roster);
    setHintResults(results);
    setShowHints(true);
    setState((prev) => ({ ...prev, hintsRemaining: prev.hintsRemaining - 1 }));
  }, [state]);

  // Enter wildcard phase
  const startWildcard = useCallback(() => {
    if (state.wildcardUsed || !state.gameOver) return;
    setWildcardPhase(true);
  }, [state]);

  // Wildcard: replace a slot
  const applyWildcard = useCallback((category: Category) => {
    if (!state.gameOver || !wildcardPhase || state.wildcardUsed) return;
    if (state.pool.length === 0) return;
    const newCountry = state.pool[0];
    const newPool = state.pool.slice(1);
    const newRoster = { ...state.roster, [category]: newCountry };
    setWildcardPhase(false);
    setLastAssigned(category);
    setTimeout(() => setLastAssigned(null), 600);
    setState((prev) => ({
      ...prev,
      pool: newPool,
      roster: newRoster,
      wildcardUsed: true,
    }));
  }, [state, wildcardPhase]);

  const resetGame = useCallback(() => {
    localStorage.removeItem("countryDraftState_v2");
    setState(freshGame());
    setHoveredCategory(null);
    setShowHints(false);
    setHintResults([]);
    setWildcardPhase(false);
    setInfoModal(null);
  }, []);

  const filledCount = CATEGORIES.filter((c) => state.roster[c]).length;
  const totalScore = CATEGORIES.reduce((sum, cat) => {
    const c = state.roster[cat];
    return c ? sum + c.stats[getCategoryKey(cat)].score : sum;
  }, 0);

  const downloadPng = useCallback(async () => {
    await drawRosterPng(state.roster, totalScore);
  }, [state.roster, totalScore]);

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="game-container">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-primary" />
          <span className="font-serif text-xl font-bold text-foreground tracking-tight">Country Draft</span>
          <span className="text-muted-foreground text-sm hidden sm:block">Build the ideal nation</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">{filledCount}</span>
            <span>/12 slots filled</span>
          </div>
          {/* Hints button */}
          {!state.gameOver && (
            <button
              data-testid="button-hint"
              onClick={useHint}
              disabled={state.hintsRemaining <= 0 || !state.currentCountry}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                state.hintsRemaining > 0 && state.currentCountry
                  ? "text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
                  : "text-muted-foreground/40 cursor-not-allowed"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Hint
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                state.hintsRemaining > 0 ? "bg-yellow-400/15 text-yellow-400" : "bg-secondary text-muted-foreground"
              }`}>
                {state.hintsRemaining}
              </span>
            </button>
          )}
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
              const isWildcardTarget = wildcardPhase && !!assigned;
              const score = assigned ? assigned.stats[catKey].score : null;
              const isLastAssigned = lastAssigned === category;

              return (
                <motion.button
                  key={category}
                  data-testid={`slot-${category.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => {
                    if (isWildcardTarget) applyWildcard(category);
                    else if (isAssignable) assignCountry(category);
                  }}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  disabled={!isAssignable && !isWildcardTarget}
                  className={`w-full rounded-lg border text-left transition-all duration-200 ${
                    isWildcardTarget
                      ? "border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-400/70 cursor-pointer"
                      : assigned
                      ? `border-border/50 bg-card/60 ${isLastAssigned ? "slot-fill" : ""}`
                      : isAssignable
                      ? "border-primary/30 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/60 cursor-pointer pulse-gold"
                      : "border-border/30 bg-card/20 cursor-default"
                  }`}
                  whileTap={isAssignable || isWildcardTarget ? { scale: 0.97 } : {}}
                >
                  <div className="px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`${
                          isWildcardTarget ? "text-blue-400"
                          : assigned ? "text-primary"
                          : isHovered && isAssignable ? "text-primary"
                          : "text-muted-foreground"
                        }`}>
                          {CATEGORY_ICONS[category]}
                        </span>
                        <span className={`text-xs font-semibold uppercase tracking-wide ${
                          assigned ? "text-foreground/70" : "text-muted-foreground"
                        }`}>
                          {category}
                        </span>
                      </div>
                      {isWildcardTarget && (
                        <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      )}
                    </div>

                    {assigned ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl leading-none">{assigned.flag}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-foreground truncate">{assigned.name}</div>
                          {score !== null && (
                            <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full score-bar-fill ${getScoreBarColor(score)}`}
                                style={{ width: `${(score / 10) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                        {isWildcardTarget ? (
                          <Shuffle className="w-3 h-3 text-blue-400 shrink-0" />
                        ) : (
                          <Lock className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                        )}
                      </div>
                    ) : isAssignable ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <ChevronRight className="w-3 h-3 text-primary/60" />
                        <span className="text-xs text-primary/70">
                          {isHovered ? `Assign ${state.currentCountry?.name}` : "Click to assign"}
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

          {/* Wildcard cancel */}
          {wildcardPhase && (
            <div className="p-3 border-t border-border">
              <button
                onClick={() => setWildcardPhase(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel Wildcard
              </button>
            </div>
          )}
        </div>

        {/* Center: Country Card or Game Over */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Hints panel */}
          <AnimatePresence>
            {showHints && hintResults.length > 0 && !state.gameOver && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-6 mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-yellow-500/20">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-400">
                      Top 3 Recommended Categories
                    </span>
                  </div>
                  <button
                    onClick={() => setShowHints(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3 grid grid-cols-3 gap-3">
                  {hintResults.map(({ category, score, reason }, i) => {
                    const { label, color } = getScoreLabel(score);
                    return (
                      <div key={category} className="rounded-lg bg-card border border-border p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-yellow-400/70 text-xs font-bold">#{i + 1}</span>
                          <span className="text-primary/70">{CATEGORY_ICONS[category]}</span>
                          <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">{category}</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-1.5">
                          <div className={`h-full rounded-full ${getScoreBarColor(score)}`} style={{ width: `${score * 10}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${color}`}>{label}</span>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{reason}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wildcard banner */}
          <AnimatePresence>
            {wildcardPhase && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-6 mt-4 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 flex items-center gap-3"
              >
                <Shuffle className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-blue-300">Wildcard Active</div>
                  <div className="text-xs text-blue-400/70">
                    Select any filled slot on the left to replace it with a random country from the remaining pool.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {state.gameOver ? (
            <GameOver
              roster={state.roster}
              totalScore={totalScore}
              onReset={resetGame}
              onDownload={downloadPng}
              onWildcard={startWildcard}
              wildcardUsed={state.wildcardUsed}
              wildcardPhase={wildcardPhase}
              rosterRef={rosterRef}
              onInfoClick={(cat, country) => setInfoModal({ category: cat, country })}
            />
          ) : state.currentCountry ? (
            <CountryCard
              country={state.currentCountry}
              hoveredCategory={hoveredCategory}
              poolRemaining={state.pool.length}
              onInfoClick={(cat) => state.currentCountry && setInfoModal({ category: cat, country: state.currentCountry })}
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
          {hoveredCategory && state.currentCountry && !state.roster[hoveredCategory] && !state.gameOver && (
            <motion.div
              key="stats-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-60 shrink-0 border-l border-border bg-card/30 flex flex-col overflow-y-auto"
            >
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <span className="text-primary">{CATEGORY_ICONS[hoveredCategory]}</span>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {hoveredCategory}
                </h3>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">{state.currentCountry.flag}</span>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{state.currentCountry.name}</div>
                    <div className="text-xs text-muted-foreground">{state.currentCountry.region}</div>
                  </div>
                </div>
                {(() => {
                  const stat = state.currentCountry.stats[getCategoryKey(hoveredCategory)];
                  const { label, color } = getScoreLabel(stat.score);
                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Rating</span>
                        <span className={`text-sm font-bold ${color}`}>{label}</span>
                      </div>
                      <div className="h-2.5 bg-secondary rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full score-bar-fill ${getScoreBarColor(stat.score)}`}
                          style={{ width: `${stat.score * 10}%` }}
                        />
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{stat.description}</p>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info modal */}
      <AnimatePresence>
        {infoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setInfoModal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{infoModal.country.flag}</span>
                  <div>
                    <div className="font-serif font-bold text-foreground text-lg">{infoModal.country.name}</div>
                    <div className="text-xs text-muted-foreground">{infoModal.country.capital} · {infoModal.country.region}</div>
                  </div>
                </div>
                <button
                  onClick={() => setInfoModal(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Category info */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-primary">{CATEGORY_ICONS[infoModal.category]}</span>
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {infoModal.category}
                  </span>
                </div>

                {(() => {
                  const stat = infoModal.country.stats[getCategoryKey(infoModal.category)];
                  const { label, color } = getScoreLabel(stat.score);
                  return (
                    <>
                      {/* Rating + bar */}
                      <div className="bg-secondary/50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Overall Rating</span>
                          <span className={`text-lg font-bold ${color}`}>{label}</span>
                        </div>
                        <div className="h-3 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.score * 10}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`h-full rounded-full ${getScoreBarColor(stat.score)}`}
                          />
                        </div>
                        <div className="flex justify-between mt-1.5 text-xs text-muted-foreground/60">
                          <span>Critical</span>
                          <span>World-Class</span>
                        </div>
                      </div>

                      {/* Full description */}
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Analysis
                        </div>
                        <p className="text-sm text-foreground/85 leading-relaxed">{stat.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CountryCard ──────────────────────────────────────────────────────────────

function CountryCard({
  country,
  hoveredCategory,
  poolRemaining,
  onInfoClick,
}: {
  country: Country;
  hoveredCategory: Category | null;
  poolRemaining: number;
  onInfoClick: (cat: Category) => void;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={country.name}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        className="p-6 flex flex-col gap-5"
        data-testid="country-card"
      >
        {/* Country Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-border">
          <div className="text-6xl leading-none">{country.flag}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="font-serif text-3xl font-bold text-foreground">{country.name}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                country.tier === "first"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-secondary text-muted-foreground border border-border"
              }`}>
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
            <span className="text-primary font-semibold">Hover a slot</span> on the left to preview this country's rating, then click to assign. Click{" "}
            <span className="inline-flex items-center gap-0.5 text-muted-foreground">
              <Info className="w-3 h-3" />
            </span>{" "}
            on any stat for full details.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {CATEGORIES.map((category) => {
            const catKey = getCategoryKey(category);
            const stat = country.stats[catKey];
            const isHighlighted = hoveredCategory === category;
            const { label, color } = getScoreLabel(stat.score);

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
                  <div className="flex items-center gap-1.5">
                    <span className={isHighlighted ? "text-primary" : "text-muted-foreground"}>
                      {CATEGORY_ICONS[category]}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {category}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onInfoClick(category); }}
                    className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground/60 hover:text-primary hover:border-primary/50 transition-colors shrink-0"
                    title={`Details for ${category}`}
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full score-bar-fill ${getScoreBarColor(stat.score)}`}
                    style={{ width: `${stat.score * 10}%` }}
                  />
                </div>
                <div className={`text-xs font-semibold mb-1 ${color}`}>{label}</div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{stat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── GameOver ─────────────────────────────────────────────────────────────────

function GameOver({
  roster,
  totalScore,
  onReset,
  onDownload,
  onWildcard,
  wildcardUsed,
  wildcardPhase,
  rosterRef,
  onInfoClick,
}: {
  roster: Partial<Record<Category, Country>>;
  totalScore: number;
  onReset: () => void;
  onDownload: () => void;
  onWildcard: () => void;
  wildcardUsed: boolean;
  wildcardPhase: boolean;
  rosterRef: React.RefObject<HTMLDivElement>;
  onInfoClick: (cat: Category, country: Country) => void;
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
      <div className="flex justify-center gap-3 flex-wrap">
        <button
          data-testid="button-download"
          onClick={onDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg"
        >
          <Download className="w-4 h-4" />
          Download as PNG
        </button>
        {!wildcardUsed && !wildcardPhase && (
          <button
            data-testid="button-wildcard"
            onClick={onWildcard}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/20 text-blue-300 border border-blue-500/40 rounded-lg font-semibold text-sm hover:bg-blue-600/30 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            Use Wildcard
          </button>
        )}
        {wildcardUsed && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg text-xs text-muted-foreground border border-border">
            <Shuffle className="w-3.5 h-3.5" />
            Wildcard used
          </div>
        )}
        <button
          data-testid="button-new-draft"
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground rounded-lg font-semibold text-sm hover:bg-secondary/70 transition-colors border border-border"
        >
          <RotateCcw className="w-4 h-4" />
          New Draft
        </button>
      </div>

      {/* Final Roster */}
      <div ref={rosterRef} className="rounded-xl overflow-hidden border border-border bg-background">
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
        <div className="grid grid-cols-2 gap-px bg-border">
          {CATEGORIES.map((category) => {
            const country = roster[category];
            const catKey = getCategoryKey(category);
            const score = country ? country.stats[catKey].score : null;
            const scoreInfo = score !== null ? getScoreLabel(score) : null;

            return (
              <div key={category} className="bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{CATEGORY_ICONS[category]}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {category}
                    </span>
                  </div>
                  {country && (
                    <button
                      onClick={() => country && onInfoClick(category, country)}
                      className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground/60 hover:text-primary hover:border-primary/50 transition-colors"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {country && score !== null && scoreInfo ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground text-sm">{country.name}</div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1 mb-1">
                        <div
                          className={`h-full rounded-full ${getScoreBarColor(score)}`}
                          style={{ width: `${(score / 10) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${scoreInfo.color}`}>{scoreInfo.label}</span>
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
