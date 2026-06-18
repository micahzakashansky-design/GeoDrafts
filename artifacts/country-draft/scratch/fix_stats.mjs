import fs from 'fs';
let content = fs.readFileSync('src/data/countries.ts', 'utf-8');

// Fix population formatting in extractBonusText
content = content.replace(
  /if \(cat === "Population" && !text\.toUpperCase\(\)\.endsWith\("M"\)\) {\n\s*text \+= "M";\n\s*}/,
  `if (cat === "Population") {\n      text = text.trim();\n      if (!text.toUpperCase().endsWith("M")) text += "M";\n      if (!text.endsWith(" ppl")) text += " ppl";\n    }`
);

// Fix new country size descriptions (convert commas to K/M)
content = content.replace(/(\d{1,3}),(\d{3})\s*km²/g, (match, p1, p2) => {
  return `${p1}K km²`;
});
content = content.replace(/(\d{1,3}),(\d{3}),(\d{3})\s*km²/g, (match, p1, p2, p3) => {
  return `${p1}.${p2[0]}M km²`;
});

// Also fix "13.2 million" to "13.2M ppl" if that's what they meant in the description?
// Wait, they probably just meant the extracted text since the screenshot showed the extracted text being "13.2 M".
// But let's also trim whitespace from the extracted text for size.
content = content.replace(
  /let text = match\[1\];/,
  `let text = match[1].trim();`
);

fs.writeFileSync('src/data/countries.ts', content);
console.log('Fixed stats formatting');
