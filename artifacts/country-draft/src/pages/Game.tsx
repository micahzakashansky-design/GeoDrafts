import { useState, useCallback, useRef, useEffect } from "react";
import {
  Plus, Shield, TrendingUp, Palette, Heart, Globe, Sun, Cpu, Map, Users,
  BookOpen, Building, ChevronRight, ChevronDown, ChevronUp, Download, RotateCcw, Trophy,
  Star, Zap, Lock, Shuffle, X, ArrowLeftRight, List, Medal,
  GraduationCap, MapPin, Mountain, Camera, Home as HomeIcon, Moon, Send,
  CalendarDays, LogIn,
} from "lucide-react";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { saveScore } from "@/lib/firestore";
import { UsernamePrompt } from "@/components/UsernamePrompt";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import { useTheme } from "@/lib/theme-context";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─── Canvas PNG export ────────────────────────────────────────────────────────

const PNG_COLORS = {
  bg: "#08111e", cardBg: "#0d1a2a", cardBg2: "#0f1e30", border: "#1b2d40",
  gold: "#d4a420", fg: "#ccd9e8", fgDim: "#8099b0", muted: "#4a6278",
  scoreColors: ["#ef4444","#ef4444","#ef4444","#f97316","#f97316","#eab308","#eab308","#22c55e","#22c55e","#10b981","#10b981"],
  ratingColors: { superpower: "#facc15", major: "#60a5fa", regional: "#4ade80", developing: "#fb923c", struggling: "#f87171" },
};

function canvasRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
}

function pngScoreBar(score: number): string {
  return PNG_COLORS.scoreColors[Math.max(0, Math.min(10, score)) - 1] ?? "#eab308";
}
function pngRatingColor(total: number): string {
  if (total >= 148) return PNG_COLORS.ratingColors.superpower;
  if (total >= 120) return PNG_COLORS.ratingColors.major;
  if (total >= 95)  return PNG_COLORS.ratingColors.regional;
  if (total >= 72)  return PNG_COLORS.ratingColors.developing;
  return PNG_COLORS.ratingColors.struggling;
}
function pngScoreLabel(score: number): string {
  if (score >= 9) return "World-Class"; if (score >= 7) return "Strong";
  if (score >= 5) return "Moderate"; if (score >= 3) return "Weak"; return "Critical";
}
function pngRatingLabel(total: number): string {
  if (total >= 148) return "Superpower"; if (total >= 120) return "Major Power";
  if (total >= 95) return "Regional Power"; if (total >= 72) return "Developing Nation";
  return "Struggling State";
}

async function drawRosterPng(roster: Partial<Record<Category, Country>>, totalScore: number, bonus: number): Promise<void> {
  const DPR = 2, W = 1180, HDR = 88, PAD = 20, GAP = 10, COLS = 2;
  const CARD_W = (W - PAD * 3) / COLS;
  const CARD_H = 112;
  const ROWS = Math.ceil(CATEGORIES.length / COLS);
  const H = HDR + PAD + ROWS * (CARD_H + GAP) - GAP + PAD;
  const canvas = document.createElement("canvas");
  canvas.width = W * DPR; canvas.height = H * DPR;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(DPR, DPR);
  const C = PNG_COLORS;

  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.cardBg; ctx.fillRect(0, 0, W, HDR);
  ctx.strokeStyle = C.border; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, HDR); ctx.lineTo(W, HDR); ctx.stroke();

  ctx.fillStyle = C.gold; ctx.font = "bold 18px 'Georgia', serif";
  ctx.fillText("GeoDrafts — My Ideal Nation", PAD, 30);
  ctx.fillStyle = C.fgDim; ctx.font = "13px sans-serif";
  ctx.fillText("Final Roster · Score:", PAD, 56);
  ctx.fillStyle = C.gold; ctx.font = "bold 15px sans-serif";
  const scoreStr = `${totalScore}`;
  ctx.fillText(scoreStr, PAD + 148, 56);
  const rLabel = pngRatingLabel(totalScore);
  const rColor = pngRatingColor(totalScore);
  ctx.fillStyle = rColor; ctx.font = "bold 15px sans-serif";
  ctx.fillText(`· ${rLabel}`, PAD + 148 + ctx.measureText(scoreStr).width + 8, 56);
  if (bonus > 0) {
    ctx.fillStyle = C.fgDim; ctx.font = "12px sans-serif";
    ctx.fillText(`(incl. +${bonus} size/population bonus)`, PAD, 76);
  }

  CATEGORIES.forEach((category, i) => {
    const col = i % COLS; const row = Math.floor(i / COLS);
    const cx = PAD + col * (CARD_W + PAD); const cy = HDR + PAD + row * (CARD_H + GAP);
    const country = roster[category];
    const catKey = getCategoryKey(category);
    const isBonus = category === "Size" || category === "Population";
    const score = country && !isBonus ? country.stats[catKey].score : null;

    ctx.fillStyle = C.cardBg2; canvasRoundRect(ctx, cx, cy, CARD_W, CARD_H, 8); ctx.fill();
    ctx.strokeStyle = C.border; ctx.lineWidth = 1; canvasRoundRect(ctx, cx, cy, CARD_W, CARD_H, 8); ctx.stroke();
    ctx.fillStyle = C.muted; ctx.font = "bold 10px sans-serif";
    ctx.fillText(category.toUpperCase() + (isBonus ? " (BONUS)" : ""), cx + 12, cy + 20);

    if (country) {
      ctx.font = "22px sans-serif"; ctx.fillText(country.flag, cx + 12, cy + 55);
      ctx.fillStyle = C.fg; ctx.font = "bold 14px sans-serif"; ctx.fillText(country.name, cx + 46, cy + 47);
      if (score !== null) {
        const barX = cx + 46, barY = cy + 56, barW = CARD_W - 58, barH = 6;
        ctx.fillStyle = "#192736"; canvasRoundRect(ctx, barX, barY, barW, barH, 3); ctx.fill();
        ctx.fillStyle = pngScoreBar(score); canvasRoundRect(ctx, barX, barY, barW * (score / 10), barH, 3); ctx.fill();
        ctx.fillStyle = pngScoreBar(score); ctx.font = "bold 11px sans-serif"; ctx.fillText(pngScoreLabel(score), cx + 46, cy + 80);
        const desc = country.stats[catKey].description;
        const maxDescW = CARD_W - 60;
        ctx.fillStyle = C.fgDim; ctx.font = "11px sans-serif";
        let trunc = desc;
        while (ctx.measureText(trunc).width > maxDescW && trunc.length > 0) trunc = trunc.slice(0, -1);
        if (trunc !== desc) trunc = trunc.slice(0, -3) + "...";
        ctx.fillText(trunc, cx + 46, cy + 97);
      } else {
        ctx.fillStyle = C.gold; ctx.font = "bold 11px sans-serif"; ctx.fillText("Bonus Contributor", cx + 46, cy + 70);
      }
    } else {
      ctx.fillStyle = C.muted; ctx.font = "italic 13px sans-serif"; ctx.fillText("Not assigned", cx + 12, cy + 62);
    }
  });

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "geodrafts-nation.png";
    a.click(); URL.revokeObjectURL(url);
  }, "image/png");
}

