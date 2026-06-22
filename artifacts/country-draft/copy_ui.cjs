const fs = require('fs');
const path = require('path');

const dailyDir = "src/pages/daily";
const normalDir = "src/pages/normal";

const files = fs.readdirSync(dailyDir);

for (const filename of files) {
    if (!filename.endsWith('.tsx')) continue;
    
    let content = fs.readFileSync(path.join(dailyDir, filename), 'utf8');
    
    content = content.replace(/DailyGame/g, 'NormalGame');
    content = content.replace(/DailyUI/g, 'NormalUI');
    content = content.replace(/mode="daily"/g, 'mode="normal"');
    content = content.replace(/isDailyMode={true}/g, 'isDailyMode={false}');
    content = content.replace(/savePersonalScore\("daily"/g, 'savePersonalScore(state.isHardMode ? "hard" : "normal"');
    
    if (content.includes('CalendarDays')) {
        content = content.replace(
            /<div className="px-2.5 py-1 rounded-md bg-\[#111111\] text-xs font-semibold text-white\/70 border border-white\/10 hidden sm:flex items-center gap-1\.5">[\s\S]*?Daily Challenge[\s\S]*?<\/div>/g,
            '<div className="px-2.5 py-1 rounded-md bg-[#111111] text-xs font-semibold text-white/70 border border-white/10 hidden sm:block">\n            Classic {state.isHardMode ? "(Hard)" : "(Easy)"}\n          </div>'
        );
    }
    
    // Remove the dailyDate local storage initialization logic that shouldn't be in Classic
    if (filename === 'DailyGame.tsx') {
        content = content.replace(/const dailyDate = new Date\(\)\.toISOString\(\)\.slice\(0, 10\);/, 'const isHardMode = localStorage.getItem("countryDraftHardMode") === "true";');
        content = content.replace(/const poolSeed = dateStrToSeed\(dailyDate\);/, '');
        content = content.replace(/const pool = seededShuffle\(\[\.\.\.COUNTRIES\], poolSeed\);/, 'let pool = shuffleArray([...COUNTRIES]);');
        content = content.replace(/const mystery = null;\n\s*const selection = null;/, '');
        content = content.replace(/\/\/ Check local storage for existing daily state[\s\S]*?\} catch \{\}/, '');
        content = content.replace(/selectionOptions: selection, mysteryCountry: mystery/, 'selectionOptions: null, mysteryCountry: null');
        content = content.replace(/isHardMode: false/, 'isHardMode');
        content = content.replace(/poolSeed/, 'poolSeed: 0');
        content = content.replace(/dailyDate,/, 'dailyDate: "",');
        content = content.replace(/\/\/ Save state on change[\s\S]*?\}\, \[state\]\);/, '');
        content = content.replace(/localStorage\.setItem\(`countryDraftDailyResult_\$\{state\.dailyDate\}`\, JSON\.stringify\(\{ score: finalScore, completed: true \}\)\);/, '');
        content = content.replace(/state\.dailyDate/g, 'state.isHardMode');
        content = content.replace(/import \{.*?seededShuffle, dateStrToSeed.*?\} from "\.\/NormalUI";/, 'import { CountryCard, GameOver, GameState, computeSizePopBonus } from "./NormalUI";');
        
        // Add shuffleArray if missing
        if (!content.includes('shuffleArray')) {
            content = content.replace('import { COUNTRIES }', 'import { COUNTRIES, shuffleArray }');
        }
    }
    
    let targetName = filename;
    if (filename === 'DailyGame.tsx') targetName = 'NormalGame.tsx';
    if (filename === 'DailyUI.tsx') targetName = 'NormalUI.tsx';
    
    fs.writeFileSync(path.join(normalDir, targetName), content);
    console.log(`Copied ${filename} to ${targetName}`);
}
