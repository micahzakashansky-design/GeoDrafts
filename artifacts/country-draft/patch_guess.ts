import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');

// Add import
content = content.replace(
  /import { SubmitDialog } from ".\/SubmitDialog";\nimport { savePersonalScore } from "@\/lib\/local-leaderboard";/,
  `import { SubmitDialog } from "./SubmitDialog";\nimport { savePersonalScore } from "@/lib/local-leaderboard";\nimport { processGameEndStats } from "@/lib/firestore";\nimport { useFirebaseAuth } from "@/lib/firebase-auth";`
);

// Add useFirebaseAuth
content = content.replace(
  /export default function GuessGame\(\) {\n  const \[, navigate\] = useLocation\(\);\n  const \[showStatsModal, setShowStatsModal\] = useState\(false\);/,
  `export default function GuessGame() {\n  const [, navigate] = useLocation();\n  const [showStatsModal, setShowStatsModal] = useState(false);\n  const { firebaseUser } = useFirebaseAuth();`
);

// Add processGameEndStats call
const hookRegex = /React\.useEffect\(\(\) => \{\n    if \(state\.gameOver && !localSavedRef\.current\) \{\n      savePersonalScore\("guess", \{ \n        score: guessScore, \n        guesses: state\.guesses,\n        mysteryCountry: state\.mysteryCountry\?\.name\n      \}\);\n      localSavedRef\.current = true;\n    \}\n  \}, \[state\.gameOver, guessScore, state\.guesses, state\.mysteryCountry\]\);/g;

const newHook = `React.useEffect(() => {
    if (state.gameOver && !localSavedRef.current) {
      savePersonalScore("guess", { 
        score: guessScore, 
        guesses: state.guesses,
        mysteryCountry: state.mysteryCountry?.name
      });
      if (firebaseUser) {
        processGameEndStats(firebaseUser.uid, {
          mode: "guess",
          firstTryGuess: state.guesses.length === 1 && state.guesses[0].toLowerCase() === state.mysteryCountry?.name.toLowerCase(),
          score: guessScore
        }).catch(console.error);
      }
      localSavedRef.current = true;
    }
  }, [state.gameOver, guessScore, state.guesses, state.mysteryCountry, firebaseUser]);`;

content = content.replace(hookRegex, newHook);

writeFileSync('src/pages/guess/GuessGame.tsx', content);
