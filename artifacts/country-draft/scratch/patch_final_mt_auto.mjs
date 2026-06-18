import fs from 'fs';

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/className="flex items-center gap-2 mt-auto"/g, 'className="flex items-center gap-2"');
  fs.writeFileSync(filePath, content);
}

['src/pages/normal/NormalUI.tsx', 'src/pages/daily/DailyUI.tsx', 'src/pages/sabotage/SabotageUI.tsx', 'src/pages/guess/GuessUI.tsx', 'src/pages/party/PartyUI.tsx', 'src/pages/double/DoubleUI.tsx'].forEach(patchFile);
