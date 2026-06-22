import { readFileSync, writeFileSync } from 'fs';

let normal = readFileSync('src/pages/normal/NormalUI.tsx', 'utf8');
normal = normal.replace(
  /achievementsToUnlock: achievementsRef\.current\n\s*}\)\.catch\(console\.error\);/g,
  `achievementsToUnlock: achievementsRef.current,
            isDaily: isDailyMode
          }).catch(console.error);`
);
writeFileSync('src/pages/normal/NormalUI.tsx', normal);

let double = readFileSync('src/pages/double/DoubleUI.tsx', 'utf8');
double = double.replace(
  /achievementsToUnlock: achievementsRef\.current\n\s*}\)\.catch\(console\.error\);/g,
  `achievementsToUnlock: achievementsRef.current,
            isDaily: isDailyMode
          }).catch(console.error);`
);
writeFileSync('src/pages/double/DoubleUI.tsx', double);
