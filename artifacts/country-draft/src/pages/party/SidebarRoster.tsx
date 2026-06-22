import { computeSizePopBonus } from "@/lib/achievements-logic";
import React from "react";
import { Category, Country, CATEGORIES, getCategoryKey } from "@/data/countries";
import { CATEGORY_ICONS, getCategoryStars, getPtsDisplay, BONUS_CATEGORIES } from "./PartyUI";
import { Users, Plus } from "lucide-react";

export function SidebarRoster({ roster, isHardMode , categoryTimes}: { roster: Partial<Record<Category, Country>>; isHardMode?: boolean ; categoryTimes?: Partial<Record<Category, number>>; }) {
  const assignedCategories = CATEGORIES.filter((c: Category) => roster[c]);
  const hasSizeAndPop = roster["Size"] && roster["Population"];

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="border-b border-border/50 pb-2 mb-3 px-1 shrink-0">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your Nation's Roster</h3>
      </div>
      <div className="space-y-1.5 flex-1 overflow-y-auto">
        {Object.keys(roster).length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full pb-12 mt-12">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground/90 mb-1">Your roster is empty</p>
            <p className="text-xs text-muted-foreground">Pick a category to build up your<br/>nation!</p>
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
            const score = !isBonus ? (assigned.stats[catKey].score ?? 0) : null;

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
                    {!isBonus && score !== null && !isHardMode && (
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
                {!isHardMode && <span className="text-[10px] font-bold text-yellow-500">+{computeSizePopBonus(roster)} pts</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
