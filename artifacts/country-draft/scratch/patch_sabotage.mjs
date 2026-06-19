import fs from 'fs';

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const exactAssign = `  const assignCountry = useCallback((category: Category) => {
    if (state.roster[category] || !roomCode || !firebaseUser) return;
    setState(prev => {
      if (!prev.currentCountry) return prev;
      const newRoster = { ...prev.roster, [category]: prev.currentCountry };
      const isGameOver = CATEGORIES.every(c => newRoster[c]);

      updatePlayer(roomCode, firebaseUser.uid, { finishedRound: true });

      return {
        ...prev, roster: newRoster, currentCountry: null,
        gameOver: isGameOver
      };
    });
    setHoveredCategory(null);
  }, [state.roster, roomCode, firebaseUser]);`;

  const newAssign = `  const assignCountry = useCallback((category: Category) => {
    if (state.roster[category] || !roomCode || !firebaseUser) return;
    setState(prev => {
      if (!prev.currentCountry) return prev;
      const newRoster = { ...prev.roster, [category]: prev.currentCountry };
      const isGameOver = CATEGORIES.every(c => newRoster[c]);
      
      // Calculate score right away
      const baseScore = CATEGORIES.reduce((sum, cat) => {
        const country = newRoster[cat]; if (!country) return sum;
        if (BONUS_CATEGORIES.includes(cat)) return sum;
        const key = getCategoryKey(cat); return sum + country.stats[key].score;
      }, 0);
      const bonusScore = computeSizePopBonus(newRoster);
      const finalScore = baseScore + bonusScore;
      
      // Map roster to Record<string, string> of names
      const mappedRoster = {} as Record<string, string>;
      for (const cat of CATEGORIES) {
         if (newRoster[cat]) mappedRoster[cat] = newRoster[cat].name;
      }

      updatePlayer(roomCode, firebaseUser.uid, { finishedRound: true, score: finalScore, roster: mappedRoster });

      return {
        ...prev, roster: newRoster, currentCountry: null,
        gameOver: isGameOver
      };
    });
    setHoveredCategory(null);
  }, [state.roster, roomCode, firebaseUser]);`;

  if (content.includes(exactAssign)) {
    content = content.replace(exactAssign, newAssign);
  } else {
    console.warn("Could not find assign logic");
  }

  fs.writeFileSync(filePath, content);
}

patchFile('src/pages/sabotage/SabotageGame.tsx');