// ─── Seeded shuffle for daily challenge ──────────────────────────────────────

function seededRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) | 0;
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) | 0;
    s = (s ^ (s >>> 16)) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = seededRng(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function dateStrToSeed(dateStr: string): number {
  let hash = 5381;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) + hash) ^ dateStr.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Constants & icons ────────────────────────────────────────────────────────

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
  Tourism: <Camera className="w-4 h-4" />,
  Education: <GraduationCap className="w-4 h-4" />,
  Location: <MapPin className="w-4 h-4" />,
  "Natural Resources": <Mountain className="w-4 h-4" />,
};

const CATEGORY_WEIGHTS: Partial<Record<Category, number>> = {
  Military: 1.5, Economy: 1.5, Government: 1.5,
  "International Relationships": 1.2, Technology: 1.2,
  Education: 1.2, "Natural Resources": 1.2, Healthcare: 1.2,
};

function getCategoryStars(cat: Category): string {
  if (cat === "Military" || cat === "Economy" || cat === "Government") return "★★★";
  if (
    cat === "International Relationships" || cat === "Technology" ||
    cat === "Education" || cat === "Natural Resources" ||
    cat === "Healthcare" || cat === "Size" || cat === "Population"
  ) return "★★";
  return "★";
}

function getPtsDisplay(score: number, cat: Category): string {
  const weight = CATEGORY_WEIGHTS[cat] ?? 1.0;
  return `${Math.round(score * weight)}/${Math.round(10 * weight)} pts`;
}

const BONUS_CATEGORIES: Category[] = ["Size", "Population"];

function ExpandableDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.offsetHeight);
    }
  }, [description]);

  return (
    <div className="relative">
      <p
        ref={textRef}
        className={`text-xs text-muted-foreground leading-relaxed ${expanded ? "" : "line-clamp-2"}`}
      >
        {description}
      </p>
      {(isTruncated || expanded) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="mt-1 flex items-center gap-0.5 text-[10px] font-bold text-primary/60 hover:text-primary transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="w-3 h-3" /> Show Less</>
          ) : (
            <><ChevronDown className="w-3 h-3" /> Show More</>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type GameState = {
  pool: Country[];
  currentCountry: Country | null;
  roster: Partial<Record<Category, Country>>;
  gameOver: boolean;
  wildcardUsed: boolean;
  isDailyMode: boolean;
  dailyDate: string;
  leaderboardSubmitted: boolean;
};


type LocalLeaderboardEntry = {
  score: number;
  date: string;
  roster: Partial<Record<string, string>>;
};

type Archetype = { title: string; emoji: string; description: string };

// ─── Storage ──────────────────────────────────────────────────────────────────

function getStateKey(isDailyMode: boolean, dailyDate: string): string {
  return isDailyMode ? `countryDraftState_daily_${dailyDate}` : "countryDraftState_v4";
}

function freshGame(isDailyMode = false, dailyDate = ""): GameState {
  const pool = isDailyMode
    ? seededShuffle([...COUNTRIES], dateStrToSeed(dailyDate))
    : shuffleArray([...COUNTRIES]);
  return {
    pool: pool.slice(1),
    currentCountry: pool[0] ?? null,
    roster: {},
    gameOver: false,
    wildcardUsed: false,
    isDailyMode,
    dailyDate,
    leaderboardSubmitted: false,
  };
}

function loadGameState(isDailyMode: boolean, dailyDate: string): GameState | null {
  try {
    const raw = localStorage.getItem(getStateKey(isDailyMode, dailyDate));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.pool || !Array.isArray(parsed.pool)) return null;
    return parsed;
  } catch { return null; }
}

function saveGameState(state: GameState) {
  localStorage.setItem(getStateKey(state.isDailyMode, state.dailyDate), JSON.stringify(state));
}

function saveDailyResult(dailyDate: string, score: number) {
  localStorage.setItem(`countryDraftDailyResult_${dailyDate}`, JSON.stringify({ score, completed: true }));
}

function loadLocalLeaderboard(): LocalLeaderboardEntry[] {
  try { return JSON.parse(localStorage.getItem("countryDraftLeaderboard_v2") || "[]"); }
  catch { return []; }
}

function addToLocalLeaderboard(score: number, roster: Partial<Record<Category, Country>>) {
  const board = loadLocalLeaderboard();
  const entry: LocalLeaderboardEntry = {
    score,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    roster: Object.fromEntries(
      Object.entries(roster).filter(([, c]) => c).map(([cat, c]) => [cat, c!.name])
    ),
  };
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem("countryDraftLeaderboard_v2", JSON.stringify(board.slice(0, 10)));
}

// ─── Scoring helpers ──────────────────────────────────────────────────────────

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
  if (total >= 148) return { label: "Superpower",        color: "text-yellow-400", icon: <Trophy className="w-5 h-5" /> };
  if (total >= 120) return { label: "Major Power",       color: "text-blue-400",   icon: <Star className="w-5 h-5" /> };
  if (total >= 95)  return { label: "Regional Power",    color: "text-green-400",  icon: <Zap className="w-5 h-5" /> };
  if (total >= 72)  return { label: "Developing Nation", color: "text-orange-400", icon: <Globe className="w-5 h-5" /> };
  return { label: "Struggling State", color: "text-red-400", icon: <Shield className="w-5 h-5" /> };
}

