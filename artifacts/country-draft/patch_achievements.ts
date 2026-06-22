import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/lib/achievements.ts', 'utf8');

// Add Lucide imports
content = content.replace(
  /Plane, Scale\n\} from "lucide-react";/,
  'Plane, Scale, Calendar, Trophy, FastForward, CheckCircle2\n} from "lucide-react";'
);

// Add ACCOUNT_STATS array
const accountStats = `
export const ACCOUNT_STATS = [
  { id: "Draft Master", name: "Draft Master", color: "text-purple-400", desc: "Complete 100 games." },
  { id: "Superpower", name: "Superpower", color: "text-yellow-500", desc: "Score 165+ in Normal mode." },
  { id: "Geography Genius", name: "Geography Genius", color: "text-blue-400", desc: "Guess country on first try 10 times." },
  { id: "Speed Demon", name: "Speed Demon", color: "text-red-500", desc: "Complete a draft in under 2 minutes." },
  { id: "World Traveler", name: "World Traveler", color: "text-emerald-400", desc: "Use 50+ different countries across games." },
  { id: "Daily Streak", name: "Daily Streak", color: "text-orange-400", desc: "Complete 7 daily challenges in a row." }
];
`;

content = content.replace(/export const RATINGS = \[/, accountStats + '\nexport const RATINGS = [');

// Add to getAchievementIcon
const accountIcons = `
    // Account Stats
    case "Draft Master": return React.createElement(Trophy, { className: \`\${className} text-purple-400\` });
    case "Geography Genius": return React.createElement(CheckCircle2, { className: \`\${className} text-blue-400\` });
    case "Speed Demon": return React.createElement(FastForward, { className: \`\${className} text-red-500\` });
    case "World Traveler": return React.createElement(Globe, { className: \`\${className} text-emerald-400\` });
    case "Daily Streak": return React.createElement(Calendar, { className: \`\${className} text-orange-400\` });
`;

content = content.replace(/\/\/ Ratings/, accountIcons + '\n    // Ratings');

writeFileSync('src/lib/achievements.ts', content);
