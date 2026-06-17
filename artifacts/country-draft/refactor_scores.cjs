const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const countriesFile = path.join(srcDir, 'data', 'countries.ts');

let content = fs.readFileSync(countriesFile, 'utf8');

const weights = {
  military: 1.5, economy: 1.5, government: 1.5,
  internationalRelationships: 1.2, technology: 1.2, education: 1.2, naturalResources: 1.2, healthcare: 1.2
};

for (const [key, weight] of Object.entries(weights)) {
  const regex = new RegExp(`(${key}\\s*:\\s*\\{\\s*score\\s*:\\s*)(\\d+)(,\\s*description)`, 'g');
  content = content.replace(regex, (match, p1, p2, p3) => {
    let newScore = Math.round(parseInt(p2) * weight);
    return p1 + newScore + p3;
  });
}

fs.writeFileSync(countriesFile, content);
console.log('countries.ts updated.');

const modes = ['normal', 'daily', 'double', 'party', 'sabotage', 'guess'];

modes.forEach(mode => {
  const gameSharedFile = path.join(srcDir, 'pages', mode, 'GameShared.tsx');
  if (fs.existsSync(gameSharedFile)) {
    let shared = fs.readFileSync(gameSharedFile, 'utf8');
    
    shared = shared.replace(/export const CATEGORY_WEIGHTS/g, 'export const CATEGORY_MAX_SCORES');
    shared = shared.replace(/Military: 1\.5, Economy: 1\.5, Government: 1\.5/g, 'Military: 15, Economy: 15, Government: 15');
    shared = shared.replace(/"International Relationships": 1\.2, Technology: 1\.2, Education: 1\.2, "Natural Resources": 1\.2, Healthcare: 1\.2/g, '"International Relationships": 12, Technology: 12, Education: 12, "Natural Resources": 12, Healthcare: 12');
    shared = shared.replace(/Location: 1\.0, Size: 1\.0, Population: 1\.0, Culture: 1\.0, Climate: 1\.0, History: 1\.0, Tourism: 1\.0/g, 'Location: 10, Size: 10, Population: 10, Culture: 10, Climate: 10, History: 10, Tourism: 10');
    
    shared = shared.replace(/const w = CATEGORY_WEIGHTS\[cat\] \?\? 1\.0;/g, 'const maxScore = CATEGORY_MAX_SCORES[cat] ?? 10;');
    shared = shared.replace(/if \(w >= 1\.5\) return "★★★";/g, 'if (maxScore === 15) return "★★★";');
    shared = shared.replace(/if \(w >= 1\.2\) return "★★";/g, 'if (maxScore === 12) return "★★";');
    
    shared = shared.replace(/const weight = CATEGORY_WEIGHTS\[cat\] \?\? 1\.0; return \`\$\{Math\.round\(score \* weight\)\}\/\$\{Math\.round\(10 \* weight\)\} pts\`;/g, 'const maxScore = CATEGORY_MAX_SCORES[cat] ?? 10; return `${score}/${maxScore} pts`;');
    
    shared = shared.replace(/const weight = CATEGORY_WEIGHTS\[cat\] \?\? 1\.0;/g, 'const maxScore = CATEGORY_MAX_SCORES[cat] ?? 10;');
    shared = shared.replace(/const scoreLabel = getScoreLabel\(Math\.round\(stat\.score \* weight\)\);/g, 'const scoreLabel = getScoreLabel(stat.score);');
    shared = shared.replace(/const scoreLabel = pngScoreLabel\(stat\.score, weight\);/g, 'const scoreLabel = pngScoreLabel(stat.score);');
    shared = shared.replace(/export function pngScoreLabel\(score: number, weight: number\): string/g, 'export function pngScoreLabel(score: number): string');
    shared = shared.replace(/const weighted = score \* weight; if \(weighted >= 13\.5\) return "World-Class";/g, 'if (score >= 13.5) return "World-Class";');
    shared = shared.replace(/if \(weighted >= 10\) return "Strong"; if \(weighted >= 7\) return "Moderate";/g, 'if (score >= 10) return "Strong"; if (score >= 7) return "Moderate";');
    shared = shared.replace(/if \(weighted >= 4\) return "Weak"; return "Critical";/g, 'if (score >= 4) return "Weak"; return "Critical";');
    
    shared = shared.replace(/const weight = CATEGORY_WEIGHTS\[actualCat\] \?\? 1\.0;/g, 'const maxScore = CATEGORY_MAX_SCORES[actualCat] ?? 10;');
    shared = shared.replace(/scoreVal = assigned\.stats\[ck\]\.score; weight = CATEGORY_WEIGHTS\[actualCat\] \?\? 1\.0; desc = assigned\.stats\[ck\]\.description;/g, 'scoreVal = assigned.stats[ck].score; const maxScore = CATEGORY_MAX_SCORES[actualCat] ?? 10; desc = assigned.stats[ck].description;');
    
    // There's also CATEGORY_WEIGHTS in CountryCard for weight display
    shared = shared.replace(/const weight = CATEGORY_MAX_SCORES\[cat\] \?\? 1\.0;/g, 'const maxScore = CATEGORY_MAX_SCORES[cat] ?? 10;');

    fs.writeFileSync(gameSharedFile, shared);
  }
  
  const gameFiles = fs.readdirSync(path.join(srcDir, 'pages', mode)).filter(f => f.endsWith('Game.tsx'));
  gameFiles.forEach(file => {
    const filePath = path.join(srcDir, 'pages', mode, file);
    let game = fs.readFileSync(filePath, 'utf8');
    
    game = game.replace(/CATEGORY_WEIGHTS/g, 'CATEGORY_MAX_SCORES');
    game = game.replace(/const key = getCategoryKey\(cat\); const raw = country\.stats\[key\]\.score; const weight = CATEGORY_MAX_SCORES\[cat\] \?\? 1\.0;/g, 'const key = getCategoryKey(cat); const score = country.stats[key].score;');
    game = game.replace(/return sum \+ Math\.round\(raw \* weight\);/g, 'return sum + score;');
    
    fs.writeFileSync(filePath, game);
  });
});

console.log('Game modes updated.');
