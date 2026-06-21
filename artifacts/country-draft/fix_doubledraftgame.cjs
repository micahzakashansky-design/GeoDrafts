const fs = require('fs');

let content = fs.readFileSync('src/pages/double/DoubleDraftGame.tsx', 'utf8');

const oldApplyWildcard = `  const applyWildcard = useCallback((cat: Category) => {
    if (!wildcardPhase || state.wildcardUsed) return;
    localSavedRef.current = false;
    setState(prev => {
      const newRoster = { ...prev.roster };
      delete newRoster[cat];
      const newPool = [...prev.pool];
      const c1 = newPool.pop();
      const c2 = newPool.pop();
      const options = c1 && c2 ? [c1, c2] : null;
      return { 
        ...prev, 
        roster: newRoster, 
        selectionOptions: options, 
        currentCountry: null, 
        pool: newPool, 
        wildcardUsed: true, 
        gameOver: false 
      };
    });
    setWildcardPhase(false);
  }, [wildcardPhase, state.wildcardUsed]);`;

const newApplyWildcard = `  const applyWildcard = useCallback((cat: Category) => {
    if (!wildcardPhase || state.wildcardUsed) return;
    localSavedRef.current = false;
    setState(prev => {
      const newPool = [...prev.pool];
      const c1 = newPool.pop();
      const c2 = newPool.pop();
      const options = c1 && c2 ? [c1, c2] : null;
      return { 
        ...prev, 
        selectionOptions: options, 
        wildcardTargetCategory: cat,
        currentCountry: null, 
        pool: newPool, 
        wildcardUsed: true, 
        // Keep gameOver as true since we're on the game over screen
        gameOver: true 
      };
    });
    setWildcardPhase(false);
  }, [wildcardPhase, state.wildcardUsed]);

  const onResolveWildcard = useCallback((country: Country) => {
    setState(prev => {
      if (!prev.wildcardTargetCategory) return prev;
      const newRoster = { ...prev.roster };
      newRoster[prev.wildcardTargetCategory] = country;
      return {
        ...prev,
        roster: newRoster,
        selectionOptions: null,
        wildcardTargetCategory: null,
      };
    });
    localSavedRef.current = false; // Trigger save of new final score
  }, []);`;

content = content.replace(oldApplyWildcard, newApplyWildcard);

const oldGameOverElement = `<GameOver roster={state.roster} totalScore={finalScore} bonus={bonus} onReset={doReset} onDownload={() => {}} onWildcard={() => setWildcardPhase(true)} onWildcardSelect={applyWildcard} setWildcardPhase={setWildcardPhase} wildcardUsed={state.wildcardUsed} wildcardPhase={wildcardPhase} rosterRef={rosterRef} isHardMode={state.isHardMode} isDailyMode={false} onSubmitLeaderboard={() => setShowSubmitDialog(true)} gameMode="double" leaderboardSubmitted={state.leaderboardSubmitted} />`;

const newGameOverElement = `<GameOver roster={state.roster} totalScore={finalScore} bonus={bonus} onReset={doReset} onDownload={() => {}} onWildcard={() => setWildcardPhase(true)} onWildcardSelect={applyWildcard} setWildcardPhase={setWildcardPhase} wildcardUsed={state.wildcardUsed} wildcardPhase={wildcardPhase} rosterRef={rosterRef} isHardMode={state.isHardMode} isDailyMode={false} onSubmitLeaderboard={() => setShowSubmitDialog(true)} gameMode="double" leaderboardSubmitted={state.leaderboardSubmitted} wildcardOptions={state.selectionOptions} wildcardTargetCategory={state.wildcardTargetCategory} onResolveWildcard={onResolveWildcard} />`;

content = content.replace(oldGameOverElement, newGameOverElement);

const oldReset = `    setState({
      pool, currentCountry: null, selectionOptions: selection, mysteryCountry: null, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "double", isHardMode,
      roomCode: null, poolSeed: 0
    });`;

const newReset = `    setState({
      pool, currentCountry: null, selectionOptions: selection, mysteryCountry: null, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "double", isHardMode,
      roomCode: null, poolSeed: 0, wildcardTargetCategory: null
    });`;

content = content.replace(oldReset, newReset);

fs.writeFileSync('src/pages/double/DoubleDraftGame.tsx', content);
console.log("Updated DoubleDraftGame!");
