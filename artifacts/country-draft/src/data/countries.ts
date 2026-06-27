export type CategoryStats = {
  score?: number;
  description: string;
  industryType?: number;
};

export type Country = {
  name: string;
  isoNumeric: string;
  aliases: string[];
  capitalAliases: string[];
  flag: string;
  flagColors: string[];
  tier: "first" | "second" | "third" | "fourth";
  capital: string;
  region: string;
  knownFor: string;
  stats: {
    military: CategoryStats;
    economy: CategoryStats;
    culture: CategoryStats;
    healthcare: CategoryStats;
    internationalRelationships: CategoryStats;
    government: CategoryStats;
    climate: CategoryStats;
    technology: CategoryStats;
    size: CategoryStats;
    population: CategoryStats;
    history: CategoryStats;
    tourism: CategoryStats;
    education: CategoryStats;
    location: CategoryStats;
    naturalResources: CategoryStats;
  };
  coordinates?: [number, number];
  area?: number;
  excludeFromDraft?: boolean;
};

import countriesDataRaw from './countries.json?raw';
const countriesData = JSON.parse(countriesDataRaw);
export const ALL_COUNTRIES: Country[] = countriesData as Country[];

export const CATEGORIES = [
  "Military",
  "Economy",
  "Government",
  "International Relationships",
  "Technology",
  "Education",
  "Natural Resources",
  "Healthcare",
  "Culture",
  "Climate",
  "History",
  "Tourism",
  "Location",
  "Size",
  "Population",
] as const;

export type Category = typeof CATEGORIES[number];

export function getCategoryKey(category: Category): keyof Country["stats"] {
  const map: Record<Category, keyof Country["stats"]> = {
    Military: "military",
    Economy: "economy",
    Culture: "culture",
    Healthcare: "healthcare",
    "International Relationships": "internationalRelationships",
    Government: "government",
    Climate: "climate",
    Technology: "technology",
    Size: "size",
    "Population": "population",
    History: "history",
    "Tourism": "tourism",
    Education: "education",
    Location: "location",
    "Natural Resources": "naturalResources",
  };
  return map[category];
}

export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function extractBonusText(desc: string, cat: string) {
  if (!desc) return "";
  if (cat === "Population") {
    const match = desc.match(/([\d\.,]+)\s*(million|billion|k|m|b)?/i);
    if (match) {
      let numStr = match[1].replace(/,/g, '');
      let num = parseFloat(numStr);
      let unit = match[2] ? match[2].toLowerCase() : '';
      if (unit === 'billion' || unit === 'b') {
        return `${num}B ppl`;
      } else if (unit === 'million' || unit === 'm') {
        return `${num}M ppl`;
      } else {
        if (num >= 1000000) {
          return `${+(num/1000000).toFixed(1)}M ppl`;
        } else if (num >= 1000) {
          return `${+(num/1000).toFixed(1)}K ppl`;
        } else {
          return `${num} ppl`;
        }
      }
    }
  }
  const match = desc.match(/([\d\.,]+[KMBkmb]?\s*km²)/i);
  if (match) {
    return match[1].trim();
  }
  return "";
}

export const COUNTRIES = ALL_COUNTRIES.filter(c => !c.excludeFromDraft);
