import { ALL_COUNTRIES, COUNTRIES, CATEGORIES, getCategoryKey, type Category, type Country } from "@/data/countries";
import { getCountryArchetype, getRawPopulation } from "./achievements-logic";

export type GoalType = "worst" | "best" | "match" | "archetype";
export type ChallengeType = "continent" | "lowRanked" | "highRanked" | "timer" | "blind";

export type TaskGoal = {
  type: GoalType;
  title: string;
  template: string;
  targetCountry?: Country;
  targetArchetype?: string;
  explanation?: string;
};

export type TaskChallenge = {
  type: ChallengeType;
  title: string;
  template: string;
  continent?: string;
};

export type Task = {
  id: string;
  goal: TaskGoal;
  challenge: TaskChallenge;
  fullSentence: string;
};

export const CONTINENTS = ["Africa", "Asia", "Europe", "the Americas"] as const;

export const ARCHETYPES = [
  "Spartan Society",
  "Military Superstate",
  "Techno-Utopia",
  "Nordic Model",
  "Cultural Hegemon",
  "Industrial Juggernaut",
  "Fortress State",
  "Cyberocracy",
  "Eco-Paradise",
  "Trade Empire",
  "Global Medic",
  "Knowledge Hub",
  "Wealthy City-State"
];

export const ARCHETYPE_EXPLANATIONS: Record<string, string> = {
  "Spartan Society": "High Military (≥9), low Healthcare (≤5) & Education (≤5)",
  "Military Superstate": "High Military (≥8), Economy (≥8), & Technology (≥8)",
  "Techno-Utopia": "High Economy (≥8), Technology (≥8), & Education (≥8)",
  "Nordic Model": "High Healthcare (≥8), Education (≥8), & Government (≥8)",
  "Cultural Hegemon": "High Tourism (≥8), Economy (≥8), & Education (≥8)",
  "Industrial Juggernaut": "High Natural Resources (≥8), Economy (≥8), & Industry (≥8)",
  "Fortress State": "High Military (≥8) & Location (≥8), low Tourism (≤4)",
  "Cyberocracy": "High Technology (≥9) & Government (≥9)",
  "Eco-Paradise": "High Climate (≥9) & Healthcare (≥8), low Industry (≤4)",
  "Trade Empire": "High Economy (≥8), Location (≥8), & Government (≥8)",
  "Global Medic": "High Healthcare (≥8), Education (≥8), & Technology (≥8)",
  "Knowledge Hub": "High Education (≥9) & Technology (≥9)",
  "Resource Curse": "High Natural Resources (≥9), low Government (≤4) & Economy (≤5)",
  "Wealthy City-State": "Small Size (≤50,000 km²), Low Population (≤15M), High Economy (≥7)",
  "Balanced Republic": "Default balanced distribution across stats"
};

export function getContinentForCountry(country: Country): string {
  if (country.region === "Africa") return "Africa";
  if (country.region === "Oceania") return "Asia-Pacific"; // mapped if needed
  if (country.region.includes("Europe")) return "Europe";
  if (country.region.includes("Asia")) return "Asia";
  if (country.region === "Americas") return "the Americas";
  return country.region;
}

export function getCountryTotalScore(country: Country): number {
  let total = 0;
  if (!country.stats) return 0;
  Object.values(country.stats).forEach(s => {
    if (s && typeof s.score === "number") {
      total += s.score;
    }
  });
  return total;
}

export function getCategoryTargetDisplay(cat: Category, targetCountry: Country): string {
  if (cat === "Population") {
    const desc = targetCountry.stats.population?.description || "";
    return desc.split(";")[0].trim();
  }
  if (cat === "Size") {
    const desc = targetCountry.stats.size?.description || "";
    return desc.split(";")[0].split("—")[0].trim();
  }
  const catKey = getCategoryKey(cat);
  return String(targetCountry.stats[catKey]?.score ?? 0);
}

export function getCategoryYourDisplay(cat: Category, country: Country): string {
  if (cat === "Population") {
    const desc = country.stats.population?.description || "";
    return desc.split(";")[0].trim();
  }
  if (cat === "Size") {
    const desc = country.stats.size?.description || "";
    return desc.split(";")[0].split("—")[0].trim();
  }
  const catKey = getCategoryKey(cat);
  return String(country.stats[catKey]?.score ?? 0);
}

