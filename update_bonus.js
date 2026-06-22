const fs = require('fs');
const path = require('path');

const uiFiles = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

const newFunctions = `export function computeSizePopBonus(roster: Partial<Record<Category, Country>>): number {
  if (!roster.Size || !roster.Population) return 0;
  
  const sizeScore = roster.Size.stats.size.score;
  const popScore = roster.Population.stats.population.score;
  const density = popScore / sizeScore;

  let agriMult = 1.0;
  if (density > 0.5) agriMult = Math.max(0.1, 1.0 - ((density - 0.5) / 1.5) * 0.9);

  let techMult = 1.0;
  if (density < 2.0) techMult = Math.max(0.1, 1.0 - ((2.0 - density) / 1.5) * 0.9);

  let extMult = 0.1;
  if (density >= 0.8 && density <= 1.2) {
    extMult = 1.0;
  } else if (density > 0.3 && density < 0.8) {
    extMult = 0.1 + ((density - 0.3) / 0.5) * 0.9;
  } else if (density > 1.2 && density < 2.5) {
    extMult = Math.max(0.1, 1.0 - ((density - 1.2) / 1.3) * 0.9);
  }

  const resourcesScore = roster["Natural Resources"]?.stats.naturalResources?.score || 0;
  const climateScore = roster.Climate?.stats.climate?.score || 0;
  const techScore = roster.Technology?.stats.technology?.score || 0;
  const locationScore = roster.Location?.stats.location?.score || 0;

  const agriBonus = 25 * ((resourcesScore + climateScore) / 22) * agriMult;
  const techBonus = 25 * ((techScore + locationScore) / 22) * techMult;
  const extBonus = 25 * ((resourcesScore + techScore) / 24) * extMult;

  return Math.floor(Math.max(agriBonus, techBonus, extBonus));
}

export type Archetype = { name: string; icon: React.ReactNode; desc: string };
export function getBonusPath(roster: Partial<Record<Category, Country>>): "agricultural" | "urban" | "extraction" | null {
  if (!roster.Size || !roster.Population) return null;
  const sizeScore = roster.Size.stats.size.score;
  const popScore = roster.Population.stats.population.score;
  const density = popScore / sizeScore;

  let agriMult = 1.0;
  if (density > 0.5) agriMult = Math.max(0.1, 1.0 - ((density - 0.5) / 1.5) * 0.9);
  let techMult = 1.0;
  if (density < 2.0) techMult = Math.max(0.1, 1.0 - ((2.0 - density) / 1.5) * 0.9);
  let extMult = 0.1;
  if (density >= 0.8 && density <= 1.2) extMult = 1.0;
  else if (density > 0.3 && density < 0.8) extMult = 0.1 + ((density - 0.3) / 0.5) * 0.9;
  else if (density > 1.2 && density < 2.5) extMult = Math.max(0.1, 1.0 - ((density - 1.2) / 1.3) * 0.9);

  const resourcesScore = roster["Natural Resources"]?.stats.naturalResources?.score || 0;
  const climateScore = roster.Climate?.stats.climate?.score || 0;
  const techScore = roster.Technology?.stats.technology?.score || 0;
  const locationScore = roster.Location?.stats.location?.score || 0;

  const agriBonus = 25 * ((resourcesScore + climateScore) / 22) * agriMult;
  const techBonus = 25 * ((techScore + locationScore) / 22) * techMult;
  const extBonus = 25 * ((resourcesScore + techScore) / 24) * extMult;

  const max = Math.max(agriBonus, techBonus, extBonus);
  if (max === 0) return null;
  if (max === agriBonus) return "agricultural";
  if (max === techBonus) return "urban";
  return "extraction";
}`;

for (const file of uiFiles) {
  const fullPath = path.join(__dirname, 'artifacts/country-draft', file);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');

  // Regex to match computeSizePopBonus and getBonusPath
  const regex = /export function computeSizePopBonus[\s\S]*?export function getBonusPath[^{]*{[^{}]*(?:{[^{}]*}[^{}]*)*}/g;
  
  // Wait, let's just replace from computeSizePopBonus up to getCountryArchetype
  const startStr = "export function computeSizePopBonus";
  const endStr = "export function getCountryArchetype";
  
  const startIndex = content.indexOf(startStr);
  const endIndex = content.indexOf(endStr);
  
  if (startIndex !== -1 && endIndex !== -1) {
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    
    fs.writeFileSync(fullPath, before + newFunctions + "\n\n" + after);
    console.log("Updated", file);
  }
}
