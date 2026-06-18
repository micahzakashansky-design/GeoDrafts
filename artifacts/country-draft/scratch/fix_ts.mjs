import fs from 'fs';

const files = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/guess/GuessUI.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  content = content.replace(/CATEGORY_ICONS\["size"\]/g, 'CATEGORY_ICONS["Size"]');
  content = content.replace(/CATEGORY_ICONS\["population"\]/g, 'CATEGORY_ICONS["Population"]');
  content = content.replace(/actualCat === "size"/g, 'actualCat === "Size"');
  content = content.replace(/actualCat === "population"/g, 'actualCat === "Population"');
  content = content.replace(/cat === "size"/g, 'cat === "Size"');
  content = content.replace(/cat === "population"/g, 'cat === "Population"');
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}