export function filterPoolForChallenge(challenge: TaskChallenge, pool: Country[]): Country[] {
  if (challenge.type === "continent" && challenge.continent) {
    const filtered = pool.filter(c => getContinentForCountry(c) === challenge.continent);
    return filtered.length >= 15 ? filtered : pool;
  }
  if (challenge.type === "lowRanked") {
    const filtered = pool.filter(c => c.tier !== "first" && getCountryTotalScore(c) < 140);
    return filtered.length >= 15 ? filtered : pool;
  }
  if (challenge.type === "highRanked") {
    const filtered = pool.filter(c => c.tier === "first" || getCountryTotalScore(c) >= 120);
    return filtered.length >= 15 ? filtered : pool;
  }
  return pool;
}

export function generateRandomTask(customPool?: Country[]): Task {
  const basePool = customPool && customPool.length > 0 ? customPool : COUNTRIES;
  
  // Pick random goal first
  const goalTypes: GoalType[] = ["worst", "best", "match", "archetype"];
  const goalType = goalTypes[Math.floor(Math.random() * goalTypes.length)];

  // Pick random challenge type
  const rawChallengeTypes: ("continent" | "rank" | "timer" | "blind")[] = ["continent", "rank", "timer", "blind"];
  const rawChallengeType = rawChallengeTypes[Math.floor(Math.random() * rawChallengeTypes.length)];

  let challenge: TaskChallenge;
  let usablePool = [...basePool];

  if (rawChallengeType === "continent") {
    const continent = CONTINENTS[Math.floor(Math.random() * CONTINENTS.length)];
    challenge = {
      type: "continent",
      title: `${continent} Only`,
      template: `using countries from ${continent} only.`,
      continent
    };
    usablePool = filterPoolForChallenge(challenge, basePool);
  } else if (rawChallengeType === "rank") {
    // IF and ONLY IF task is "worst", replace low-ranked with high-ranked countries
    if (goalType === "worst") {
      challenge = {
        type: "highRanked",
        title: "High-Ranked Only",
        template: "using high-ranked countries only."
      };
    } else {
      challenge = {
        type: "lowRanked",
        title: "Low-Ranked Only",
        template: "using low-ranked countries only."
      };
    }
    usablePool = filterPoolForChallenge(challenge, basePool);
  } else if (rawChallengeType === "timer") {
    challenge = {
      type: "timer",
      title: "5s Timer",
      template: "with 5 seconds per draft."
    };
  } else {
    challenge = {
      type: "blind",
      title: "Blind Mode",
      template: "in blind mode."
    };
  }

  let goal: TaskGoal;

  if (goalType === "worst") {
    goal = {
      type: "worst",
      title: "Worst Country Possible",
      template: "Make the worst country possible",
      explanation: "Score 60 points or lower for a 100/100 score."
    };
  } else if (goalType === "best") {
    goal = {
      type: "best",
      title: "Best Country Possible",
      template: "Make the best country possible",
      explanation: "Score 170 points or higher for a 100/100 score."
    };
  } else if (goalType === "match") {
    // Pick target country from usablePool
    const targetCountry = usablePool[Math.floor(Math.random() * usablePool.length)] || basePool[0];
    goal = {
      type: "match",
      title: `Match ${targetCountry.name}`,
      template: `Make a country most similar to ${targetCountry.name}`,
      targetCountry,
      explanation: `Match category stats as closely as possible to ${targetCountry.name}.`
    };
  } else {
    const targetArchetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    const prefix = /^[AEIOU]/i.test(targetArchetype) ? "an" : "a";
    const explanation = ARCHETYPE_EXPLANATIONS[targetArchetype] || "";
    goal = {
      type: "archetype",
      title: `Achieve ${targetArchetype}`,
      template: `Make ${prefix} ${targetArchetype}`,
      targetArchetype,
      explanation
    };
  }

  const fullSentence = `${goal.template} ${challenge.template}`;

  return {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    goal,
    challenge,
    fullSentence
  };
}

export type TaskResult = {
  grade: number; // 0 - 100
  letterGrade: "S" | "A" | "B" | "C" | "D" | "F";
  summary: string;
  details: string;
  categoryBreakdown?: { category: Category; yourScore: string; targetScore: string; diff: number }[];
};

