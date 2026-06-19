const fs = require('fs');

const tsFile = 'src/pages/Leaderboard.tsx';
let content = fs.readFileSync(tsFile, 'utf8');

// Ensure Logo is imported
if (!content.includes('import { Logo }')) {
  content = content.replace(
    /import \{ useTheme \} from "@/lib\/theme-context";/,
    'import { useTheme } from "@/lib/theme-context";\nimport { Logo } from "@/components/Logo";'
  );
}

const oldHeaderRegex = /<header className="border-b border-border px-6 py-3 flex items-center justify-between bg-card\/50 backdrop-blur-sm sticky top-0 z-40">[\s\S]*?<\/header>/;

const newHeader = `<header className="h-14 md:h-16 shrink-0 border-b border-border/50 bg-card/50 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="font-serif text-lg md:text-xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity duration-75">
            <Logo className="w-5 h-5" />GeoDrafts
          </button>
          <div className="h-4 w-px bg-border hidden md:block" />
          <div className="px-2.5 py-1 rounded-md bg-secondary text-xs font-semibold text-muted-foreground border border-border hidden sm:block">
            Leaderboards
          </div>
        </div>
      </header>`;

if (oldHeaderRegex.test(content)) {
  content = content.replace(oldHeaderRegex, newHeader);
  fs.writeFileSync(tsFile, content);
  console.log('Replaced header successfully.');
} else {
  console.log('Could not find the old header to replace.');
}