function computeSizePopBonus(roster: Partial<Record<Category, Country>>): number {
  const sc = roster["Size"];
  const pc = roster["Population"];
  if (!sc || !pc) return 0;
  const sz  = sc.stats.size.score;
  const pop = pc.stats.population.score;
  const idealDiff = sz - pop;
  let fitMultiplier: number;
  if (idealDiff < -2) {
    const overcrowding = -idealDiff - 2;
    fitMultiplier = Math.max(0, 1.0 - overcrowding * 0.4);
  } else if (idealDiff > 6) {
    fitMultiplier = Math.max(0.3, 1.0 - (idealDiff - 6) * 0.15);
  } else {
    fitMultiplier = 1.0;
  }
  const climate = roster["Climate"]?.stats.climate.score ?? 5;
  const tech    = roster["Technology"]?.stats.technology.score ?? 5;
  const eco     = roster["Economy"]?.stats.economy.score ?? 5;
  const agFactor  = (sz / 10) * (climate / 10);
  const urbFactor = (tech / 10) * (eco / 10);
  const densityBonus = Math.min(20, Math.round(fitMultiplier * Math.max(agFactor, urbFactor) * 22));
  const matchedPop = Math.min(pop, sz + 2);
  const comboBonus = Math.min(5, Math.round((sz * matchedPop) / 20));
  return densityBonus + comboBonus;
}

function getBonusPath(roster: Partial<Record<Category, Country>>): "agricultural" | "urban" | null {
  const sc = roster["Size"]; const pc = roster["Population"];
  if (!sc || !pc) return null;
  const sz = sc.stats.size.score; const pop = pc.stats.population.score;
  const climate = roster["Climate"]?.stats.climate.score ?? 5;
  const tech = roster["Technology"]?.stats.technology.score ?? 5;
  const eco = roster["Economy"]?.stats.economy.score ?? 5;
  const ratio = pop / (sz + 1);
  const agBonus  = (sz / 10) * (climate / 10) * Math.max(0, 1.2 - ratio) * 20;
  const urbBonus = (tech / 10) * (eco / 10) * Math.min(1, ratio * 0.8) * 20;
  return agBonus >= urbBonus ? "agricultural" : "urban";
}

export function computeTotalScore(roster: Partial<Record<Category, Country>>): number {
  const base = CATEGORIES.reduce((sum, cat) => {
    const c = roster[cat];
    if (!c || BONUS_CATEGORIES.includes(cat)) return sum;
    const weight = CATEGORY_WEIGHTS[cat] ?? 1.0;
    return sum + Math.round(c.stats[getCategoryKey(cat)].score * weight);
  }, 0);
  return base + computeSizePopBonus(roster);
}

function getCountryArchetype(roster: Partial<Record<Category, Country>>): Archetype {
  const s = (cat: Category): number =>
    BONUS_CATEGORIES.includes(cat) ? 0 : (roster[cat]?.stats[getCategoryKey(cat)].score ?? 0);
  const mil = s("Military"), eco = s("Economy"), gov = s("Government");
  const intl = s("International Relationships"), tech = s("Technology");
  const cult = s("Culture"), health = s("Healthcare"), climate = s("Climate");
  const hist = s("History"), tour = s("Tourism");
  const edu = s("Education"), nat = s("Natural Resources"), loc = s("Location");

  if (mil >= 9 && eco >= 8)    return { title: "Military Superpower",  emoji: "⚔️",  description: "A dominant force projecting military might backed by formidable economic power." };
  if (mil >= 9)                return { title: "Military Power",        emoji: "🛡️",  description: "An imposing military force built for security and strategic dominance." };
  if (eco >= 9 && gov >= 8)    return { title: "Economic Powerhouse",   emoji: "📈",  description: "A well-governed nation driving global economic growth and innovation." };
  if (edu >= 9 && tech >= 8)   return { title: "Knowledge Economy",     emoji: "🎓",  description: "Innovation powered by world-class education and cutting-edge technology." };
  if (gov >= 9 && health >= 8) return { title: "Stable Democracy",      emoji: "🏛️",  description: "A model of governance — transparent, effective, and caring for its citizens." };
  if (tech >= 9 && eco >= 7)   return { title: "Tech Nation",           emoji: "💻",  description: "A forward-thinking nation built on innovation and digital infrastructure." };
  if (nat >= 9 && eco >= 7)    return { title: "Resource Giant",        emoji: "⛏️",  description: "A nation whose natural wealth fuels economic dominance and global leverage." };
  if (intl >= 9 && loc >= 7)   return { title: "Diplomatic Powerhouse", emoji: "🌐",  description: "Strategically positioned and globally connected — allies everywhere." };
  if (intl >= 9)               return { title: "Diplomatic Power",      emoji: "🤝",  description: "A skilled navigator of global politics with allies on every continent." };
  if (climate >= 9 && tour >= 8) return { title: "Tourist Paradise",    emoji: "🏖️",  description: "Blessed with breathtaking scenery and a world-famous tourism destination." };
  if (hist >= 9 && cult >= 8)  return { title: "Cultural Empire",       emoji: "🎭",  description: "A civilization with deep cultural roots and an enduring historical legacy." };
  if (health >= 9 && edu >= 8) return { title: "Welfare State",         emoji: "❤️",  description: "A nation that puts its people first with world-class healthcare and education." };
  if (cult >= 9)               return { title: "Cultural Giant",        emoji: "🎨",  description: "A vibrant nation with rich traditions, arts, and cultural influence worldwide." };
  if (tour >= 9)               return { title: "Tourism Powerhouse",    emoji: "✈️",  description: "A destination the world dreams of visiting, with iconic landscapes and attractions." };
  if (climate >= 9)            return { title: "Natural Paradise",      emoji: "🌿",  description: "Blessed with exceptional climate and natural beauty." };
  if (nat >= 8)                return { title: "Resource Rich",         emoji: "⛰️",  description: "Blessed with abundant natural resources powering growth and exports." };

  const values = [mil, eco, gov, intl, tech, edu, nat, loc, cult, health, climate, hist, tour].filter(x => x > 0);
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  if (avg >= 7.5) return { title: "World Power",      emoji: "🌍", description: "A well-rounded nation excelling across multiple domains." };
  if (avg >= 5.5) return { title: "Emerging Nation",  emoji: "🌱", description: "A country with clear strengths building toward global relevance." };
  return { title: "Developing State", emoji: "🏗️", description: "A nation still finding its footing on the world stage." };
}

