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

  // Replace inside assignCountry
  // We look for: const newRoster = { ...prev.roster, [category]: prev.currentCountry };
  // or something similar.
  const regexRoster = /const newRoster = \{ \.\.\.prev\.roster, \[category\]: prev\.currentCountry \};/g;
  
  if (content.match(regexRoster)) {
    content = content.replace(regexRoster, 
      `const timeTaken = Date.now() - (prev.currentTurnStartTime || Date.now());
      const newCategoryTimes = { ...(prev.categoryTimes || {}), [category]: timeTaken };
      const newRoster = { ...prev.roster, [category]: prev.currentCountry };`
    );
  } else {
    // maybe parameter is named `cat` instead of `category`
    const regexRoster2 = /const newRoster = \{ \.\.\.prev\.roster, \[cat\]: prev\.currentCountry \};/g;
    if (content.match(regexRoster2)) {
      content = content.replace(regexRoster2, 
        `const timeTaken = Date.now() - (prev.currentTurnStartTime || Date.now());
        const newCategoryTimes = { ...(prev.categoryTimes || {}), [cat]: timeTaken };
        const newRoster = { ...prev.roster, [cat]: prev.currentCountry };`
      );
    }
  }

  // Now add it to the return block
  // We need to inject `categoryTimes: newCategoryTimes, currentTurnStartTime: Date.now()`
  // into the return statement inside assignCountry.
  // This is tricky using regex, let's just do it string manipulation on the specific line or regex that targets the return block of assignCountry
  
  const returnBlockRegex = /(return \{\s*\.\.\.prev,\s*roster: newRoster,\s*pool: newPool,\s*currentCountry: nextCountry,\s*gameOver: isGameOver\s*\};)/g;
  if (content.match(returnBlockRegex)) {
    content = content.replace(returnBlockRegex, `return {
        ...prev, roster: newRoster, pool: newPool, currentCountry: nextCountry,
        gameOver: isGameOver, categoryTimes: newCategoryTimes, currentTurnStartTime: Date.now()
      };`);
  } else {
     // try a more generic approach if there are variations
     const returnBlockGeneric = /return \{\s*\.\.\.prev,\s*(?:roster: newRoster|currentCountry: null)[^}]*gameOver: isGameOver\s*\};/g;
     content = content.replace(returnBlockGeneric, (match) => {
       return match.replace('};', ',\n        categoryTimes: newCategoryTimes, currentTurnStartTime: Date.now()\n      };');
     });
  }

  // Handle DoubleDraft wildcard resolve:
  // onResolveWildcard
  const wildcardResolveRegex = /newRoster\[prev\.wildcardTargetCategory\] = country;\s*return \{/g;
  if (content.match(wildcardResolveRegex)) {
    content = content.replace(wildcardResolveRegex, 
      `const timeTaken = Date.now() - (prev.currentTurnStartTime || Date.now());
      const newCategoryTimes = { ...(prev.categoryTimes || {}), [prev.wildcardTargetCategory]: timeTaken };
      newRoster[prev.wildcardTargetCategory] = country;
      return {
        categoryTimes: newCategoryTimes,
        currentTurnStartTime: Date.now(),`
    );
  }
  
  // Normal mode wildcard:
  const normalWildcardRegex = /const newRoster = \{ \.\.\.prev\.roster \};\s*newRoster\[cat\] = prev\.pool\[prev\.pool\.length - 1\];/g;
  if (content.match(normalWildcardRegex)) {
    content = content.replace(normalWildcardRegex,
      `const timeTaken = Date.now() - (prev.currentTurnStartTime || Date.now());
      const newCategoryTimes = { ...(prev.categoryTimes || {}), [cat]: timeTaken };
      const newRoster = { ...prev.roster };
      newRoster[cat] = prev.pool[prev.pool.length - 1];`
    );
    // Add to return block inside normal applyWildcard
    // "pool: newPool, currentCountry: nextCountry, wildcardUsed: true, gameOver: false"
    const applyWildcardReturn = /roster: newRoster,\s*pool: newPool,\s*currentCountry: nextCountry,\s*wildcardUsed: true,\s*gameOver: false/g;
    content = content.replace(applyWildcardReturn, `roster: newRoster, pool: newPool, currentCountry: nextCountry, wildcardUsed: true, gameOver: false, categoryTimes: newCategoryTimes, currentTurnStartTime: Date.now()`);
  }

  // Need to handle Double Draft wildcard start (resetting currentTurnStartTime)
  const applyWildcardDoubleRegex = /wildcardTargetCategory: cat,/g;
  if (f.includes('DoubleDraftGame') && content.match(applyWildcardDoubleRegex)) {
    content = content.replace(applyWildcardDoubleRegex, `wildcardTargetCategory: cat, currentTurnStartTime: Date.now(),`);
  }

  fs.writeFileSync(f, content);
}
console.log("assignCountry updated!");
