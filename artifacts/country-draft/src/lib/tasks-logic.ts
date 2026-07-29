import { ALL_COUNTRIES, COUNTRIES, CATEGORIES, getCategoryKey, type Category, type Country } from "@/data/countries";
import { getCountryArchetype } from "./achievements-logic";

export type GoalType = "worst" | "best" | "match" | "archetype";
export type ChallengeType = "continent" | "lowRanked" | "timer" | "blind";

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

export function filterPoolForChallenge(challenge: TaskChallenge, pool: Country[]): Country[] {
  if (challenge.type === "continent" && challenge.continent) {
    const filtered = pool.filter(c => getContinentForCountry(c) === challenge.continent);
    return filtered.length >= 15 ? filtered : pool;
  }
  if (challenge.type === "lowRanked") {
    const filtered = pool.filter(c => getCountryTotalScore(c) < 140);
    return filtered.length >= 15 ? filtered : pool;
  }
  return pool;
}

export function generateRandomTask(customPool?: Country[]): Task {
  const basePool = customPool && customPool.length > 0 ? customPool : COUNTRIES;
  
  // Pick random challenge first so we know pool constraints
  const challengeTypes: ChallengeType[] = ["continent", "lowRanked", "timer", "blind"];
  const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

  let challenge: TaskChallenge;
  let usablePool = [...basePool];

  if (challengeType === "continent") {
    const continent = CONTINENTS[Math.floor(Math.random() * CONTINENTS.length)];
    challenge = {
      type: "continent",
      title: `${continent} Only`,
      template: `using countries from ${continent} only.`,
      continent
    };
    usablePool = filterPoolForChallenge(challenge, basePool);
  } else if (challengeType === "lowRanked") {
    challenge = {
      type: "lowRanked",
      title: "Low-Ranked Only",
      template: "using low-ranked countries only."
    };
    usablePool = filterPoolForChallenge(challenge, basePool);
  } else if (challengeType === "timer") {
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

  // Pick random goal
  const goalTypes: GoalType[] = ["worst", "best", "match", "archetype"];
  const goalType = goalTypes[Math.floor(Math.random() * goalTypes.length)];

  let goal: TaskGoal;

  if (goalType === "worst") {
    goal = {
      type: "worst",
      title: "Worst Country Possible",
      template: "Make the worst country possible",
      explanation: "Score 50 points or lower for a 100/100 score."
    };
  } else if (goalType === "best") {
    goal = {
      type: "best",
      title: "Best Country Possible",
      template: "Make the best country possible",
      explanation: "Score 175 points or higher for a 100/100 score."
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
  categoryBreakdown?: { category: Category; yourScore: number; targetScore: number; diff: number }[];
};

export function calculateTaskGrade(
  task: Task,
  roster: Partial<Record<Category, Country>>,
  totalScore: number
): TaskResult {
  let grade = 0;
  let summary = "";
  let details = "";
  let categoryBreakdown: { category: Category; yourScore: number; targetScore: number; diff: number }[] | undefined = undefined;

  if (task.goal.type === "worst") {
    // <= 50 pts is 100/100 score
    if (totalScore <= 50) {
      grade = 100;
    } else {
      grade = Math.max(0, Math.round(100 - (totalScore - 50)));
    }
    summary = `Final Score: ${totalScore} pts (Target: ≤50 pts)`;
    details = totalScore <= 50
      ? `Outstanding! You built a country with ${totalScore} pts (≤ 50 required for 100/100).`
      : `Your country achieved ${totalScore} pts. Every point above 50 subtracted 1 point from 100.`;

  } else if (task.goal.type === "best") {
    // >= 175 is 100/100 score
    if (totalScore >= 175) {
      grade = 100;
    } else {
      grade = Math.max(0, Math.round(100 - (175 - totalScore)));
    }
    summary = `Final Score: ${totalScore} pts (Target: ≥175 pts)`;
    details = totalScore >= 175
      ? `Incredible nation building! Your country scored ${totalScore} pts (≥ 175 required for 100/100).`
      : `Your country achieved ${totalScore} pts. You were ${175 - totalScore} pts short of 175.`;

  } else if (task.goal.type === "match" && task.goal.targetCountry) {
    const target = task.goal.targetCountry;
    let totalDiff = 0;
    categoryBreakdown = [];

    CATEGORIES.forEach(cat => {
      const catKey = getCategoryKey(cat);
      const targetScore = target.stats[catKey]?.score ?? 0;
      const yourCountry = roster[cat];
      const yourScore = yourCountry ? (yourCountry.stats[catKey]?.score ?? 0) : 0;
      const diff = Math.abs(yourScore - targetScore);
      totalDiff += diff;

      categoryBreakdown!.push({
        category: cat,
        yourScore,
        targetScore,
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
