import fs from 'fs';
import path from 'path';

// 1. Fix Leaderboard.tsx medals
const leaderboardPath = path.resolve('src/pages/Leaderboard.tsx');
if (fs.existsSync(leaderboardPath)) {
  let content = fs.readFileSync(leaderboardPath, 'utf-8');
  
  // Replace medal string emojis with Lucide Medal component
  content = content.replace(
    /const medal = rank === 1 \? "🥇" : rank === 2 \? "🥈" : rank === 3 \? "🥉" : null;/g,
    'const medal = rank === 1 ? <Medal className="w-5 h-5 text-yellow-400" /> : rank === 2 ? <Medal className="w-5 h-5 text-slate-300" /> : rank === 3 ? <Medal className="w-5 h-5 text-amber-600" /> : null;'
  );

  // Add Medal to lucide-react import if missing
  if (!content.includes('Medal } from "lucide-react"') && !content.includes('Medal,')) {
    content = content.replace(
      'import { Trophy, ChevronDown, ArrowLeft, Globe, CalendarDays, User } from "lucide-react";',
      'import { Trophy, ChevronDown, ArrowLeft, Globe, CalendarDays, User, Medal } from "lucide-react";'
    );
  }

  fs.writeFileSync(leaderboardPath, content);
}

// 2. Fix Hard Mode extra spacing in all UI files
const uiFiles = [
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx',
  'src/pages/daily/DailyUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/double/DoubleUI.tsx'
];

for (const file of uiFiles) {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix the mb-4 on the header
  content = content.replace(
    /<div className="relative z-10 flex flex-col h-full">\s*<div className="flex items-center justify-between mb-4">/g,
    '<div className="relative z-10 flex flex-col h-full">\n                  <div className={`flex items-center justify-between ${!isHardMode ? "mb-4" : "mb-2"}`}>'
  );

  // Fix the mt-3 on the description wrapper
  content = content.replace(
    /<div className="mt-3">\s*<ExpandableDescription description=\{stat\.description\} \/>\s*<\/div>/g,
    '<div className={!isHardMode ? "mt-3" : "mt-1"}>\n                    <ExpandableDescription description={stat.description} />\n                  </div>'
  );

  fs.writeFileSync(filePath, content);
}

console.log('Patched spacing and medals');