// ─── Local leaderboard row ────────────────────────────────────────────────────

function LocalLeaderboardRow({
  rank, entry, isCurrentGame,
}: { rank: number; entry: LocalLeaderboardEntry; isCurrentGame: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  const rankColor = rank === 1 ? "text-yellow-400" : rank === 2 ? "text-slate-300" : rank === 3 ? "text-amber-600" : "text-muted-foreground";

  return (
    <div className={`rounded-lg border overflow-hidden transition-colors ${
      isCurrentGame ? "border-primary/60 bg-primary/5" : "border-border/60 bg-card/30"
    }`}>
      <button
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`text-sm font-bold w-6 text-center shrink-0 ${rankColor}`}>
          {medal ?? `#${rank}`}
        </span>
        <span className="font-bold text-foreground text-base flex-1">{entry.score} pts</span>
        <span className="text-xs text-muted-foreground mr-1">{entry.date}</span>
        {isCurrentGame && (
          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-semibold mr-1">This game</span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
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
            <div className="px-4 pb-3 pt-2 border-t border-border/40 grid grid-cols-2 gap-1.5">
              {Object.entries(entry.roster).map(([cat, name]) => (
                <div key={cat} className="flex items-center gap-1.5 text-xs">
                  <span className="text-primary/60 shrink-0">{CATEGORY_ICONS[cat as Category]}</span>
                  <span className="text-muted-foreground shrink-0">{cat}:</span>
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

// ─── Submit Dialog ────────────────────────────────────────────────────────────

function SubmitDialog({
  score, mode, roster, onClose, onSuccess,
}: {
  score: number;
  mode: string;
  roster: Partial<Record<Category, Country>>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [, navigate] = useLocation();
  const { firebaseUser, profile, isLoading: authLoading, needsUsername, signInWithGoogle, signInWithEmail, refreshProfile } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const modeLabel = mode === "daily" ? "🗓️ Daily" : mode === "hard" ? "⚠️ Hard" : "Easy";
  const displayName = profile?.username ?? firebaseUser?.displayName ?? firebaseUser?.email ?? "Anonymous";
  const isAuthenticated = !!firebaseUser && !!profile;

  async function handleGoogleSignIn() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError("Google sign-in failed. Please try again.");
    }
  }

  async function handleEmailAuth() {
    setError(null);
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password, isSignUp);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? "";
      setError(
        code.includes("wrong-password") || code.includes("invalid-credential") ? "Wrong email or password." :
        code.includes("user-not-found") ? "No account with that email." :
        code.includes("email-already-in-use") ? "Email already in use — try signing in." :
        code.includes("weak-password") ? "Password must be at least 6 characters." :
        "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!firebaseUser || !profile) return;
    setLoading(true);
    setError(null);
    try {
      const rosterMap = Object.fromEntries(
        Object.entries(roster).filter(([, c]) => c).map(([cat, c]) => [cat, c!.name])
      );
      await saveScore(firebaseUser.uid, profile.username, score, mode, rosterMap);
      setDone(true);
      onSuccess();
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? "";
      if (code === "already-submitted") {
        setError("You've already submitted a daily score today.");
      } else {
        setError("Failed to submit. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

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
        className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Username prompt for first-time sign-in */}
        <AnimatePresence>
          {needsUsername && firebaseUser && (
            <UsernamePrompt user={firebaseUser} onComplete={refreshProfile} />
          )}
        </AnimatePresence>

        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-serif text-lg font-bold text-foreground">Submit Score</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="px-5 py-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <div className="font-semibold text-foreground mb-1">Score submitted!</div>
            <div className="text-sm text-muted-foreground mb-5">
              <span className="text-primary font-bold">{score} pts</span> posted as{" "}
              <span className="font-semibold text-foreground">{displayName}</span>.
            </div>
            <button
              onClick={() => navigate("/leaderboard")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/20 text-primary border border-primary/40 font-semibold text-sm hover:bg-primary/30 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              View Leaderboard
            </button>
          </div>

        ) : authLoading ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground animate-pulse">Checking account…</div>

        ) : !firebaseUser ? (
          /* ── Not signed in ── */
          <div className="px-5 py-5 space-y-3">
            <div className="text-center mb-2">
              <div className="text-3xl mb-1">🔒</div>
              <div className="font-semibold text-foreground">Sign in to submit</div>
              <p className="text-xs text-muted-foreground mt-1">
                Post your <span className="text-primary font-bold">{score} pts</span> · {modeLabel} to the global leaderboard.
              </p>
            </div>

            {!showEmail ? (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white border border-white/20 font-semibold text-sm hover:bg-white/20 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.5 1.2 8.9 3.2l6.6-6.6C35.5 2.5 30.1 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.7 6C12.2 13.3 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.5-.1-3-.4-4.4H24v8.4h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4c4.1-3.8 6.5-9.4 6.5-16.2z"/><path fill="#FBBC05" d="M10.4 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.7-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.7-6z"/><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7-5.4c-2 1.3-4.5 2.1-8 2.1-6.3 0-11.7-4.3-13.6-10l-7.7 6C6.7 42.6 14.7 48 24 48z"/></svg>
                  Continue with Google
                </button>
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <button
                  onClick={() => { setShowEmail(true); setIsSignUp(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary/40 text-foreground border border-border font-semibold text-sm hover:bg-secondary transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Email
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleEmailAuth()}
                  placeholder="Password"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  onClick={handleEmailAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/40 font-semibold text-sm hover:bg-primary/30 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "…" : isSignUp ? "Create Account" : "Sign In"}
                </button>
                <div className="flex items-center justify-between text-xs">
                  <button onClick={() => setShowEmail(false)} className="text-muted-foreground hover:text-foreground">← Back</button>
                  <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-primary hover:underline">
                    {isSignUp ? "Have an account? Sign in" : "New here? Create account"}
                  </button>
                </div>
              </div>
            )}
          </div>

        ) : needsUsername ? (
          /* ── Username prompt pending ── */
          <div className="px-5 py-8 text-center text-sm text-muted-foreground animate-pulse">Setting up your profile…</div>

        ) : isAuthenticated ? (
          /* ── Ready to submit ── */
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your score</span>
              <span className="font-bold text-primary">{score} pts · {modeLabel}</span>
            </div>
            <div className="bg-secondary/40 rounded-lg px-3 py-2.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {(displayName[0] ?? "?").toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{displayName}</div>
                <div className="text-xs text-muted-foreground">Posting as your username</div>
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                !loading
                  ? "bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30"
                  : "bg-secondary text-muted-foreground border border-border cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              {loading ? "Submitting…" : "Submit to Leaderboard"}
            </button>
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Game component ──────────────────────────────────────────────────────

export default function Game() {
  const isDailyMode = localStorage.getItem("countryDraftDailyMode") === "true";
  const dailyDate   = localStorage.getItem("countryDraftDailyDate") || getTodayStr();

  const [state, setState] = useState<GameState>(
    () => loadGameState(isDailyMode, dailyDate) || freshGame(isDailyMode, dailyDate)
  );
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [lastAssigned, setLastAssigned] = useState<Category | null>(null);
  const [wildcardPhase, setWildcardPhase] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isHardMode, setIsHardMode] = useState<boolean>(() =>
    !isDailyMode && localStorage.getItem("countryDraftHardMode") === "true"
  );
  const rosterRef = useRef<HTMLDivElement>(null);
  const localLeaderboardSaved = useRef(false);
  const dailyResultSaved = useRef(false);
  const { isLight, toggleTheme } = useTheme();
  const [, navigate] = useLocation();

  useEffect(() => { saveGameState(state); }, [state]);

  const filledCount = CATEGORIES.filter((c) => state.roster[c]).length;
  const totalScore  = computeTotalScore(state.roster);
  const bonus       = computeSizePopBonus(state.roster);

  useEffect(() => {
    if (state.gameOver) {
      if (!localLeaderboardSaved.current) {
        addToLocalLeaderboard(totalScore, state.roster);
        localLeaderboardSaved.current = true;
      }
      if (isDailyMode && !dailyResultSaved.current) {
        saveDailyResult(dailyDate, totalScore);
        dailyResultSaved.current = true;
      }
    }
    if (!state.gameOver) {
      localLeaderboardSaved.current = false;
      dailyResultSaved.current = false;
    }
  }, [state.gameOver, totalScore, state.roster, isDailyMode, dailyDate]);

  const doReset = useCallback(() => {
    if (isDailyMode) {
      // Clear daily mode and go home
      localStorage.removeItem("countryDraftDailyMode");
      localStorage.removeItem("countryDraftDailyDate");
      navigate("/");
      return;
    }
    localStorage.removeItem("countryDraftState_v4");
    setState(freshGame(false, ""));
    setHoveredCategory(null); setWildcardPhase(false);
  }, [isDailyMode, navigate]);

  const toggleHardMode = useCallback(() => {
    if (isDailyMode) return; // can't switch modes in daily challenge
    const next = !isHardMode;
    setIsHardMode(next);
    localStorage.setItem("countryDraftHardMode", String(next));
    localStorage.removeItem("countryDraftState_v4");
    setState(freshGame(false, ""));
    setHoveredCategory(null); setWildcardPhase(false);
  }, [isHardMode, isDailyMode]);

  const assignCountry = useCallback((category: Category) => {
    if (!state.currentCountry || state.roster[category] || state.gameOver) return;
    const newRoster = { ...state.roster, [category]: state.currentCountry };
    const allFilled = CATEGORIES.every((c) => newRoster[c]);
    const newPool = state.pool.slice(1);
    setLastAssigned(category);
    setTimeout(() => setLastAssigned(null), 600);
    setState((prev) => ({
      ...prev, pool: newPool,
      currentCountry: allFilled ? null : state.pool[0] ?? null,
      roster: newRoster, gameOver: allFilled,
    }));
  }, [state]);

  const startWildcard = useCallback(() => {
    if (state.wildcardUsed || !state.gameOver) return;
    setWildcardPhase(true);
  }, [state]);

  const applyWildcard = useCallback((category: Category) => {
    if (!state.gameOver || !wildcardPhase || state.wildcardUsed) return;
    if (state.pool.length === 0) return;
    const newCountry = state.pool[0];
    const newPool = state.pool.slice(1);
    const newRoster = { ...state.roster, [category]: newCountry };
    setWildcardPhase(false);
    setLastAssigned(category);
    setTimeout(() => setLastAssigned(null), 600);
    setState((prev) => ({ ...prev, pool: newPool, roster: newRoster, wildcardUsed: true }));
  }, [state, wildcardPhase]);

  const downloadPng = useCallback(async () => {
    await drawRosterPng(state.roster, totalScore, bonus);
  }, [state.roster, totalScore, bonus]);

  const gameMode = isDailyMode ? "daily" : isHardMode ? "hard" : "easy";

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="game-container">
      {/* Header */}
      <header className="border-b border-border px-4 py-2.5 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { if (state.gameOver || Object.keys(state.roster).length === 0) { navigate("/"); } else { setShowExitConfirm(true); } }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Home"
          >
            <HomeIcon className="w-4 h-4" />
          </button>
          <Globe className="w-5 h-5 text-primary" />
          <span className="font-serif text-lg font-bold text-foreground tracking-tight">GeoDrafts</span>
          {isDailyMode ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-bold">
              <CalendarDays className="w-3 h-3" />
              Daily
            </span>
          ) : (
            <span className="text-muted-foreground text-xs hidden sm:block">Build the ideal nation</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground hidden sm:block">
            <span className="text-primary font-semibold">{filledCount}</span>
            <span>/{CATEGORIES.length}</span>
          </div>

          {/* Mode toggle — hidden in daily mode */}
          {!isDailyMode && (
            <button
              onClick={toggleHardMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                isHardMode
                  ? "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30"
                  : "bg-secondary/50 text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
              }`}
              title={isHardMode ? "Hard Mode — click to switch to Easy" : "Easy Mode — click to switch to Hard"}
            >
              {isHardMode ? "⚠️ Hard" : "Easy"}
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors"
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isLight ? "Dark" : "Light"}</span>
          </button>

          <button
            data-testid="button-reset"
            onClick={doReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isDailyMode ? "Exit" : "New Draft"}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {rosterOpen && (
          <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setRosterOpen(false)} />
        )}

        {/* Left: Category Slots */}
        {!state.gameOver && (
          <div className={`
            fixed md:relative inset-y-0 left-0 z-30
            transition-transform duration-300 ease-in-out
            md:translate-x-0 md:transition-none
            ${rosterOpen ? "translate-x-0" : "-translate-x-full"}
            w-72 shrink-0 border-r border-border flex flex-col
            bg-[#0a1520]/95 md:bg-card/30 backdrop-blur-sm md:backdrop-blur-none overflow-y-auto
          `}>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your Nation's Roster
            </h2>
            <button className="md:hidden p-1 rounded text-muted-foreground hover:text-foreground transition-colors" onClick={() => setRosterOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-3 space-y-1.5 flex flex-col">
            {Object.keys(state.roster).length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-60">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Your roster is empty</p>
                <p className="text-xs text-muted-foreground">Pick a category to build up your nation!</p>
              </div>
            ) : (
              CATEGORIES.filter(c => state.roster[c]).map((category) => {
              const assigned = state.roster[category];
              const catKey = getCategoryKey(category);
              const isBonus = BONUS_CATEGORIES.includes(category);
              const isHovered = hoveredCategory === category;
              const isAssignable = !assigned && !!state.currentCountry && !state.gameOver;
              const isWildcardTarget = wildcardPhase && !!assigned;
              const score = assigned && !isBonus ? assigned.stats[catKey].score : null;
              const isLastAssigned = lastAssigned === category;
              const stars = getCategoryStars(category);
              const partnerFilled = isBonus && (
                category === "Size" ? !!state.roster["Population"] : !!state.roster["Size"]
              );
              const bonusReady = isBonus && !!state.roster["Size"] && !!state.roster["Population"];

              return (
                <motion.button
                  key={category}
                  data-testid={`slot-${category.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => {
                    if (isWildcardTarget) applyWildcard(category);
                    else if (isAssignable) { assignCountry(category); setRosterOpen(false); }
                  }}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  disabled={!isAssignable && !isWildcardTarget}
                  className={`w-full rounded-lg border text-left transition-all duration-200 ${
                    isWildcardTarget
                      ? "border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-400/70 cursor-pointer"
                      : assigned
                      ? `border-border/25 bg-muted/20 cursor-default ${isLastAssigned ? "slot-fill" : "opacity-60"}`
                      : isAssignable
                      ? "border-primary/30 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/60 cursor-pointer pulse-gold"
                      : "border-border/20 bg-card/10 cursor-default opacity-40"
                  }`}
                  whileTap={isAssignable || isWildcardTarget ? { scale: 0.97 } : {}}
                >
                  <div className="px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`${
                          isWildcardTarget ? "text-blue-400"
                          : assigned ? "text-muted-foreground/60"
                          : isHovered && isAssignable ? "text-primary"
                          : "text-muted-foreground"
                        }`}>
                          {CATEGORY_ICONS[category]}
                        </span>
                        <span className={`text-xs font-semibold uppercase tracking-wide ${assigned ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                          {category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] leading-none ${
                          stars === "★★★" ? "text-yellow-400/70"
                          : stars === "★★" ? "text-yellow-400/50"
                          : "text-yellow-400/30"
                        }`}>{stars}</span>
                        {isWildcardTarget && <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </div>
                    </div>

                    {assigned ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl leading-none">{assigned.flag}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-foreground/60 truncate">{assigned.name}</div>
                          {!isHardMode && score !== null && (
                            <div className="mt-0.5">
                              <span className={`text-[10px] font-bold ${getScoreLabel(score).color}`}>
                                {getPtsDisplay(score, category)}
                              </span>
                            </div>
                          )}
                          {isBonus && bonusReady && !isHardMode && (
                            <div className="mt-0.5 text-[10px] text-yellow-400/80 font-semibold">
                              💡 +{bonus} bonus total
                            </div>
                          )}
                          {isBonus && assigned && !partnerFilled && !isHardMode && (
                            <div className="mt-0.5 text-[10px] text-muted-foreground/60">
                              Fill {category === "Size" ? "Population" : "Size"} for bonus
                            </div>
                          )}
                        </div>
                        {isWildcardTarget ? (
                          <Shuffle className="w-3 h-3 text-blue-400 shrink-0" />
                        ) : (
                          <Lock className="w-3 h-3 text-muted-foreground/30 shrink-0" />
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
                      <div className="text-xs text-muted-foreground/30 mt-1">Empty</div>
                    )}
                  </div>
                </motion.button>
              );
              })
            )}
          </div>

            {wildcardPhase && (
              <div className="p-3 border-t border-border">
                <button onClick={() => setWildcardPhase(false)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <X className="w-3.5 h-3.5" />
                  Cancel Wildcard
                </button>
              </div>
            )}
          </div>
        )}

        {/* Center */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {state.gameOver ? (
            <GameOver
              roster={state.roster}
              totalScore={totalScore}
              bonus={bonus}
              onReset={doReset}
              onDownload={downloadPng}
              onWildcard={startWildcard}
              onWildcardSelect={applyWildcard}
              setWildcardPhase={setWildcardPhase}
              wildcardUsed={state.wildcardUsed}
              wildcardPhase={wildcardPhase}
              rosterRef={rosterRef}
              isHardMode={isHardMode}
              isDailyMode={isDailyMode}
              onSubmitLeaderboard={() => setShowSubmitDialog(true)}
              gameMode={gameMode}
              leaderboardSubmitted={state.leaderboardSubmitted}
            />
          ) : state.currentCountry ? (
            <CountryCard
              country={state.currentCountry}
              hoveredCategory={hoveredCategory}
              poolRemaining={state.pool.length}
              isHardMode={isHardMode}
              roster={state.roster}
              onAssign={assignCountry}
              onHover={setHoveredCategory}
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

      </div>

      {/* Mobile floating roster toggle */}
      {!state.gameOver && (
        <button
          className="fixed bottom-5 left-4 z-50 md:hidden flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-full shadow-lg text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          onClick={() => setRosterOpen(!rosterOpen)}
        >
          <List className="w-4 h-4 text-primary" />
          <span>Roster</span>
          <span className="text-primary font-bold">{filledCount}/{CATEGORIES.length}</span>
        </button>
      )}


      {/* Submit leaderboard dialog */}
      <AnimatePresence>
        {showSubmitDialog && (
          <SubmitDialog
            score={totalScore}
            mode={gameMode}
            roster={state.roster}
            onClose={() => setShowSubmitDialog(false)}
            onSuccess={() => setState(prev => ({ ...prev, leaderboardSubmitted: true }))}
          />
        )}
      </AnimatePresence>

        <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
              <AlertDialogDescription>
                Your current draft progress will be lost. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => navigate("/")}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Exit Game
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

// ─── CountryCard ──────────────────────────────────────────────────────────────

function CountryCard({
  country, hoveredCategory, poolRemaining, isHardMode, roster, onAssign, onHover,
}: {
  country: Country;
  hoveredCategory: Category | null;
  poolRemaining: number;
  isHardMode: boolean;
  roster: Partial<Record<Category, Country>>;
  onAssign: (cat: Category) => void;
  onHover: (cat: Category | null) => void;
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
        <div className="flex items-start gap-4 pb-4 border-b border-border">
          <div className="text-6xl leading-none">{country.flag}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="font-serif text-3xl font-bold text-foreground">{country.name}</h1>
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

        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5 flex items-center gap-3">
          <ChevronRight className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm text-foreground/80">
            {isHardMode ? (
              <>
                <span className="text-red-400 font-semibold">Hard Mode</span> — no ratings.
                {" "}<span className="text-primary font-semibold">Click a slot</span> to assign based on objective stats.
              </>
            ) : (
              <>
                <span className="text-primary font-semibold">Hover a slot</span> on the left to preview this country's score, then click to assign.
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {CATEGORIES.filter(c => !roster[c]).map((category) => {
            const catKey = getCategoryKey(category);
            const stat = country.stats[catKey];
            const isHighlighted = hoveredCategory === category;
            const isBonus = BONUS_CATEGORIES.includes(category);
            const { label, color } = getScoreLabel(stat.score);
            const stars = getCategoryStars(category);

            return (
              <motion.button
                key={category}
                animate={{
                  borderColor: isHighlighted ? "hsl(43 90% 55% / 0.6)" : "hsl(217 30% 18%)",
                  backgroundColor: isHighlighted ? "hsl(43 90% 55% / 0.05)" : "hsl(222 40% 10%)",
                }}
                onClick={() => onAssign(category)}
                onMouseEnter={() => onHover(category)}
                onMouseLeave={() => onHover(null)}
                transition={{ duration: 0.15 }}
                className={`rounded-lg border p-3 text-left transition-all hover:border-primary/50 ${isHighlighted ? "ring-1 ring-primary/30" : ""}`}
                data-testid={`stat-${catKey}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={isHighlighted ? "text-primary" : "text-muted-foreground"}>
                      {CATEGORY_ICONS[category]}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</span>
                    <span className={`text-[9px] leading-none ${
                      stars === "★★★" ? "text-yellow-400/60"
                      : stars === "★★" ? "text-yellow-400/40"
                      : "text-yellow-400/25"
                    }`}>{stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                  </div>
                </div>

                {isBonus ? (
                  <div className="mb-1.5">
                    <div className="text-[10px] text-yellow-400/70 font-semibold mb-1">💡 Bonus formula stat</div>
                  </div>
                ) : !isHardMode ? (
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${color}`}>{label}</span>
                    <span className={`text-xs font-bold ${color}`}>{getPtsDisplay(stat.score, category)}</span>
                  </div>
                ) : null}

                <ExpandableDescription description={stat.description} />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── GameOver ─────────────────────────────────────────────────────────────────

function GameOver({
  roster, totalScore, bonus, onReset, onDownload, onWildcard, onWildcardSelect, setWildcardPhase,
  wildcardUsed, wildcardPhase, rosterRef, isHardMode, isDailyMode,
  onSubmitLeaderboard, gameMode, leaderboardSubmitted,
}: {
  roster: Partial<Record<Category, Country>>;
  totalScore: number;
  bonus: number;
  onReset: () => void;
  onDownload: () => void;
  onWildcard: () => void;
  onWildcardSelect: (cat: Category) => void;
  wildcardUsed: boolean;
  wildcardPhase: boolean; setWildcardPhase: (val: boolean) => void;
  rosterRef: React.RefObject<HTMLDivElement | null>;
  isHardMode: boolean;
  isDailyMode: boolean;
  onSubmitLeaderboard: () => void;
  gameMode: string;
  leaderboardSubmitted: boolean;
}) {
  const [, navigate] = useLocation();
  const rating = getRating(totalScore);
  const archetype = getCountryArchetype(roster);
  const bonusPath = getBonusPath(roster);
  const leaderboard = loadLocalLeaderboard();
  const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const currentRank = leaderboard.findIndex((e) => e.score === totalScore && e.date === todayStr);

  return (
    <div className="flex-1 flex flex-col p-6 gap-6" data-testid="game-over-screen">
      <div className="text-center pb-4 border-b border-border">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className={rating.color}>{rating.icon}</span>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {isDailyMode ? "Daily Challenge Complete!" : "Draft Complete"}
            </h1>
          </div>
          {isDailyMode && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-bold mb-3">
              <CalendarDays className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          )}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{totalScore}</div>
              <div className="text-sm text-muted-foreground">total score</div>
            </div>
            <div className="w-px h-14 bg-border hidden sm:block" />
            <div className="text-center">
              <div className={`text-2xl font-bold ${rating.color}`}>{rating.label}</div>
              <div className="text-sm text-muted-foreground">nation ranking</div>
            </div>
            <div className="w-px h-14 bg-border hidden sm:block" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{archetype.emoji} {archetype.title}</div>
              <div className="text-sm text-muted-foreground">nation archetype</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground/70 mt-2 italic">{archetype.description}</p>
        </motion.div>

        {bonus > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm font-semibold"
          >
            💡 Size + Population bonus: +{bonus} pts
            {bonusPath && (
              <span className="text-yellow-400/70 font-normal text-xs">
                ({bonusPath === "agricultural" ? "agricultural nation" : "urban powerhouse"})
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 flex-wrap">
        <button
          onClick={onSubmitLeaderboard}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400/20 text-yellow-400 border border-yellow-400/40 rounded-lg font-semibold text-sm hover:bg-yellow-400/30 transition-colors"
        >
          <Trophy className="w-4 h-4" />
          Submit to Leaderboard
        </button>
        <button
          onClick={() => navigate("/leaderboard")}
          className="flex items-center gap-2 px-5 py-2.5 bg-card text-muted-foreground border border-border rounded-lg font-semibold text-sm hover:text-foreground hover:bg-secondary transition-colors"
        >
          <List className="w-4 h-4" />
          View Leaderboard
        </button>
        <button
          data-testid="button-download"
          onClick={onDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary/20 text-primary border border-primary/40 rounded-lg font-semibold text-sm hover:bg-primary/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PNG
        </button>
        {!isDailyMode && !wildcardUsed && !wildcardPhase && !isHardMode && !leaderboardSubmitted && (
          <button
            data-testid="button-wildcard"
            onClick={onWildcard}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/20 text-blue-300 border border-blue-500/40 rounded-lg font-semibold text-sm hover:bg-blue-600/30 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            Use Wildcard
          </button>
        )}
        {leaderboardSubmitted && !wildcardUsed && !isDailyMode && !isHardMode && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg text-xs text-muted-foreground border border-border">
            <Shuffle className="w-3.5 h-3.5" />
            Wildcard locked after submission
          </div>
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
          {isDailyMode ? "Back to Home" : "New Draft"}
        </button>
      </div>

      {/* Final Roster */}
      <div ref={rosterRef} className="rounded-xl overflow-hidden border border-border bg-background">
        {wildcardPhase && !isHardMode && (
          <div className="bg-blue-500/10 border-b border-blue-500/30 px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Shuffle className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-blue-300">Wildcard Active</div>
                <div className="text-xs text-blue-400/70">Select any filled slot below to replace it with a random country from the remaining pool.</div>
              </div>
            </div>
            <button
              onClick={() => setWildcardPhase(false)}
              className="p-1.5 rounded-md text-blue-400/60 hover:text-blue-300 hover:bg-blue-500/20 transition-colors"
              title="Close wildcard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-px bg-border">
          {CATEGORIES.map((category) => {
            const country = roster[category];
            const catKey = getCategoryKey(category);
            const isBonus = BONUS_CATEGORIES.includes(category);
            const score = country && !isBonus ? country.stats[catKey].score : null;
            const scoreInfo = score !== null ? getScoreLabel(score) : null;

            return (
              <motion.button
                key={category}
                disabled={!wildcardPhase}
                onClick={() => wildcardPhase && onWildcardSelect(category)}
                className={`bg-card p-4 text-left transition-all relative ${
                  wildcardPhase
                    ? "hover:bg-blue-500/5 cursor-pointer ring-inset hover:ring-2 hover:ring-blue-400/50"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{CATEGORY_ICONS[category]}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{category}</span>
                  </div>
                </div>
                {country ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground text-sm">{country.name}</div>
                        {isBonus ? (
                          <div className="text-xs text-yellow-400/70 mt-0.5">💡 Bonus contributor</div>
                        ) : (
                          !isHardMode && score !== null && scoreInfo && (
                            <div className="flex items-center justify-between mt-0.5">
                              <span className={`text-xs font-semibold ${scoreInfo.color}`}>{scoreInfo.label}</span>
                              <span className={`text-xs font-bold ${scoreInfo.color}`}>{getPtsDisplay(score, category)}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <ExpandableDescription description={country.stats[catKey].description} />
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground/40 italic">Not assigned</div>
                )}
                {wildcardPhase && (
                  <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Local Leaderboard */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-card px-5 py-3.5 border-b border-border flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <h2 className="text-sm font-semibold text-foreground">Your Best Scores</h2>
          <span className="text-xs text-muted-foreground ml-1">— click any row to see full roster</span>
        </div>
        {leaderboard.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground/60 italic">No scores yet. Play more drafts!</div>
        ) : (
          <div className="p-3 space-y-2">
            {leaderboard.map((entry, i) => (
              <LocalLeaderboardRow
                key={i}
                rank={i + 1}
                entry={entry}
                isCurrentGame={currentRank === i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
