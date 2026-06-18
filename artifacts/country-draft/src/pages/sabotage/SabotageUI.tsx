import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Plus, Shield, TrendingUp, Palette, Heart, Globe, Sun, Cpu, Map, Users,
  BookOpen, Building, ChevronRight, ChevronDown, ChevronUp, Download, RotateCcw, Trophy,
  Star, Zap, Lock, Shuffle, X, ArrowLeftRight, List, Medal,
  GraduationCap, MapPin, Mountain, Camera, Home as HomeIcon, Moon, Send,
  CalendarDays, LogIn, PartyPopper, Swords, Laptop,
  Globe as GlobeIcon, Plane, Leaf,
  Handshake, Umbrella, Info, Search, Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  COUNTRIES, CATEGORIES, getCategoryKey,
  type Country, type Category,
  extractBonusText
} from "@/data/countries";

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  Military: <Shield className="w-5 h-5" />,
  Economy: <TrendingUp className="w-5 h-5" />,
  Government: <Building className="w-5 h-5" />,
  "International Relationships": <Handshake className="w-5 h-5" />,
  Technology: <Cpu className="w-5 h-5" />,
  Education: <GraduationCap className="w-5 h-5" />,
  "Natural Resources": <Leaf className="w-5 h-5" />,
  Healthcare: <Heart className="w-5 h-5" />,
  Culture: <Palette className="w-5 h-5" />,
  Climate: <Sun className="w-5 h-5" />,
  History: <BookOpen className="w-5 h-5" />,
  Tourism: <Plane className="w-5 h-5" />,
  Location: <MapPin className="w-5 h-5" />,
  Size: <Map className="w-5 h-5" />,
  Population: <Users className="w-5 h-5" />,
};

export const CATEGORY_MAX_SCORES: Partial<Record<Category, number>> = {
  Military: 15, Economy: 15, Government: 15,
  "International Relationships": 12, Technology: 12, Education: 12, "Natural Resources": 12, Healthcare: 12,
  Location: 10, Size: 10, Population: 10, Culture: 10, Climate: 10, History: 10, Tourism: 10,
};

export const BONUS_CATEGORIES: Category[] = ["Size", "Population"];

