import React from "react";
import { Category, Country, CATEGORIES, getCategoryKey } from "@/data/countries";
import { CATEGORY_ICONS, getCategoryStars, getPtsDisplay, computeSizePopBonus, BONUS_CATEGORIES } from "./GameShared";
import { Users } from "lucide-react";

export function SidebarRoster({ roster }: { roster: Partial<Record<Category, Country>> }) {
  const assignedCategories = CATEGORIES.filter((c: Category) => roster[c]);
  const hasSizeAndPop = roster["Size"] && roster["Population"];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-foreground">Your Roster</h3>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {Object.keys(roster).length}/{CATEGORIES.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {Object.keys(roster).length === 0 ? (
          <div className="py-6 text-center rounded-xl border border-dashed border-border/50 bg-secondary/10">
            <p className="text-xs text-muted-foreground font-medium">Select a category on the right<br />to begin drafting.</p>
          </div>
        ) : (
          assignedCategories.map((category: Category) => {
            // If both Size and Pop are present, hide them individually and render a combined card below.
            if (hasSizeAndPop && (category === "Size" || category === "Population")) {
              return null;
            }

            const assigned = roster[category]!;
            const catKey = getCategoryKey(category);
            const isBonus = BONUS_CATEGORIES.includes(category);
            const stars = getCategoryStars(category);
            const score = !isBonus ? assigned.stats[catKey].score : null;

            return (
              <div key={category} className="w-full rounded-lg border border-border/25 bg-muted/10 opacity-80 text-left transition-all">
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-muted-foreground shrink-0">{CATEGORY_ICONS[category]}</span>
                    <div className="truncate">
                      <div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground truncate">{category}</div>
                      <div className="text-xs font-semibold text-foreground/80 truncate">{assigned.flag} {assigned.name}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[9px] text-yellow-400/40">{stars}</span>
                    {!isBonus && score !== null && (
                      <span className="text-[10px] font-bold text-primary">{getPtsDisplay(score, category)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {hasSizeAndPop && (
          <div key="Population Structure" className="w-full rounded-lg border border-yellow-500/30 bg-yellow-500/10 opacity-90 text-left transition-all">
            <div className="px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-yellow-500 shrink-0"><Users className="w-4 h-4" /></span>
                <div className="truncate">
                  <div className="text-[10px] font-bold uppercase tracking-tight text-yellow-500/80 truncate">Population Structure</div>
                  <div className="text-xs font-semibold text-foreground/80 truncate mt-0.5">
                    {roster["Size"]?.flag} {roster["Size"]?.name}
                  </div>
                  <div className="text-xs font-semibold text-foreground/80 truncate mt-0.5">
                    {roster["Population"]?.flag} {roster["Population"]?.name}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] font-bold text-yellow-500">+{computeSizePopBonus(roster)} pts</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
