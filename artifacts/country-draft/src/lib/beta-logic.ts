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


