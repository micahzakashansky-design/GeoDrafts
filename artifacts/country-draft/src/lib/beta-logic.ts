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
export function getCalculatedSizeScore(country?: Country): number {
  if (!country) return 5;
  const score = country.stats?.size?.score;
  if (typeof score === "number" && score > 1) {
    return Math.min(10, Math.max(1, score));
  }
  const area = getRawArea(country);
  if (area >= 5000000) return 10; // Russia, Canada, China, USA, Brazil, Australia
  if (area >= 2000000) return 9;  // India, Argentina, Kazakhstan, Algeria, DRC
  if (area >= 1000000) return 8;  // Saudi Arabia, Mexico, Indonesia, Iran, Peru
  if (area >= 500000) return 7;   // Egypt, Tanzania, Nigeria, France, Ukraine, Spain
  if (area >= 200000) return 6;   // Japan, Germany, Finland, Norway, Poland, UK
  if (area >= 100000) return 5;   // Greece, Nepal, Portugal, Hungary
  if (area >= 50000) return 4;    // Switzerland, Netherlands, Denmark, Ireland
  if (area >= 20000) return 3;    // Israel, Slovenia, El Salvador
  if (area >= 5000) return 2;     // Cyprus, Brunei, Trinidad & Tobago
  return 1;                       // Monaco, Singapore, Vatican, Malta
}

