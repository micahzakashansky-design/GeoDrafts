import { CATEGORIES, getCategoryKey, type Country, type Category } from "@/data/countries";

export const DEV_CATEGORY_MAX_SCORES: Record<Category, number> = {
  Military: 10,
  Economy: 10,
  Government: 10,
  "International Relationships": 10,
  Technology: 10,
  Education: 10,
  "Natural Resources": 10,
  Healthcare: 10,
  Culture: 10,
  Climate: 10,
};

export function isDevModeActive(username: string | undefined | null): boolean {
  if (username !== "DevTest") return false;
  return localStorage.getItem("geoDraftsDevMode") === "true";
}

export function drawDevCountry(pool: Country[], roster: Partial<Record<Category, Country>>): Country | null {
  if (pool.length === 0) return null;

  const remainingCategories = CATEGORIES.filter((cat) => !roster[cat]);

  if (remainingCategories.length === 0) {
    return pool.pop() || null;
  }

  let bestDeficit = -Infinity;
  let bestCountries: Country[] = [];

  for (const country of pool) {
    let countryBestDeficit = -Infinity;
    for (const cat of remainingCategories) {
      const key = getCategoryKey(cat);
      const score = country.stats[key]?.score ?? 0;
      const maxScore = DEV_CATEGORY_MAX_SCORES[cat] ?? 10;
      const deficit = score - maxScore; // 0 is perfect, -1 is 1 below max
      
      if (deficit > countryBestDeficit) {
        countryBestDeficit = deficit;
      }
    }

    if (countryBestDeficit > bestDeficit) {
      bestDeficit = countryBestDeficit;
      bestCountries = [country];
    } else if (countryBestDeficit === bestDeficit) {
      bestCountries.push(country);
    }
  }

  if (bestCountries.length > 0) {
    const selected = bestCountries[Math.floor(Math.random() * bestCountries.length)];
    const index = pool.findIndex(c => c.name === selected.name);
    if (index !== -1) {
      pool.splice(index, 1);
    }
    return selected;
  }

  return pool.pop() || null;
}
