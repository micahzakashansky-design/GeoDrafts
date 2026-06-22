import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/associations/AssociationsGame.tsx', 'utf8');

const gameOverRegex = /if \(isGameOver\) \{\s*return \([\s\S]*?<\/div>\s*\);\s*\}/;

const gameOverNew = `if (isGameOver) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 pt-12 md:p-12 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-card border-2 border-border p-10 rounded-[2rem] text-center shadow-xl flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-8 rotate-12">
            <span className="text-6xl drop-shadow-md -rotate-12">🏆</span>
          </div>
          
          <h1 className="text-4xl font-black font-sans tracking-tighter mb-2 text-foreground">
            Game Over!
          </h1>
          <p className="text-muted-foreground text-lg mb-10 font-medium">
            You scored <span className="font-black text-foreground">{score}</span> out of {questions.length}.
          </p>
          
          <div className="w-full space-y-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLocation("/game/associations/setup")}
              className="w-full py-5 rounded-2xl bg-foreground text-background font-black text-xl transition-all shadow-md uppercase tracking-widest"
            >
              Play Again
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLocation("/")}
              className="w-full py-5 rounded-2xl bg-card border-2 border-border text-foreground font-black text-lg transition-all hover:bg-muted/50 uppercase tracking-widest"
            >
              Main Menu
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }`;

content = content.replace(gameOverRegex, gameOverNew);

writeFileSync('src/pages/associations/AssociationsGame.tsx', content);
