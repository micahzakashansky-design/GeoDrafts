import { type Category, type Country } from "@/data/countries";

export function getRawPopulation(desc: string): number {
  const match = desc.match(/^(?:Pre-war\s*)?([\d,.]+)\s*(million|billion|K|M|B)?/i);
  if (!match) return 5000000;
  let val = parseFloat(match[1].replace(/,/g, ''));
  const unit = match[2] ? match[2].toLowerCase() : '';
  if (unit === 'million' || unit === 'm') val *= 1000000;
  if (unit === 'billion' || unit === 'b') val *= 1000000000;
  if (unit === 'k') val *= 1000;
  return val;
}

export function computeSizePopBonus(roster: Partial<Record<Category, Country>>): number {
  if (!roster.Size || !roster.Population) return 0;
  
  const pop = getRawPopulation(roster.Population.stats.population.description);
  const size = roster.Size.area || 100000;
  const rawDensity = pop / size;

  const sCountryPop = getRawPopulation(roster.Size.stats.population.description);
  const s = sCountryPop / size;
  
  const pCountryArea = roster.Population.area || 100000;
  const p = pop / pCountryArea;

  const getScore = (cat: Category) => {
    let statKey = cat.toLowerCase();
    if (cat === "Natural Resources") statKey = "naturalResources";
    if (cat === "International Relationships") statKey = "internationalRelationships";
    
    // @ts-ignore
    const rawScore = roster[cat]?.stats[statKey]?.score || 5;
    
    // Climate, Location, and Tourism are already out of 10, so we don't scale them
    if (cat === "Climate" || cat === "Location" || cat === "Tourism") {
      return rawScore;
    }
    
    // Everything else (out of 12) gets scaled down to 10
    return rawScore * 10 / 12;
  };

  const techScore = getScore("Technology");
  const climateScore = getScore("Climate");
  const locationScore = getScore("Location");
  const intlScore = getScore("International Relationships");
  const eduScore = getScore("Education");
  const healthScore = getScore("Healthcare");
  const tourismScore = getScore("Tourism");

  if (rawDensity < 100) {
    // Agriculture
    const target = 40;
    
    let effectiveDensity = rawDensity;
    if (Math.abs(rawDensity - target) <= 30) {
      effectiveDensity = target;
    } else if (rawDensity > target) {
      effectiveDensity = rawDensity - 30;
    } else {
      effectiveDensity = rawDensity + 30;
    }
    
    const synergy = Math.max(1.0, 2.5 - Math.abs(Math.log10(effectiveDensity / target)));
    const avg = (climateScore + locationScore) / 2;
    return Math.floor(avg * synergy);
  } else if (rawDensity <= 1000) {
    // Generalist
    const diff = Math.max(0.0001, Math.abs(s - p));
    const synergy = Math.min(2.5, 1 + (1 / diff));
    const avg = (intlScore + eduScore + healthScore + climateScore + tourismScore) / 5;
    return Math.floor(avg * synergy);
  } else {
    // Technology
    const target = size < 36193 ? 20000 : 10000;
    
    let effectiveDensity = rawDensity;
    if (Math.abs(rawDensity - target) <= 30) {
      effectiveDensity = target;
    } else if (rawDensity > target) {
      effectiveDensity = rawDensity - 30;
    } else {
      effectiveDensity = rawDensity + 30;
    }
    
    const synergy = Math.max(1.0, 2.5 - Math.abs(Math.log10(effectiveDensity / target)));
    return Math.floor(techScore * synergy);
  }
}

