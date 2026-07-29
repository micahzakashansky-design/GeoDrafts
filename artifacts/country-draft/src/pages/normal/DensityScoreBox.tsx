import React, { useState } from "react";
import { type Category, type Country } from "@/data/countries";
import { computeBetaSizePopBonus, getDensityBreakdown } from "@/lib/beta-logic";
import { Info, X, Map, Users, TrendingUp, AlertTriangle, TrendingDown, CheckCircle2 } from "lucide-react";

export function DensityScoreBox({
  roster,
  isHardMode = false,
  isBetaMode = false,
}: {
  roster: Partial<Record<Category, Country>>;
  isHardMode?: boolean;
  isBetaMode?: boolean;
}) {
  const [showInfo, setShowInfo] = useState(false);

  if (!isBetaMode) return null;

  const hasSize = !!roster.Size;
  const hasPop = !!roster.Population;
  const hasEcon = !!roster.Economy;

  // Show if at least one of the 3 key categories is drafted
  const hasOneOfThree = hasSize || hasPop || hasEcon;
  const allThree = hasSize && hasPop && hasEcon;

  if (!hasOneOfThree) return null;

  const breakdown = allThree ? getDensityBreakdown(roster) : null;

  const categories = [
    { id: "Size" as Category, name: "Size", icon: <Map className="w-3.5 h-3.5" />, country: roster.Size },
    { id: "Population" as Category, name: "Population", icon: <Users className="w-3.5 h-3.5" />, country: roster.Population },
    { id: "Economy" as Category, name: "Economy", icon: <TrendingUp className="w-3.5 h-3.5" />, country: roster.Economy },
  ];

  return (
    <div className="w-full mt-3 rounded-2xl border border-blue-500/30 bg-card p-4 text-left relative shadow-sm space-y-3">
      {/* Header with (i) button on top right */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Population Density Breakdown
          </span>
        </div>
        <button
          onClick={() => setShowInfo(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold text-xs border border-blue-500/40 transition-colors cursor-pointer"
          title="Scoring & Equation Info"
        >
          <Info className="w-3.5 h-3.5" />
          <span>(i)</span>
        </button>
      </div>

      {/* Grid of the 3 core categories */}
      <div className="grid grid-cols-3 gap-2">
        {categories.map((cat) => {
          const isDrafted = !!cat.country;
          return (
            <div
              key={cat.id}
              className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                isDrafted
                  ? "border-blue-500/40 bg-card text-foreground"
                  : "border-dashed border-border/60 bg-muted/20 opacity-40 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-1">
                <span className={isDrafted ? "text-blue-400" : "text-muted-foreground"}>{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </div>
              {isDrafted ? (
                <div className="text-xs font-bold truncate">
                  {cat.country!.flag} {cat.country!.name}
                  {cat.id === "Economy" && cat.country!.stats.economy.industryType && (
                    <div className="text-[9px] text-blue-400 font-semibold mt-0.5">
                      Ind. {cat.country!.stats.economy.industryType}/5
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] italic">Not drafted</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Breakdown Analysis when all 3 categories are drafted */}
      {!allThree ? (
        <p className="text-xs text-muted-foreground font-medium text-center mt-2 italic pt-1">
          Draft Size, Population, and Economy to complete your Population Density Breakdown
        </p>
      ) : breakdown ? (
        <div className="space-y-4 pt-3 border-t border-border/60">
          {/* Actual vs Target Density & Bonus Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Actual Density (x)</span>
              <div className="mt-1">
                <span className="text-base font-black text-foreground">
                  {breakdown.actualDensity < 1 ? breakdown.actualDensity.toFixed(2) : Math.round(breakdown.actualDensity).toLocaleString()}
                </span>
                <span className="text-[10px] font-normal text-muted-foreground block">ppl/km²</span>
              </div>
              <span className="text-[9px] text-muted-foreground/80 mt-1 italic truncate">
                {breakdown.popCountryFlag} {breakdown.sizeCountryFlag} Pop / Area
              </span>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-blue-400 uppercase">Target Capacity</span>
              <div className="mt-1">
                <span className="text-base font-black text-blue-400">
                  {breakdown.idealTargetDensity < 1 ? breakdown.idealTargetDensity.toFixed(2) : Math.round(breakdown.idealTargetDensity).toLocaleString()}
                </span>
                <span className="text-[10px] font-normal text-blue-400/80 block">ppl/km²</span>
              </div>
              <span className="text-[9px] text-blue-400/80 mt-1 italic">
                Formula Target
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Synergy Bonus</span>
              <div className="mt-1">
                <span className="text-base font-black text-emerald-400">+{breakdown.bonusPoints}</span>
                <span className="text-[10px] font-normal text-emerald-400/80 block">pts (max 25)</span>
              </div>
              <span className="text-[9px] text-emerald-400/80 mt-1 italic">
                Gaussian Fit
              </span>
            </div>
          </div>

          {/* Status Badge & Diagnostic Analysis */}
          <div className="p-3 rounded-xl border bg-muted/20 space-y-1.5">
            <div className="flex items-center gap-1.5">
              {breakdown.status === "too_high" && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Density Too High (Overcrowded)</span>
                </span>
              )}
              {breakdown.status === "too_low" && (
                <span className="flex items-center gap-1 text-xs font-bold text-sky-400">
                  <TrendingDown className="w-4 h-4 shrink-0" />
                  <span>Density Too Low (Underpopulated)</span>
                </span>
              )}
              {breakdown.status === "optimal" && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Optimal Density Synergy</span>
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {breakdown.analysisText}
            </p>
          </div>

          {/* Detailed Contributing Factors Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span>Contributing Stat Factors & Impact:</span>
              <span className="text-[10px] text-muted-foreground font-normal">Formula Term & Effect</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {breakdown.factors.map((factor) => (
                <div
                  key={factor.symbol}
                  className="p-3 rounded-xl border border-border/60 bg-card/60 flex flex-col justify-between space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${factor.badgeColor}`}>
                        {factor.symbol}
                      </span>
                      <span className="text-xs font-bold text-foreground truncate">{factor.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-foreground">{factor.statValue}</span>
                  </div>

                  <div className="text-[11px] font-medium text-muted-foreground flex items-center justify-between gap-1">
                    <span className="truncate">{factor.countryFlag} {factor.countryName}</span>
                    <span className="font-mono text-[10px] font-bold text-primary shrink-0">{factor.formulaTerm}</span>
                  </div>

                  <p className="text-[10px] text-muted-foreground/90 leading-tight border-t border-border/40 pt-1 mt-0.5">
                    {factor.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Info Modal explaining equation & factors */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-4 text-left">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Population Density Breakdown</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              In <strong className="text-foreground">BETA 1.0</strong>, your nation earns up to <strong className="text-emerald-400">25 bonus points</strong> based on how closely your actual population density matches your ideal target density capacity!
            </p>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 font-mono text-xs text-foreground space-y-2">
              <div className="font-bold text-blue-400">Equation:</div>
              <div className="bg-card p-3 rounded-lg border border-border text-center font-bold text-xs text-primary overflow-x-auto">
                y = 25 &bull; e<sup>-0.5 &bull; ((x - Target) / 4000)<sup>2</sup></sup>
              </div>
              <div className="text-[11px] text-muted-foreground leading-normal mt-1">
                <strong>x</strong> = Actual Density = (Population / Size land area)<br/>
                <strong>Target</strong> = 150 &bull; (I<sup>1.5</sup> &bull; T<sup>0.75</sup> &bull; E<sup>0.15</sup>) / (C<sup>0.05</sup> &bull; R<sup>0.05</sup> &bull; S<sup>0.25</sup>)
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="font-bold text-foreground mb-1">Variable Key:</div>
              <div>• <strong className="text-foreground">I</strong>: Industry Type (1–5) from Economy (Multiplier: I<sup>1.5</sup>)</div>
              <div>• <strong className="text-foreground">T</strong>: Technology score (Multiplier: T<sup>0.75</sup>)</div>
              <div>• <strong className="text-foreground">E</strong>: Economy score (Multiplier: E<sup>0.15</sup>)</div>
              <div>• <strong className="text-foreground">S</strong>: Size score (Divisor: S<sup>0.25</sup>)</div>
              <div>• <strong className="text-foreground">C</strong>: Climate score (Divisor: C<sup>0.05</sup>)</div>
              <div>• <strong className="text-foreground">R</strong>: Natural Resources score (Divisor: R<sup>0.05</sup>)</div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity mt-2 cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