export function calculateTaskGrade(
  task: Task,
  roster: Partial<Record<Category, Country>>,
  totalScore: number
): TaskResult {
  let grade = 0;
  let summary = "";
  let details = "";
  let categoryBreakdown: { category: Category; yourScore: string; targetScore: string; diff: number }[] | undefined = undefined;

  if (task.goal.type === "worst") {
    // <= 60 pts is 100/100 score
    if (totalScore <= 60) {
      grade = 100;
    } else {
      grade = Math.max(0, Math.round(100 - (totalScore - 60)));
    }
    summary = `Final Score: ${totalScore} pts (Target: ≤60 pts)`;
    details = totalScore <= 60
      ? `Outstanding! You built a country with ${totalScore} pts (≤ 60 required for 100/100).`
      : `Your country achieved ${totalScore} pts. Every point above 60 subtracted 1 point from 100.`;

  } else if (task.goal.type === "best") {
    // >= 170 is 100/100 score
    if (totalScore >= 170) {
      grade = 100;
    } else {
      grade = Math.max(0, Math.round(100 - (170 - totalScore)));
    }
    summary = `Final Score: ${totalScore} pts (Target: ≥170 pts)`;
    details = totalScore >= 170
      ? `Incredible nation building! Your country scored ${totalScore} pts (≥ 170 required for 100/100).`
      : `Your country achieved ${totalScore} pts. You were ${170 - totalScore} pts short of 170.`;

  } else if (task.goal.type === "match" && task.goal.targetCountry) {
    const target = task.goal.targetCountry;
    let totalDiff = 0;
    categoryBreakdown = [];

    CATEGORIES.forEach(cat => {
      const yourCountry = roster[cat];
      let diff = 0;
      let yourScoreDisplay = "N/A";
      let targetScoreDisplay = getCategoryTargetDisplay(cat, target);

      if (cat === "Population") {
        if (yourCountry) {
          yourScoreDisplay = getCategoryYourDisplay(cat, yourCountry);
          const yourPop = getRawPopulation(yourCountry.stats.population?.description || "");
          const targetPop = getRawPopulation(target.stats.population?.description || "");
          const ratio = Math.max(yourPop, targetPop) / Math.max(1, Math.min(yourPop, targetPop));
          if (ratio <= 1.25) diff = 0;
          else diff = Math.min(10, Math.round(Math.abs(Math.log10(ratio)) * 4));
        } else {
          diff = 5;
        }
      } else if (cat === "Size") {
        if (yourCountry) {
          yourScoreDisplay = getCategoryYourDisplay(cat, yourCountry);
          const yourSize = yourCountry.area || 100000;
          const targetSize = target.area || 100000;
          const ratio = Math.max(yourSize, targetSize) / Math.max(1, Math.min(yourSize, targetSize));
          if (ratio <= 1.25) diff = 0;
          else diff = Math.min(10, Math.round(Math.abs(Math.log10(ratio)) * 4));
        } else {
          diff = 5;
        }
      } else {
        const catKey = getCategoryKey(cat);
        const targetScore = target.stats[catKey]?.score ?? 0;
        const yourScore = yourCountry ? (yourCountry.stats[catKey]?.score ?? 0) : 0;
        diff = Math.abs(yourScore - targetScore);
        yourScoreDisplay = String(yourScore);
        targetScoreDisplay = String(targetScore);
      }

      totalDiff += diff;

      categoryBreakdown!.push({
        category: cat,
        yourScore: yourScoreDisplay,
        targetScore: targetScoreDisplay,
        diff
      });
    });

    grade = Math.max(0, 100 - totalDiff);
    summary = `Total Stat Difference: ${totalDiff} pts from ${target.name}`;
    details = grade === 100
      ? `Perfect Match! Your country stats identically match ${target.name}.`
      : `Your stats differed by a total of ${totalDiff} points across all 15 categories from ${target.name}.`;

  } else if (task.goal.type === "archetype" && task.goal.targetArchetype) {
    const achievedArchetype = getCountryArchetype(roster);
    const isSuccess = achievedArchetype.toLowerCase() === task.goal.targetArchetype.toLowerCase();
    grade = isSuccess ? 100 : 0;
    const reqExp = ARCHETYPE_EXPLANATIONS[task.goal.targetArchetype] || "";
    const achExp = ARCHETYPE_EXPLANATIONS[achievedArchetype] || "";
    summary = `Achieved: ${achievedArchetype} (Target: ${task.goal.targetArchetype})`;
    details = isSuccess
      ? `Success! You created a ${task.goal.targetArchetype} (${reqExp}).`
      : `Failed. You created a ${achievedArchetype} (${achExp}) instead of a ${task.goal.targetArchetype} (${reqExp}).`;
  }

  let letterGrade: "S" | "A" | "B" | "C" | "D" | "F" = "F";
  if (grade === 100) letterGrade = "S";
  else if (grade >= 90) letterGrade = "A";
  else if (grade >= 80) letterGrade = "B";
  else if (grade >= 70) letterGrade = "C";
  else if (grade >= 60) letterGrade = "D";

  return {
    grade,
    letterGrade,
    summary,
    details,
    categoryBreakdown
  };
}