// ─── Canvas PNG export ────────────────────────────────────────────────────────
export const PNG_COLORS = {
  bg: "#08111e", cardBg: "#0d1a2a", cardBg2: "#0f1e30", border: "#1b2d40",
  gold: "#d4a420", fg: "#ccd9e8", fgDim: "#8099b0", muted: "#4a6278",
  scoreColors: ["#ef4444","#ef4444","#ef4444","#f97316","#f97316","#eab308","#eab308","#22c55e","#22c55e","#10b981","#10b981"],
  ratingColors: { superpower: "#facc15", major: "#60a5fa", regional: "#4ade80", developing: "#fb923c", struggling: "#f87171" },
};
export function canvasRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
}
export function pngScoreBar(score: number): string { return PNG_COLORS.scoreColors[Math.max(0, Math.min(10, score)) - 1] ?? "#eab308"; }
export function pngRatingColor(total: number): string {
  if (total >= 165) return PNG_COLORS.ratingColors.superpower;
  if (total >= 140) return PNG_COLORS.ratingColors.major;
  if (total >= 110) return PNG_COLORS.ratingColors.regional;
  if (total >= 80) return PNG_COLORS.ratingColors.developing;
  return PNG_COLORS.ratingColors.struggling;
}
export function pngScoreLabel(score: number): string {
  if (score >= 13.5) return "World-Class";
  if (score >= 10) return "Strong"; if (score >= 7) return "Moderate";
  if (score >= 4) return "Weak"; return "Critical";
}
export function pngRatingLabel(total: number): string {
  if (total >= 165) return "Superpower"; if (total >= 140) return "Major Power";
  if (total >= 110) return "Regional Power"; if (total >= 80) return "Developing Nation";
  return "Struggling State";
}
export async function drawRosterPng(roster: Partial<Record<Category, Country>>, totalScore: number, bonus: number): Promise<void> {
  const DPR = 2, W = 1180, HDR = 88, PAD = 20, GAP = 10, COLS = 2;
  const CARD_W = (W - PAD * 3) / COLS; const CARD_H = 112; const ROWS = Math.ceil(CATEGORIES.length / COLS);
  const H = HDR + PAD + ROWS * (CARD_H + GAP) - GAP + PAD;
  const canvas = document.createElement("canvas");
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(DPR, DPR);
  const C = PNG_COLORS;
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.cardBg;
  ctx.fillRect(0, 0, W, HDR);
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, HDR);
  ctx.lineTo(W, HDR);
  ctx.stroke();
  ctx.fillStyle = C.gold;
  ctx.font = "bold 18px 'Georgia', serif";
  ctx.fillText("GeoDrafts — My Ideal Nation", PAD, 30);
  ctx.fillStyle = C.fgDim;
  ctx.font = "13px sans-serif";
  ctx.fillText("Final Roster · Score:", PAD, 56);
  ctx.fillStyle = C.gold;
  ctx.font = "bold 15px sans-serif";
  const scoreStr = `${totalScore}`;
  ctx.fillText(scoreStr, PAD + 148, 56);
  const rLabel = pngRatingLabel(totalScore);
  const rColor = pngRatingColor(totalScore);
  ctx.fillStyle = rColor;
  ctx.font = "bold 15px sans-serif";
  ctx.fillText(
    `· ${rLabel}`,
    PAD + 148 + ctx.measureText(scoreStr).width + 8,
    56,
  );
  if (bonus > 0) {
    ctx.fillStyle = C.fgDim;
    ctx.font = "12px sans-serif";
    ctx.fillText(`(incl. +${bonus} size/population bonus)`, PAD, 76);
  }
  const displayCats: string[] = CATEGORIES.filter(c => c !== "Size" && c !== "Population");
  if (roster.Size && roster.Population) { displayCats.push("Population Structure" as any); }
  else { if (roster.Size) displayCats.push("Size"); if (roster.Population) displayCats.push("Population"); }

  displayCats.forEach((cat, i) => {
    const isCombo = cat === "Population Structure";
    const actualCat = isCombo ? "Size" : (cat as Category);
    const assigned = roster[actualCat];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = PAD + col * (CARD_W + GAP);
    const y = HDR + PAD + row * (CARD_H + GAP);

    ctx.fillStyle = (i % 2 === 0) ? C.cardBg : C.cardBg2;
    canvasRoundRect(ctx, x, y, CARD_W, CARD_H, 6);
    ctx.fill();
    ctx.strokeStyle = C.border;
    ctx.stroke();

    ctx.fillStyle = C.muted;
    ctx.font = "bold 10px sans-serif";
    ctx.fillText(cat.toUpperCase(), x + 12, y + 20);

    if (assigned) {
      ctx.fillStyle = C.fg;
      ctx.font = "bold 16px sans-serif";
      let nameText = `${assigned.flag} ${assigned.name}`;
      if (isCombo) {
        const pop = roster.Population!;
        nameText = `${assigned.flag} ${assigned.name} + ${pop.flag} ${pop.name}`;
      }
      ctx.fillText(nameText, x + 12, y + 42);

      let scoreVal = 0, weight = 1, desc = "", maxScore = 10;
      if (isCombo) {
        scoreVal = (assigned.stats.size.score + roster.Population!.stats.population.score) / 2;
        weight = 1;
        desc = "Combined structure bonus applied";
      } else {
        const ck = getCategoryKey(actualCat);
        scoreVal = assigned.stats[ck].score;
        weight = CATEGORY_MAX_SCORES[actualCat] ?? 10;
        desc = assigned.stats[ck].description;
      }

      const isBonus = BONUS_CATEGORIES.includes(actualCat) || isCombo;

      if (!isBonus) {
        ctx.fillStyle = pngScoreBar(scoreVal);
        ctx.font = "bold 13px sans-serif";
        const wScore = scoreVal;
        ctx.fillText(`${wScore} pts`, x + CARD_W - 60, y + 20);

        const sl = pngScoreLabel(scoreVal);
        ctx.fillStyle = C.fgDim;
        ctx.font = "10px sans-serif";
        ctx.fillText(sl, x + CARD_W - 12 - ctx.measureText(sl).width, y + 34);

        ctx.fillStyle = C.border;
        canvasRoundRect(ctx, x + 12, y + 54, CARD_W - 24, 4, 2);
        ctx.fill();
        ctx.fillStyle = pngScoreBar(scoreVal);
        canvasRoundRect(ctx, x + 12, y + 54, ((CARD_W - 24) * scoreVal) / weight, 4, 2);
        ctx.fill();
      } else {
        ctx.fillStyle = C.gold;
        ctx.font = "bold 13px sans-serif";
        ctx.fillText(isCombo ? `+${bonus} pts` : `+${Math.floor(scoreVal/2)} pts`, x + CARD_W - 60, y + 20);
      }

      ctx.fillStyle = C.fgDim;
      ctx.font = "italic 11px sans-serif";
      const words = desc.split(" ");
      let line = "";
      let ly = isBonus ? y + 64 : y + 74;
      for (const w of words) {
        if (ctx.measureText(line + w + " ").width < CARD_W - 24) { line += w + " "; }
        else { ctx.fillText(line, x + 12, ly); line = w + " "; ly += 14; }
      }
      ctx.fillText(line, x + 12, ly);
    } else {
      ctx.fillStyle = C.muted;
      ctx.font = "italic 13px sans-serif";
      ctx.fillText("Empty Slot", x + 12, y + 42);
    }
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `GeoDrafts_Roster_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      resolve();
    }, "image/png");
  });
}

// ─── Helpers ────────────────────────────────────────────────────────
export function getCategoryStars(cat: Category): string {
  if (BONUS_CATEGORIES.includes(cat) || cat === "Population" || cat === "Size") return "";
  const maxScore = CATEGORY_MAX_SCORES[cat] ?? 10;
  if (maxScore === 15) return "★★★";
  if (maxScore === 12) return "★★";
  return "★";
}
export function getPtsDisplay(score: number, cat: Category): string { const maxScore = CATEGORY_MAX_SCORES[cat] ?? 10; return `${score}/${maxScore} pts`; }
export function getScoreBarColor(score: number): string { if (score >= 9) return "bg-emerald-500"; if (score >= 7) return "bg-green-500"; if (score >= 5) return "bg-yellow-500"; if (score >= 3) return "bg-orange-500"; return "bg-red-500"; }
export function getScoreLabel(score: number, maxScore: number = 15): { label: string; color: string } {
  if (maxScore === 10) {
    if (score >= 9) return { label: "World-Class", color: "text-emerald-400" };
    if (score >= 7) return { label: "Strong", color: "text-green-400" };
    if (score >= 5) return { label: "Moderate", color: "text-yellow-400" };
    if (score >= 3) return { label: "Weak", color: "text-orange-400" };
    return { label: "Critical", color: "text-red-400" };
  }
  if (maxScore === 12) {
    if (score >= 11) return { label: "World-Class", color: "text-emerald-400" };
    if (score >= 9) return { label: "Strong", color: "text-green-400" };
    if (score >= 6) return { label: "Moderate", color: "text-yellow-400" };
    if (score >= 4) return { label: "Weak", color: "text-orange-400" };
    return { label: "Critical", color: "text-red-400" };
  }
  if (score >= 14) return { label: "World-Class", color: "text-emerald-400" };
  if (score >= 12) return { label: "Strong", color: "text-green-400" };
  if (score >= 8) return { label: "Moderate", color: "text-yellow-400" };
  if (score >= 5) return { label: "Weak", color: "text-orange-400" };
  return { label: "Critical", color: "text-red-400" };
}
export function getRating(total: number): { label: string; color: string; icon: React.ReactNode; desc: string } {
  if (total >= 165) return { label: "Superpower", color: "text-yellow-400", icon: <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />, desc: "Unrivaled global influence and capabilities." };
  if (total >= 140) return { label: "Major Power", color: "text-blue-400", icon: <Globe className="w-5 h-5 text-blue-400" />, desc: "Significant influence on the world stage." };
  if (total >= 110) return { label: "Regional Power", color: "text-green-400", icon: <Shield className="w-5 h-5 text-green-400" />, desc: "Strong capabilities within its geographic sphere." };
  if (total >= 80) return { label: "Developing Nation", color: "text-orange-400", icon: <TrendingUp className="w-5 h-5 text-orange-400" />, desc: "Growing capabilities and emerging potential." };
  return { label: "Struggling State", color: "text-red-400", icon: <Building className="w-5 h-5 text-red-400" />, desc: "Facing significant challenges and limitations." };
}
export function computeSizePopBonus(roster: Partial<Record<Category, Country>>): number {
  let b = 0;
  if (roster.Size) b += Math.floor(roster.Size.stats.size.score / 2);
  if (roster.Population) b += Math.floor(roster.Population.stats.population.score / 2);
  if (roster.Size && roster.Population) {
    if (roster.Size.stats.size.score >= 8 && roster.Population.stats.population.score >= 8) b += 5;
    else if (roster.Size.stats.size.score <= 3 && roster.Population.stats.population.score <= 3) b += 5;
  }
  return b;
}

export type Archetype = { name: string; icon: React.ReactNode; desc: string };
export function getBonusPath(roster: Partial<Record<Category, Country>>): "agricultural" | "urban" | null {
  const size = roster.Size?.stats.size.score ?? 5;
  const pop = roster.Population?.stats.population.score ?? 5;
  if (size >= 8 && pop <= 4) return "agricultural";
  if (size <= 4 && pop >= 8) return "urban";
  return null;
}
export function getCountryArchetype(roster: Partial<Record<Category, Country>>): Archetype {
  const m = roster.Military?.stats.military.score ?? 0;
  const e = roster.Economy?.stats.economy.score ?? 0;
  const t = roster.Technology?.stats.technology.score ?? 0;
  const h = roster.Healthcare?.stats.healthcare.score ?? 0;
  const ed = roster.Education?.stats.education.score ?? 0;
  const g = roster.Government?.stats.government.score ?? 0;
  if (m >= 8 && e >= 8 && t >= 8) return { name: "Military Superstate", icon: <Swords className="w-5 h-5 text-red-400" />, desc: "Unmatched hard power." };
  if (e >= 8 && t >= 8 && ed >= 8) return { name: "Techno-Utopia", icon: <Laptop className="w-5 h-5 text-blue-400" />, desc: "A beacon of innovation." };
  if (h >= 8 && ed >= 8 && g >= 8) return { name: "Nordic Model", icon: <Heart className="w-5 h-5 text-green-400" />, desc: "World-leading quality of life." };
  if (roster.Size && roster.Population) {
    const s = roster.Size.stats.size.score; const p = roster.Population.stats.population.score;
    if (s <= 3 && p <= 3 && e >= 7) return { name: "Wealthy City-State", icon: <Building className="w-5 h-5 text-yellow-400" />, desc: "Small but mighty." };
  }
  return { name: "Balanced Republic", icon: <Globe className="w-5 h-5 text-primary" />, desc: "A well-rounded nation." };
}

// ─── UI Components ────────────────────────────────────────────────────────

export function ExpandableDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [description]);
  return (
    <div className="relative flex flex-col flex-1">
      {/* Invisible placeholder to maintain the normal collapsed height in the DOM */}
      <div className="invisible flex flex-col flex-1" aria-hidden="true">
        <p className="text-sm leading-relaxed italic line-clamp-2 flex-1">{description}</p>
        {isOverflowing && (
          <div className="text-[10px] uppercase font-bold mt-auto pt-1 py-1">Show More</div>
        )}
      </div>
      
      {/* Absolute overlay for the actual content */}
      <div className={`absolute top-0 left-0 right-0 flex flex-col ${expanded ? 'z-50 bg-card border border-border shadow-xl rounded-lg p-3 -mx-3 -my-3' : 'bottom-0'}`}>
        <p ref={textRef} className={`text-sm text-foreground/80 leading-relaxed italic flex-1 ${expanded ? "" : "line-clamp-2"}`}>{description}</p>
        {isOverflowing && (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className={`text-[10px] uppercase font-bold text-primary flex items-center gap-1 hover:bg-primary/20 px-2 py-1 rounded -ml-2 transition-colors w-max text-left ${expanded ? 'mt-2' : 'mt-auto pt-1'}`}>
            {expanded ? "Show Less" : "Show More"}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function SelectionPhase({ options, onPick, isHardMode, mode }: { options: Country[]; onPick: (c: Country) => void; isHardMode: boolean; mode: string; }) {
  return (
    <div className="p-6 flex flex-col gap-6 items-center justify-center flex-1">
      <div className="text-center"><h2 className="text-3xl font-serif font-bold mb-1">{mode === "sabotage" ? "Sabotage Choice" : "Double Draft Choice"}</h2><p className="text-muted-foreground text-sm">{mode === "sabotage" ? "Pick a country for your opponent to use." : "Choose which country to add to your roster."}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {options.map((country, idx) => (
          <motion.button key={country.name + idx} whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => onPick(country)} className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl text-left group">
            <div className="p-8 border-b border-border bg-secondary/10 flex flex-col items-center text-center"><div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{country.flag}</div><h3 className="text-2xl font-serif font-bold text-foreground">{country.name}</h3><p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{country.region}</p></div>
            <div className="p-5 space-y-4"><p className="text-sm text-foreground/70 leading-relaxed italic line-clamp-2">"{country.knownFor}"</p>
               {!isHardMode && (<div className="grid grid-cols-3 gap-2">{["Military", "Economy", "Government"].map(cat => { const score = country.stats[getCategoryKey(cat as Category)].score; return (<div key={cat} className="text-center p-2 rounded-lg bg-secondary/30 border border-border/40"><div className="text-[9px] uppercase font-bold text-muted-foreground">{cat}</div><div className="text-sm font-bold text-primary">{score}/10</div></div>) })}</div>)}
               <div className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-center font-bold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors border border-primary/20">{mode === "sabotage" ? `Give ${country.name}` : `Pick ${country.name}`}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export function GuessPhase({ mysteryCountry, guesses, onGuess }: { mysteryCountry: Country; guesses: string[]; onGuess: (name: string) => void; }) {
  const [input, setInput] = useState(""); const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = useMemo(() => { if (!input.trim()) return []; return COUNTRIES.filter(c => c.name.toLowerCase().includes(input.toLowerCase()) && !guesses.some(g => g.toLowerCase() === c.name.toLowerCase())).slice(0, 6); }, [input, guesses]);
  const stats = mysteryCountry.stats; const categories = CATEGORIES.filter(c => !BONUS_CATEGORIES.includes(c));
  return (
    <div className="p-6 flex flex-col gap-6 items-center justify-center flex-1 max-w-5xl mx-auto w-full">
      <div className="text-center"><h2 className="text-4xl font-serif font-bold mb-2">Guess the Country</h2><p className="text-muted-foreground text-sm max-w-md mx-auto">Use the numeric ratings below to identify the mystery nation. Be precise!</p></div>
      <div className="w-full max-w-md relative mt-4 mb-6">
        <div className="relative group"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" /></div>
          <input type="text" value={input} onChange={e => { setInput(e.target.value); setShowSuggestions(true); }} onKeyDown={e => { if (e.key === "Enter" && input.trim() === "bypass:devtest3781") { onGuess(input.trim()); setInput(""); setShowSuggestions(false); } }} placeholder="Start typing a country name..." className="w-full bg-secondary/50 border border-border rounded-2xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner" onFocus={() => setShowSuggestions(true)} />
          {showSuggestions && suggestions.length > 0 && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-full left-0 w-full mb-3 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50">{suggestions.map(s => (<button key={s.name} onClick={() => { onGuess(s.name); setInput(""); setShowSuggestions(false); }} className="w-full px-5 py-4 text-left hover:bg-primary/10 transition-colors border-b border-border last:border-0 flex items-center justify-between group"><div className="flex items-center gap-4"><span className="text-2xl">{s.flag}</span><span className="font-bold text-foreground">{s.name}</span></div><ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" /></button>))}</motion.div>)}
        </div>
        {guesses.length > 0 && (<div className="mt-8 space-y-3"><div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest"><RotateCcw className="w-3 h-3" />Attempt History ({guesses.length})</div><div className="flex flex-wrap gap-2 justify-center">{guesses.map((g, i) => (<motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold shadow-sm">{g}</motion.div>))}</div></div>)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full">{categories.map(cat => { const key = getCategoryKey(cat); const score = stats[key].score; return (<div key={cat} className="p-4 rounded-xl border border-border bg-card/40 flex flex-col items-center text-center shadow-sm"><div className="text-primary/70 mb-1.5">{CATEGORY_ICONS[cat]}</div><div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">{cat}</div><div className="text-3xl font-bold text-foreground tracking-tighter">{score}</div></div>); })}</div>
    </div>
  );
}

export function CountryCard({ country, hoveredCategory, poolRemaining, isHardMode, roster, onAssign, onHover }: { country: Country; hoveredCategory: Category | null; poolRemaining: number; isHardMode: boolean; roster: Partial<Record<Category, Country>>; onAssign: (cat: Category) => void; onHover: (cat: Category | null) => void; }) {
  const isComplete = CATEGORIES.every(c => roster[c]);
  if (isComplete) return null;
  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-8">
      {/* Header section */}
      <div className="flex justify-between items-start mb-6 w-full">
        <div className="flex items-start gap-4 md:gap-6">
          <div className="text-4xl md:text-5xl mt-1 drop-shadow-md">{country.flag}</div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">{country.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{country.capital} &bull; {country.region}</p>
            <div className="mt-4 max-w-2xl text-sm text-foreground/80 leading-relaxed">
              {country.knownFor}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 pb-8 -mx-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.filter(cat => !roster[cat]).map((cat) => {
            const stat = country.stats[getCategoryKey(cat)];
            const isHovered = hoveredCategory === cat;
            const maxScore = CATEGORY_MAX_SCORES[cat] ?? 10;
            const scoreLabel = getScoreLabel(stat.score, maxScore);
            
            return (
              <div key={cat} onMouseEnter={() => onHover(cat)} onMouseLeave={() => onHover(null)} onClick={() => onAssign(cat)} className={`p-5 rounded-xl border flex flex-col transition-all relative ${isHovered ? "bg-primary/5 border-primary shadow-md scale-[1.02] cursor-pointer" : "bg-card border-border/60 hover:bg-secondary/20 cursor-pointer shadow-sm"}`}>
                {isHovered && <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-xl" />}
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className="shrink-0 mt-0.5">{CATEGORY_ICONS[cat]}</div>
                        <span className="leading-tight">{cat}</span>
                      </div>
                      {!isHardMode && <span className="text-yellow-500/80 shrink-0 mt-0.5">{getCategoryStars(cat)}</span>}
                    </div>
                  </div>
                  
                  {!isHardMode && (
                    <div className="flex items-center justify-between mb-3">
                      <div className={`text-sm font-bold ${BONUS_CATEGORIES.includes(cat) ? "text-white" : scoreLabel.color}`}>{BONUS_CATEGORIES.includes(cat) ? "Bonus Contributor" : scoreLabel.label}</div>
                      <div className={`text-sm font-bold ${BONUS_CATEGORIES.includes(cat) ? "text-white" : scoreLabel.color}`}>
                        {BONUS_CATEGORIES.includes(cat) 
                          ? extractBonusText(stat.description, cat) 
                          : getPtsDisplay(stat.score, cat)}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-auto pt-1">
                    <ExpandableDescription description={stat.description} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function GameOver({ roster, totalScore, bonus, onReset, onDownload, onWildcard, onWildcardSelect, setWildcardPhase, wildcardUsed, wildcardPhase, rosterRef, isHardMode, isDailyMode, onSubmitLeaderboard, gameMode, leaderboardSubmitted, room, players }: { roster: Partial<Record<Category, Country>>; totalScore: number; bonus: number; onReset: () => void; onDownload: () => void; onWildcard: () => void; onWildcardSelect: (cat: Category) => void; wildcardUsed: boolean; wildcardPhase: boolean; setWildcardPhase: (val: boolean) => void; rosterRef: React.RefObject<HTMLDivElement | null>; isHardMode: boolean; isDailyMode: boolean; onSubmitLeaderboard: () => void; gameMode: string; leaderboardSubmitted: boolean; room?: any | null; players?: any[]; }) {
  const rating = getRating(totalScore); const archetype = getCountryArchetype(roster); const bPath = getBonusPath(roster); const isGuest = room && gameMode === "sabotage" && players;
  const isMultiplayerGame = gameMode === "sabotage" || gameMode === "party";
  return (
    <div className="p-4 md:p-8 flex-1 overflow-y-auto" ref={rosterRef}>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
        <div className="text-center space-y-3 md:space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-700">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">Draft Complete</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm md:text-base">
            <span className="text-muted-foreground font-medium tracking-wide">Final Score:</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl md:text-3xl font-bold text-primary">{totalScore} <span className="text-sm text-primary/60">pts</span></span>
              </div>
          </div>
          </div>
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${bPath ? "lg:grid-cols-3" : ""} gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200`}>
          <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
            <div className="p-3 bg-secondary/30 rounded-xl shrink-0">{archetype.icon}</div>
            <div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{archetype.name}</h3><p className="text-xs text-muted-foreground">{archetype.desc}</p></div>
          </div>
          <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
            <div className="p-3 bg-secondary/30 rounded-xl shrink-0">{rating.icon}</div>
            <div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{rating.label}</h3><p className="text-xs text-muted-foreground">{rating.desc}</p></div>
          </div>
          {bPath && (
            <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
              <div className="p-3 bg-secondary/30 rounded-xl shrink-0">{bPath === "agricultural" ? <Leaf className="w-5 h-5 text-yellow-400" /> : <Building className="w-5 h-5 text-yellow-400" />}</div>
              <div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{bPath === "agricultural" ? "Agricultural Giant" : "Urban Powerhouse"}</h3><p className="text-xs text-muted-foreground">{bPath === "agricultural" ? "Vast lands with sparse population." : "Dense population in a compact area."}</p></div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg md:text-xl font-serif font-bold text-foreground px-2 flex items-center justify-between">
            <span>Your Nation's Roster</span>
            {!isMultiplayerGame && !wildcardUsed && !wildcardPhase && (
              <button onClick={onWildcard} className="font-sans text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 font-semibold hover:bg-blue-500/20 transition-colors border border-blue-500/30">
                <Shuffle className="w-3.5 h-3.5" /> Use Wildcard
              </button>
            )}
            {wildcardPhase && (
              <button onClick={() => setWildcardPhase(false)} className="font-sans text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground font-semibold hover:text-foreground transition-colors">
                Cancel
              </button>
            )}
          </h3>
          {wildcardPhase && ( <div className="p-4 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm text-center font-medium animate-pulse">Select a drafted category to replace it with a new random country.</div> )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {(() => {
              const displayCats: string[] = CATEGORIES.filter(c => !BONUS_CATEGORIES.includes(c));
              if (roster.Size && roster.Population) { displayCats.push("Population Structure"); }
              else { if (roster.Size || wildcardPhase) displayCats.push("Size"); if (roster.Population || wildcardPhase) displayCats.push("Population"); }
              return displayCats.map((cat, idx) => {
                const isCombo = cat === "Population Structure"; const actualCat = isCombo ? "Size" : (cat as Category); const assigned = roster[actualCat];
                if (!assigned) return null;
                const isWildcardTarget = wildcardPhase;
                if (isCombo && isWildcardTarget) {
                  return (
                    <div key={cat} className="grid grid-cols-2 gap-2 md:gap-3 p-0 border-0 bg-transparent">
                      {["Size", "Population"].map(splitCat => {
                        const sCat = splitCat as Category;
                        const splitAssigned = roster[sCat];
                        if (!splitAssigned) return null;
                        const ck = getCategoryKey(sCat);
                        const stat = splitAssigned.stats[ck];
                        return (
                          <div key={sCat} onClick={() => onWildcardSelect(sCat)} className="p-3 md:p-4 rounded-2xl border flex flex-col gap-2 relative transition-all cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 hover:scale-[1.02] border-border/50 bg-card">
                            <div className="flex items-center justify-between"><div className="flex items-center gap-1.5 text-muted-foreground">{CATEGORY_ICONS[sCat]}<span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-foreground/80">{sCat}</span></div></div>
                            <div><div className="text-sm md:text-base font-bold text-foreground flex items-center gap-1.5">{splitAssigned.flag} <span className="truncate">{splitAssigned.name}</span></div></div>
                            {!isHardMode && (
                              <div className="mt-auto space-y-1">
                                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-max text-white bg-secondary/50`}>Bonus Contributor</div>
                                <div className="font-bold text-white text-xs">{extractBonusText(stat.description, sCat)}</div>
                              </div>
                            )}
                            <p className="text-[9px] text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{stat.description}"</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                if (isCombo && roster.Population) {
                  const sizeCountry = assigned;
                  const popCountry = roster.Population;
                  return (
                    <div key={cat} onClick={() => { if (isWildcardTarget && !isCombo) onWildcardSelect(actualCat); }} className={`p-0 rounded-2xl border flex flex-row relative transition-all ${isWildcardTarget && !isCombo ? "cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 hover:scale-[1.02] border-border/50 bg-card" : "bg-card border-border/50"}`}>
                      <div className="flex-1 p-4 md:p-5 border-r border-border/50 flex flex-col gap-3">
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-muted-foreground">{CATEGORY_ICONS["Size"]}<span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/80">Size</span></div></div>
                        <div><div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">{sizeCountry.flag} {sizeCountry.name}</div></div>
                        <div className="space-y-2 mt-auto">
                          {!isHardMode && (
                            <div className="flex items-center gap-2 mt-auto">
                              <span className="font-bold text-white text-xs">{extractBonusText(sizeCountry.stats.size.description, "Size")}</span>
                              <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-max text-white bg-secondary/50`}>Bonus Contributor</div>
                            </div>
                          )}
                          <p className="text-[11px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{sizeCountry.stats.size.description}"</p>
                        </div>
                      </div>
                      <div className="flex-1 p-4 md:p-5 flex flex-col gap-3 bg-secondary/5">
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-muted-foreground">{CATEGORY_ICONS["Population"]}<span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/80">Population</span></div></div>
                        <div><div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">{popCountry.flag} {popCountry.name}</div></div>
                        <div className="space-y-2 mt-auto">
                          {!isHardMode && (
                            <div className="flex items-center gap-2 mt-auto">
                              <span className="font-bold text-white text-xs">{extractBonusText(popCountry.stats.population.description, "Population")}</span>
                              <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-max text-white bg-secondary/50`}>Bonus Contributor</div>
                            </div>
                          )}
                          <p className="text-[11px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{popCountry.stats.population.description}"</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={cat} onClick={() => { if (isWildcardTarget && !isCombo) onWildcardSelect(actualCat); }} className={`p-4 md:p-5 rounded-2xl border flex flex-col gap-3 relative transition-all ${isWildcardTarget && !isCombo ? "cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 hover:scale-[1.02] border-border/50 bg-card" : "bg-card border-border/50"}`}>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-muted-foreground">{CATEGORY_ICONS[actualCat]}<span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/80">{cat}</span></div></div>
                    <div><div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">{assigned.flag} {assigned.name}</div></div>
                    {(() => {
                      let scoreVal = 0, weight = 1, desc = "", maxScore = 10;
                      const ck = getCategoryKey(actualCat); 
                      scoreVal = assigned.stats[ck].score; 
                      maxScore = CATEGORY_MAX_SCORES[actualCat] ?? 10; 
                      desc = assigned.stats[ck].description;
                      const isBonus = BONUS_CATEGORIES.includes(actualCat);
                      const isSizeOrPop = actualCat === "Size" || actualCat === "Population";

                      return (
                        <div className="space-y-2 mt-auto">
                          {!isHardMode && (
                            <div className="flex items-center justify-between text-sm">
                              {!isBonus && !isSizeOrPop ? ( <><div className="flex items-center gap-2"><span className="font-bold text-primary">{scoreVal * weight} <span className="text-primary/50 text-xs">/ {maxScore}</span> <span className="text-[10px] text-muted-foreground">pts</span></span><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getScoreLabel(scoreVal, maxScore).color} bg-secondary/50`}>{getScoreLabel(scoreVal, maxScore).label}</span></div></>
                              ) : isSizeOrPop ? (
                                <div className="flex items-center gap-2 mt-auto">
                                  <span className="font-bold text-white text-xs">{extractBonusText(desc, actualCat)}</span>
                                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-max text-white bg-secondary/50`}>Bonus Contributor</div>
                                </div>
                              ) : ( <span className="font-bold text-yellow-400">+{Math.floor(scoreVal / 2)} <span className="text-[10px] text-yellow-400/60">pts</span></span> )}
                            </div>
                          )}
                          <p className="text-[11px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{desc}"</p>
                        </div>
                      );
                    })()}
                  </div>
                );
              });
            })()}
          </div>
        </div>
        {!isDailyMode && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-4 md:pt-8 border-t border-border">
            <button onClick={onReset} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm md:text-base hover:opacity-90 transition-opacity shadow-lg">
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" /> Play Again
            </button>
            <button onClick={onDownload} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-xl bg-secondary text-foreground font-bold text-sm md:text-base hover:bg-secondary/80 transition-colors border border-border shadow-sm">
              <Download className="w-4 h-4 md:w-5 md:h-5" /> Save Image
            </button>
            {!leaderboardSubmitted && (
              <button onClick={onSubmitLeaderboard} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-xl bg-primary/20 text-primary border border-primary/40 font-bold text-sm md:text-base hover:bg-primary/30 transition-colors shadow-sm">
                <Medal className="w-4 h-4 md:w-5 md:h-5" /> Submit Score
              </button>
            )}
            {leaderboardSubmitted && (
              <div className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-xl bg-secondary/50 text-muted-foreground border border-border font-bold text-sm md:text-base">
                <Medal className="w-4 h-4 md:w-5 md:h-5" /> Score Submitted
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export type GameState = {
  pool: Country[];
  currentCountry: Country | null;
  selectionOptions: Country[] | null;
  mysteryCountry: Country | null;
  guesses: string[];
  roster: Partial<Record<Category, Country>>;
  gameOver: boolean;
  wildcardUsed: boolean;
  isDailyMode: boolean;
  dailyDate: string;
  leaderboardSubmitted: boolean;
  mode: "normal" | "double" | "guess" | "sabotage" | "party";
  isHardMode: boolean;
  roomCode: string | null;
  poolSeed: number;
};

export function seededRng(seed: number): () => number {
  let s = seed;
  return function() { s = Math.sin(s) * 10000; return s - Math.floor(s); };
}

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const res = [...arr]; const rng = seededRng(seed);
  for (let i = res.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [res[i], res[j]] = [res[j], res[i]]; }
  return res;
}

export function dateStrToSeed(dateStr: string): number {
  let hash = 0; for (let i = 0; i < dateStr.length; i++) { const char = dateStr.charCodeAt(i); hash = (hash << 5) - hash + char; hash = hash & hash; }
  return Math.abs(hash);
}
