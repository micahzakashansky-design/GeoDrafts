import { type Category, type Country } from "@/data/countries";
import { getRawPopulation } from "./achievements-logic";

export function getRawArea(country?: Country): number {
  if (country?.area) return country.area;
  if (!country?.stats?.size?.description) return 100000;
  const desc = country.stats.size.description;
  const match = desc.match(/([\d,.]+)\s*([KMBkmb])?\s*(?:sq\s*km|km²|square\s*km)/i) || desc.match(/([\d,.]+)\s*([KMBkmb])?\s*km/i);
  if (!match) return 100000;
  let val = parseFloat(match[1].replace(/,/g, ''));
  const unit = match[2] ? match[2].toLowerCase() : '';
  if (unit === 'm') val *= 1000000;
  if (unit === 'k') val *= 1000;
  if (unit === 'b') val *= 1000000000;
  return val || 100000;
}

export function computeBetaSizePopBonus(roster: Partial<Record<Category, Country>>): number {
  if (!roster.Size || !roster.Population || !roster.Economy) {
    return 0; // Requires at least Size, Population, and Economy to be drafted
  }

  const pop = getRawPopulation(roster.Population.stats.population.description);
  const size = getRawArea(roster.Size);
  const x = pop / size; // actual population density

  const I = roster.Economy.stats.economy.industryType || 3;
  const T = roster.Technology?.stats.technology.score ?? 5;
  const E = roster.Economy.stats.economy.score ?? 5;
  const C = roster.Climate?.stats.climate.score ?? 5;
  const R = roster["Natural Resources"]?.stats.naturalResources.score ?? 5;
  const S = roster.Size.stats.size.score ?? 5;

  const numerator = 150 * Math.pow(I, 1.5) * Math.pow(T, 0.75) * Math.pow(E, 0.15);
  const denominator = Math.pow(C, 0.05) * Math.pow(R, 0.05) * Math.pow(S, 0.25);

  if (denominator === 0) return 0;
  const idealDensity = numerator / denominator;

  const z = (x - idealDensity) / 4000;
  const y = 25 * Math.exp(-0.5 * Math.pow(z, 2));

  return Math.round(y);
}

export function getCountryAverageScore(country: Country): number {
  if (!country || !country.stats) return 0;
  const statKeys = Object.keys(country.stats) as Array<keyof Country["stats"]>;
  let total = 0;
  let count = 0;
  for (const k of statKeys) {
    const s = country.stats[k]?.score;
    if (typeof s === "number") {
      total += s;
      count++;
    }
  }
  return count > 0 ? total / count : 0;
}

export function getBetaPoolForDifficulty(allCountries: Country[], difficultyIndex: number): Country[] {
  if (!allCountries || allCountries.length === 0) return [];
  const sorted = [...allCountries].sort((a, b) => getCountryAverageScore(b) - getCountryAverageScore(a));
  if (difficultyIndex === 0) return sorted.slice(0, 55); // Easy: Top 55
  if (difficultyIndex === 1) return sorted.slice(0, 85); // Intermediate: Top 85
  if (difficultyIndex === 2) return sorted.slice(0, 125); // Hard: Top 125
  return sorted; // Expert: All 179
}

export function getDensityBreakdown(roster: Partial<Record<Category, Country>>) {
  if (!roster.Size || !roster.Population || !roster.Economy) return null;

  const pop = getRawPopulation(roster.Population.stats.population.description);
  const size = getRawArea(roster.Size);
  const x = size > 0 ? pop / size : 0;

  const I = roster.Economy.stats.economy.industryType || 3;
  const T = roster.Technology?.stats.technology.score ?? 5;
  const E = roster.Economy.stats.economy.score ?? 5;
  const C = roster.Climate?.stats.climate.score ?? 5;
  const R = roster["Natural Resources"]?.stats.naturalResources.score ?? 5;
  const S = roster.Size.stats.size.score ?? 5;

  const numerator = 150 * Math.pow(I, 1.5) * Math.pow(T, 0.75) * Math.pow(E, 0.15);
  const denominator = Math.pow(C, 0.05) * Math.pow(R, 0.05) * Math.pow(S, 0.25);
  const idealTargetDensity = denominator > 0 ? numerator / denominator : 0;

  const diff = x - idealTargetDensity;
  let status: "optimal" | "too_high" | "too_low" = "optimal";
  let analysisText = "";

  if (diff > 500) {
    status = "too_high";
    analysisText = `Your actual density (${Math.round(x).toLocaleString()} ppl/km²) is higher than your ideal target (${Math.round(idealTargetDensity).toLocaleString()} ppl/km²). Your population is overcrowded for your current tech & industrial capacity.`;
  } else if (diff < -500) {
    status = "too_low";
    analysisText = `Your actual density (${Math.round(x).toLocaleString()} ppl/km²) is lower than your ideal target (${Math.round(idealTargetDensity).toLocaleString()} ppl/km²). Your land area is vast, but your high tech & industry levels could support much higher density.`;
  } else {
    status = "optimal";
    analysisText = `Optimal Synergy! Your actual density (${Math.round(x).toLocaleString()} ppl/km²) closely matches your ideal target density (${Math.round(idealTargetDensity).toLocaleString()} ppl/km²).`;
  }

  const synergyExplanation = `Industry Type (Ind. ${I}/5), Technology (${T}/10), and Economy (${E}/10) increase your target density capacity, while Climate (${C}/10), Resources (${R}/10), and Size (${S}/10) moderate land requirements.`;

  return {
    actualDensity: Math.round(x),
    idealTargetDensity: Math.round(idealTargetDensity),
    industryType: I,
    techScore: T,
    econScore: E,
    climateScore: C,
    resourcesScore: R,
    sizeScore: S,
    status,
    analysisText,
    synergyExplanation
  };
}


