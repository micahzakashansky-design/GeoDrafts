import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/associations/AssociationsGame.tsx', 'utf8');

// Add handleWrong
content = content.replace(
  'const handleCorrect = () => {\n    setScore(s => s + 1);\n    nextQuestion();\n  };',
  'const handleCorrect = () => {\n    setScore(s => s + 1);\n    nextQuestion();\n  };\n\n  const handleWrong = () => {\n    nextQuestion();\n  };'
);

// Pass onWrong to AssociationsUI
content = content.replace(
  '<AssociationsUI \n          question={currentQuestion} \n          onCorrect={handleCorrect} \n          onSkip={handleSkip}\n          validIsos={validIsos}\n        />',
  '<AssociationsUI \n          question={currentQuestion} \n          onCorrect={handleCorrect} \n          onWrong={handleWrong}\n          onSkip={handleSkip}\n          validIsos={validIsos}\n        />'
);

writeFileSync('src/pages/associations/AssociationsGame.tsx', content);