export function getBonusPath(roster: Partial<Record<Category, Country>>): string | null {
  if (!roster.Size || !roster.Population) return null;

  const pop = getRawPopulation(roster.Population.stats.population.description);
  const size = roster.Size.area || 100000;
  const rawDensity = pop / size;
  
  const techScore = roster.Technology?.stats.technology?.score || 0;
  const resourcesScore = roster["Natural Resources"]?.stats.naturalResources?.score || 0;
  const climateScore = roster.Climate?.stats.climate?.score || 0;
  const geoScore = roster.Climate?.stats.climate?.score || 0;
  const econScore = roster.Economy?.stats.economy?.score || 0;
  const eduScore = roster.Education?.stats.education?.score || 0;

  // New bonus paths conditions (overrides)
  if (rawDensity > 1000 && geoScore >= 8) return "Trade Hub";
  if (size > 2000000 && rawDensity < 5) return "Nomadic Steppe";
  if (eduScore >= 8 && techScore >= 8 && resourcesScore <= 3) return "Service Economy";
  if (pop > 100000000 && resourcesScore >= 8 && rawDensity > 50 && rawDensity < 500) return "Manufacturing Powerhouse";
  if (size <= 10000 && pop <= 1000000 && econScore >= 9) return "Tax Haven";
  if (climateScore >= 9 && geoScore >= 8) return "Tourism Mecca";
  if (size <= 50000 && geoScore >= 9) return "Strategic Chokepoint";
  if (climateScore <= 3 && pop > 50000000) return "Wasteland Survival";
  if (climateScore <= 4 && geoScore >= 8 && rawDensity < 20) return "Frozen Fortress";
  if (size > 1500000 && climateScore >= 7 && pop > 80000000) return "Agrarian Giant";

  // Density Synergy Archetypes
  if (rawDensity < 100) return "Agricultural society";
  if (rawDensity <= 1000) return "Generalist";
  return "Tech Megacity";
}

export function getCountryArchetype(roster: Partial<Record<Category, Country>>): string {
  const m = roster.Military?.stats.military?.score ?? 0;
  const e = roster.Economy?.stats.economy?.score ?? 0;
  const t = roster.Technology?.stats.technology?.score ?? 0;
  const h = roster.Healthcare?.stats.healthcare?.score ?? 0;
  const ed = roster.Education?.stats.education?.score ?? 0;
  const g = roster.Government?.stats.government?.score ?? 0;
  // Fallbacks for optional categories in some game modes
  const tour = roster.Tourism?.stats.tourism?.score ?? 5;
  const ind = roster.Economy?.stats.economy?.score ?? 5;
  const res = roster["Natural Resources"]?.stats.naturalResources?.score ?? 5;
  const cli = roster.Climate?.stats.climate?.score ?? 5;
  const geo = roster.Climate?.stats.climate?.score ?? 5;
  
  const size = roster.Size?.area || 100000; 
  const pop = roster.Population ? getRawPopulation(roster.Population.stats.population.description) : 5000000;

  // New Archetypes
  if (tour >= 8 && e >= 8 && ed >= 8) return "Cultural Hegemon";
  if (res >= 8 && e >= 8 && ind >= 8) return "Industrial Juggernaut";
  if (m >= 8 && geo >= 8 && tour <= 4) return "Fortress State";
  if (t >= 9 && g >= 9) return "Cyberocracy";
  if (cli >= 9 && h >= 8 && ind <= 4) return "Eco-Paradise";
  if (e >= 8 && geo >= 8 && g >= 8) return "Trade Empire";
  if (h >= 8 && ed >= 8 && t >= 8) return "Global Medic";
  if (ed >= 9 && t >= 9) return "Knowledge Hub";
  if (res >= 9 && g <= 4 && e <= 5) return "Resource Curse";
  if (m >= 9 && h <= 5 && ed <= 5) return "Spartan Society";

  // Existing Archetypes
  if (m >= 8 && e >= 8 && t >= 8) return "Military Superstate";
  if (e >= 8 && t >= 8 && ed >= 8) return "Techno-Utopia";
  if (h >= 8 && ed >= 8 && g >= 8) return "Nordic Model";
  if (size <= 50000 && pop <= 15000000 && e >= 7) return "Wealthy City-State";
  
  return "Balanced Republic";
}

export function getRating(total: number): string {
  // 15 ratings total (5 old + 10 new)
  if (total >= 180) return "Global Hegemon";
  if (total >= 170) return "Hyperpower";
  if (total >= 165) return "Superpower";
  if (total >= 150) return "Great Power";
  if (total >= 140) return "Major Power";
  if (total >= 125) return "Middle Power";
  if (total >= 110) return "Regional Power";
  if (total >= 100) return "Emerging Power";
  if (total >= 90) return "Stable Nation";
  if (total >= 80) return "Developing Nation";
  if (total >= 70) return "Transitional State";
  if (total >= 60) return "Fragile State";
  if (total >= 45) return "Failed State";
  if (total >= 30) return "Collapsed State";
  return "Struggling State";
}
