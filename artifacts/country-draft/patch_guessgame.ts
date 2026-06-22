import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');

// Replace unlockAchievements import if present, or add processGameEndStats
content = content.replace(
  /import {([^}]+)saveScore([^}]+)} from "@\/lib\/firestore";/,
  'import {$1saveScore, processGameEndStats$2} from "@/lib/firestore";'
);

// We want to add processGameEndStats in a useEffect that runs once when gameOver happens and the user is logged in
const effect = `
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      setTimeout(() => {
        if (!isMounted.current && firebaseUser && state.gameOver) {
          const isWin = state.guesses.length > 0 && state.guesses[state.guesses.length - 1].toLowerCase() === state.mysteryCountry?.name.toLowerCase();
          const firstTry = isWin && state.guesses.length === 1 && (state.hintsRevealed || 0) === 0;
          processGameEndStats(firebaseUser.uid, {
            mode: "guess",
            firstTryGuess: firstTry
          }).catch(console.error);
        }
      }, 100);
    };
  }, [firebaseUser, state.gameOver, state.guesses, state.mysteryCountry, state.hintsRevealed]);
`;

// Insert the effect and useRef inside the GuessGame component
// Looking for `const { firebaseUser } = useFirebaseAuth();`
content = content.replace(
  /const { firebaseUser } = useFirebaseAuth\(\);/,
  `const { firebaseUser } = useFirebaseAuth();\n${effect}`
);

// We need to import useRef if not present
if (!content.includes('useRef')) {
  content = content.replace(/import React, { useState, useEffect, useMemo, useCallback } from "react";/, 'import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";');
}

writeFileSync('src/pages/guess/GuessGame.tsx', content);
