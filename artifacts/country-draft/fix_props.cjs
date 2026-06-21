const fs = require('fs');

const gameFiles = [
  'src/pages/normal/NormalGame.tsx',
  'src/pages/daily/DailyGame.tsx',
  'src/pages/double/DoubleDraftGame.tsx',
  'src/pages/guess/GuessGame.tsx',
  'src/pages/party/PartyGame.tsx',
  'src/pages/sabotage/SabotageGame.tsx'
];

for (const f of gameFiles) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');

  // Inject categoryTimes={state.categoryTimes} to SidebarRoster
  const srRegex = /<SidebarRoster roster=\{state\.roster\}/g;
  content = content.replace(srRegex, '<SidebarRoster roster={state.roster} categoryTimes={state.categoryTimes}');

  // Inject categoryTimes={state.categoryTimes} to GameOver
  const goRegex = /<GameOver roster=\{state\.roster\}/g;
  content = content.replace(goRegex, '<GameOver roster={state.roster} categoryTimes={state.categoryTimes}');

  // Note: some GameOvers might have roster as the second prop, but `roster={state.roster}` is typically how it's formatted.
  
  fs.writeFileSync(f, content);
}

console.log("Updated props passing!");
