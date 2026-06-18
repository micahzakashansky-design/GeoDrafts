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
  
  content = content.replace(
    /\{sizeCountry\.stats\.size\.score\}/g, 
    '{extractBonusText(sizeCountry.stats.size.description, "Size")}'
  );
  
  content = content.replace(
    /\{popCountry\.stats\.population\.score\}M/g, 
    '{extractBonusText(popCountry.stats.population.description, "Population")}'
  );
  
  content = content.replace(
    /\{scoreVal\}\{actualCat === "Population" \? "M" : ""\}/g, 
    '{extractBonusText(desc, actualCat)}'
  );
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}