export function computeBetaSizePopBonus(roster: Partial<Record<Category, Country>>): number {
  if (!roster.Size || !roster.Population || !roster.Economy) {
    return 0; // Requires at least Size, Population, and Economy to be drafted
  }

  const pop = getRawPopulation(roster.Population.stats.population.description);
  const size = getRawArea(roster.Size);
  const x = size > 0 ? pop / size : 0; // actual population density

  const I = roster.Economy.stats.economy.industryType || 3;
  const T = roster.Technology?.stats.technology.score ?? 5;
  const E = roster.Economy.stats.economy.score ?? 5;
  const C = roster.Climate?.stats.climate.score ?? 5;
  const R = roster["Natural Resources"]?.stats.naturalResources.score ?? 5;
  const S = getCalculatedSizeScore(roster.Size);

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
  const S = getCalculatedSizeScore(roster.Size);

  const iTerm = Math.pow(I, 1.5);
  const tTerm = Math.pow(T, 0.75);
  const eTerm = Math.pow(E, 0.15);
  const cTerm = Math.pow(C, 0.05);
  const rTerm = Math.pow(R, 0.05);
  const sTerm = Math.pow(S, 0.25);

  const numerator = 150 * iTerm * tTerm * eTerm;
  const denominator = cTerm * rTerm * sTerm;
  const idealTargetDensity = denominator > 0 ? numerator / denominator : 0;

  const z = (x - idealTargetDensity) / 4000;
  const bonusPoints = Math.round(25 * Math.exp(-0.5 * Math.pow(z, 2)));

  const actualFormatted = x < 1 ? x.toFixed(2) : Math.round(x).toLocaleString();
  const targetFormatted = idealTargetDensity < 1 ? idealTargetDensity.toFixed(2) : Math.round(idealTargetDensity).toLocaleString();

  const diff = x - idealTargetDensity;
  let status: "optimal" | "too_high" | "too_low" = "optimal";
  let analysisText = "";

  if (diff > 500) {
    status = "too_high";
    analysisText = `Your actual density (${actualFormatted} ppl/km²) is higher than your ideal target (${targetFormatted} ppl/km²). Your population is overcrowded relative to your current technological infrastructure & industrial capacity.`;
  } else if (diff < -500) {
    status = "too_low";
    analysisText = `Your actual density (${actualFormatted} ppl/km²) is lower than your ideal target (${targetFormatted} ppl/km²). Your nation has vast territory, but your high tech & industry levels could support a much denser urban population.`;
  } else {
    status = "optimal";
    analysisText = `Optimal Synergy! Your actual density (${actualFormatted} ppl/km²) closely matches your nation's ideal target density capacity (${targetFormatted} ppl/km²).`;
  }

  const factors = [
    {
      name: "Industry Type",
      symbol: "I",
      statValue: `Ind. ${I}/5`,
      countryName: roster.Economy.name,
      countryFlag: roster.Economy.flag,
      impactType: "multiplier" as const,
      rawTerm: iTerm,
      formulaTerm: `I^1.5 = ${iTerm.toFixed(2)}`,
      explanation: `Industry specialization level ${I}/5 multiplies target density capacity by ×${iTerm.toFixed(2)}.`,
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30"
    },
    {
      name: "Technology",
      symbol: "T",
      statValue: `${T}/10`,
      countryName: roster.Technology?.name || "Undrafted (Default 5)",
      countryFlag: roster.Technology?.flag || "⚙️",
      impactType: "multiplier" as const,
      rawTerm: tTerm,
      formulaTerm: `T^0.75 = ${tTerm.toFixed(2)}`,
      explanation: `Tech rating ${T}/10 provides urban infrastructure & transit support (×${tTerm.toFixed(2)} multiplier).`,
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30"
    },
    {
      name: "Economy",
      symbol: "E",
      statValue: `${E}/10`,
      countryName: roster.Economy.name,
      countryFlag: roster.Economy.flag,
      impactType: "multiplier" as const,
      rawTerm: eTerm,
      formulaTerm: `E^0.15 = ${eTerm.toFixed(2)}`,
      explanation: `Economy rating ${E}/10 adds financial commercial density support (×${eTerm.toFixed(2)} multiplier).`,
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    },
    {
      name: "Size (Territory)",
      symbol: "S",
      statValue: `${S}/10`,
      countryName: roster.Size.name,
      countryFlag: roster.Size.flag,
      impactType: "divisor" as const,
      rawTerm: sTerm,
      formulaTerm: `S^0.25 = ${sTerm.toFixed(2)}`,
      explanation: `Land size rating ${S}/10 moderates density expectations across territory (÷${sTerm.toFixed(2)} divisor).`,
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30"
    },
    {
      name: "Climate",
      symbol: "C",
      statValue: `${C}/10`,
      countryName: roster.Climate?.name || "Undrafted (Default 5)",
      countryFlag: roster.Climate?.flag || "🌤️",
      impactType: "divisor" as const,
      rawTerm: cTerm,
      formulaTerm: `C^0.05 = ${cTerm.toFixed(2)}`,
      explanation: `Climate score ${C}/10 distributes land habitability across the nation (÷${cTerm.toFixed(2)} divisor).`,
      badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/30"
    },
    {
      name: "Natural Resources",
      symbol: "R",
      statValue: `${R}/10`,
      countryName: roster["Natural Resources"]?.name || "Undrafted (Default 5)",
      countryFlag: roster["Natural Resources"]?.flag || "🛢️",
      impactType: "divisor" as const,
      rawTerm: rTerm,
      formulaTerm: `R^0.05 = ${rTerm.toFixed(2)}`,
      explanation: `Resource score ${R}/10 spreads out primary industries and agriculture (÷${rTerm.toFixed(2)} divisor).`,
      badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30"
    }
  ];

  return {
    actualDensity: Math.round(x),
    idealTargetDensity: Math.round(idealTargetDensity),
    popRaw: pop,
    sizeRaw: size,
    popCountryName: roster.Population.name,
    popCountryFlag: roster.Population.flag,
    sizeCountryName: roster.Size.name,
    sizeCountryFlag: roster.Size.flag,
    industryType: I,
    techScore: T,
    econScore: E,
    climateScore: C,
    resourcesScore: R,
    sizeScore: S,
    iTerm,
    tTerm,
    eTerm,
    cTerm,
    rTerm,
    sTerm,
    numerator,
    denominator,
    bonusPoints,
    status,
    analysisText,
    factors
  };
}


