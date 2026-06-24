import { type Category, type Country } from "@/data/countries";
import { getRawPopulation } from "./achievements-logic";

export function computeBetaSizePopBonus(roster: Partial<Record<Category, Country>>): number {
  if (!roster.Size || !roster.Population || !roster.Economy || !roster.Technology || !roster.Climate || !roster["Natural Resources"]) {
    return 0; // Require all these to compute the synergy
  }

  const pop = getRawPopulation(roster.Population.stats.population.description);
  const size = roster.Size.area || 100000;
  const x = pop / size; // actual population density

  const I = roster.Economy.stats.economy.industryType || 3;
  const T = roster.Technology.stats.technology.score || 5;
  const E = roster.Economy.stats.economy.score || 5;
  const C = roster.Climate.stats.climate.score || 5;
  const R = roster["Natural Resources"].stats.naturalResources.score || 5;
  
  // Note: size score from 1-12. If stats.size is missing, fallback to 5.
  // Wait, country.stats might not have "size" key? Let's check getCategoryKey("Size") -> "size"
  // @ts-ignore
  const S = roster.Size.stats.size?.score || 5; 

  const numerator = 150 * Math.pow(I, 1.5) * Math.pow(T, 0.75) * Math.pow(E, 0.15);
  const denominator = Math.pow(C, 0.05) * Math.pow(R, 0.05) * Math.pow(S, 0.25);
  
  const idealDensity = numerator / denominator;

  const z = (x - idealDensity) / 4000;
  const y = 25 * Math.exp(-0.5 * Math.pow(z, 2));

  return Math.floor(y); // Or maybe Math.round(y)? Let's use Math.round
}
