import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/Home.tsx', 'utf8');

const regex = /const todayKey = useMemo\(\(\) => new Date\(\)\.toISOString\(\)\.slice\(0, 10\), \[\]\); const todayLabel = useMemo\(\(\) => new Date\(\)\.toLocaleDateString\("en-US", \{ weekday: "long", month: "long", day: "numeric" \}\), \[\]\);/g;

const replacement = 'const todayKey = useMemo(() => new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }), []); const todayLabel = useMemo(() => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/New_York" }), []);';

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  writeFileSync('src/pages/Home.tsx', content);
  console.log('Replaced todayKey and todayLabel in Home.tsx');
} else {
  console.log('Regex not found in Home.tsx');
}
