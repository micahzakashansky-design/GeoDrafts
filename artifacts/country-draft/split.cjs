const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const pagesDir = path.join(srcDir, 'pages');

const modes = [
  { dir: 'normal', gameFile: 'NormalGame.tsx' },
  { dir: 'daily', gameFile: 'DailyGame.tsx' },
  { dir: 'double', gameFile: 'DoubleDraftGame.tsx' },
  { dir: 'party', gameFile: 'PartyGame.tsx' },
  { dir: 'sabotage', gameFile: 'SabotageGame.tsx' },
  { dir: 'guess', gameFile: 'GuessGame.tsx' }
];

const sharedFiles = ['GameShared.tsx', 'SidebarRoster.tsx', 'SubmitDialog.tsx'];

// 1. Create directories and copy files
modes.forEach(mode => {
  const modeDir = path.join(pagesDir, mode.dir);
  if (!fs.existsSync(modeDir)) {
    fs.mkdirSync(modeDir);
  }
  
  // Copy game file
  const gameSrc = path.join(pagesDir, mode.gameFile);
  if (fs.existsSync(gameSrc)) {
    const gameDest = path.join(modeDir, mode.gameFile);
    fs.copyFileSync(gameSrc, gameDest);
  }
  
  // Copy shared files
  sharedFiles.forEach(shared => {
    const sharedSrc = path.join(pagesDir, shared);
    if (fs.existsSync(sharedSrc)) {
      const sharedDest = path.join(modeDir, shared);
      fs.copyFileSync(sharedSrc, sharedDest);
    }
  });
});

// 2. Update App.tsx
const appFile = path.join(srcDir, 'App.tsx');
let appContent = fs.readFileSync(appFile, 'utf8');

modes.forEach(mode => {
  const gameName = mode.gameFile.replace('.tsx', '');
  const oldImport = `import ${gameName} from "@/pages/${gameName}";`;
  const newImport = `import ${gameName} from "@/pages/${mode.dir}/${gameName}";`;
  appContent = appContent.replace(oldImport, newImport);
});

fs.writeFileSync(appFile, appContent);

// 3. Delete old files
modes.forEach(mode => {
  const gameSrc = path.join(pagesDir, mode.gameFile);
  if (fs.existsSync(gameSrc)) {
    fs.unlinkSync(gameSrc);
  }
});

sharedFiles.forEach(shared => {
  const sharedSrc = path.join(pagesDir, shared);
  if (fs.existsSync(sharedSrc)) {
    fs.unlinkSync(sharedSrc);
  }
});

console.log("Separation complete.");
