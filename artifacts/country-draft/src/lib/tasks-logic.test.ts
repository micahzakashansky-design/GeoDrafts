import { describe, it, expect } from "vitest";
import { generateRandomTask, calculateTaskGrade, getCategoryTargetDisplay, getCategoryYourDisplay, type Task, type Country } from "./tasks-logic";

const dummyCountry: Country = {
  name: "Testland",
  isoNumeric: "999",
  aliases: [],
  capitalAliases: [],
  flag: "🏳️",
  flagColors: [],
  tier: "second",
  capital: "Test City",
  region: "Europe",
  knownFor: "Testing",
  area: 500000,
  stats: {
    military: { score: 10, description: "10/10" },
    economy: { score: 8, description: "8/10" },
    culture: { score: 7, description: "7/10" },
    healthcare: { score: 8, description: "8/10" },
    internationalRelationships: { score: 8, description: "8/10" },
    government: { score: 8, description: "8/10" },
    climate: { score: 7, description: "7/10" },
    technology: { score: 9, description: "9/10" },
    size: { score: 1, description: "500K km² — large territory" },
    population: { score: 1, description: "65 million; urbanized population" },
    history: { score: 7, description: "7/10" },
    tourism: { score: 6, description: "6/10" },
    education: { score: 9, description: "9/10" },
    location: { score: 7, description: "7/10" },
    naturalResources: { score: 6, description: "6/10" }
  }
};

describe("tasks-logic", () => {
  it("generates a random task with valid goal and challenge", () => {
    const task = generateRandomTask([dummyCountry]);
    expect(task.id).toBeDefined();
    expect(task.fullSentence).toContain("Make");
    expect(task.goal).toBeDefined();
    expect(task.challenge).toBeDefined();
  });

  it("formats target displays for population and size as exact numbers", () => {
    expect(getCategoryTargetDisplay("Population", dummyCountry)).toBe("65 million");
    expect(getCategoryTargetDisplay("Size", dummyCountry)).toBe("500K km²");
    expect(getCategoryTargetDisplay("Military", dummyCountry)).toBe("10");
  });

  it("scores worst country goal correctly (<=60 is 100/100)", () => {
    const task: Task = {
      id: "t1",
      goal: { type: "worst", title: "Worst Country", template: "Make the worst country possible" },
      challenge: { type: "blind", title: "Blind Mode", template: "in blind mode." },
      fullSentence: "Make the worst country possible in blind mode."
    };

    const res100 = calculateTaskGrade(task, {}, 55);
    expect(res100.grade).toBe(100);

    const res90 = calculateTaskGrade(task, {}, 70);
    expect(res90.grade).toBe(90);
  });

  it("scores best country goal correctly (>=170 is 100/100)", () => {
    const task: Task = {
      id: "t2",
      goal: { type: "best", title: "Best Country", template: "Make the best country possible" },
      challenge: { type: "blind", title: "Blind Mode", template: "in blind mode." },
      fullSentence: "Make the best country possible in blind mode."
    };

    const res100 = calculateTaskGrade(task, {}, 175);
    expect(res100.grade).toBe(100);

    const res95 = calculateTaskGrade(task, {}, 165);
    expect(res95.grade).toBe(95);
  });

  it("scores match country goal correctly", () => {
    const task: Task = {
      id: "t3",
      goal: { type: "match", title: "Match Testland", template: "Make a country most similar to Testland", targetCountry: dummyCountry },
      challenge: { type: "blind", title: "Blind Mode", template: "in blind mode." },
      fullSentence: "Make a country most similar to Testland in blind mode."
    };

    const roster = {
      Military: dummyCountry,
      Economy: dummyCountry,
      Population: dummyCountry,
      Size: dummyCountry
    };

    const res = calculateTaskGrade(task, roster, 100);
    expect(res.grade).toBeGreaterThanOrEqual(0);
    expect(res.grade).toBeLessThanOrEqual(100);
    expect(res.categoryBreakdown).toBeDefined();
    const popItem = res.categoryBreakdown?.find(c => c.category === "Population");
    expect(popItem?.targetScore).toBe("65 million");
  });
});
