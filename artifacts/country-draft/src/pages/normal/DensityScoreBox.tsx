import React, { useState } from "react";
import { type Category, type Country } from "@/data/countries";
import { computeBetaSizePopBonus } from "@/lib/beta-logic";
import { Info, X, Map, Users, TrendingUp } from "lucide-react";

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

  const bonus = computeBetaSizePopBonus(roster);

  const categories = [
    { id: "Size" as Category, name: "Size", icon: <Map className="w-3.5 h-3.5" />, country: roster.Size },
    { id: "Population" as Category, name: "Population", icon: <Users className="w-3.5 h-3.5" />, country: roster.Population },
    { id: "Economy" as Category, name: "Economy", icon: <TrendingUp className="w-3.5 h-3.5" />, country: roster.Economy },
  ];

  return (
    <div className="w-full mt-3 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 text-left relative shadow-sm">
      {/* Header with (i) button on top right */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Population Density Score
          </span>
        </div>
        <button
          onClick={() => setShowInfo(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold text-xs border border-blue-500/40 transition-colors cursor-pointer"
          title="Scoring Info"
        >
          <Info className="w-3.5 h-3.5" />
          <span>(i)</span>
        </button>
      </div>

      {/* Grid of the 3 categories */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {categories.map((cat) => {
          const isDrafted = !!cat.country;
          return (
            <div
              key={cat.id}
              className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                isDrafted
                  ? "border-blue-500/40 bg-card/80 text-foreground"
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

      {/* Text below the box */}
      {!allThree ? (
        <p className="text-xs text-muted-foreground font-medium text-center mt-2 italic">
          fill out these categories to get a population density score
        </p>
      ) : (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-500/20">
          <span className="text-xs font-bold text-foreground">Density Bonus</span>
          {!isHardMode && (
            <span className="text-sm font-black text-blue-400">+{bonus} pts</span>
          )}
        </div>
      )}

      {/* Info Modal explaining how density scoring works */}
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
              <h3 className="text-xl font-bold text-foreground">Population Density Scoring</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              In <strong className="text-foreground">BETA 1.0</strong>, your nation earns up to <strong className="text-blue-400">25 bonus points</strong> based on how closely your drafted population density matches your ideal target density!
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
              <div>• <strong className="text-foreground">I</strong>: Industry Type (1–5) from Economy</div>
              <div>• <strong className="text-foreground">T</strong>: Technology score</div>
              <div>• <strong className="text-foreground">E</strong>: Economy score</div>
              <div>• <strong className="text-foreground">S</strong>: Size score</div>
              <div>• <strong className="text-foreground">C</strong>: Climate score</div>
              <div>• <strong className="text-foreground">R</strong>: Natural Resources score</div>
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
