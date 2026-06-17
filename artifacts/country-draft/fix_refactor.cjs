const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const modes = ['normal', 'daily', 'double', 'party', 'sabotage', 'guess'];

modes.forEach(mode => {
  const gameSharedFile = path.join(srcDir, 'pages', mode, 'GameShared.tsx');
  if (fs.existsSync(gameSharedFile)) {
    let shared = fs.readFileSync(gameSharedFile, 'utf8');
    
    // Fix line 159
    shared = shared.replace(/weight = CATEGORY_WEIGHTS\[actualCat\] \?\? 1\.0;/g, 'weight = CATEGORY_MAX_SCORES[actualCat] ?? 10;');
    
    // Fix line 171
    shared = shared.replace(/const sl = pngScoreLabel\(scoreVal, weight\);/g, 'const sl = pngScoreLabel(scoreVal);');
    
    // Fix wScore computation logic since scores are raw unweighted now!
    // const wScore = scoreVal * weight;
    shared = shared.replace(/const wScore = scoreVal \* weight;/g, 'const wScore = scoreVal;');
    
    // Fix progress bar logic: ((CARD_W - 24) * scoreVal) / 10
    // The max score is now `weight` (which is actually `maxScore` variable).
    // Let's replace ((CARD_W - 24) * scoreVal) / 10 with ((CARD_W - 24) * scoreVal) / weight
    shared = shared.replace(/\(\(CARD_W - 24\) \* scoreVal\) \/ 10/g, '((CARD_W - 24) * scoreVal) / weight');
    
    fs.writeFileSync(gameSharedFile, shared);
  }
});

console.log('Game modes fixed.');
