import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'scratch/new_data.txt');
const countriesFile = path.join(process.cwd(), 'src/data/countries.ts');

const data = fs.readFileSync(dataFile, 'utf-8');
let countriesCode = fs.readFileSync(countriesFile, 'utf-8');

const lines = data.trim().split('\n');

const cats = [
  'military',
  'economy',
  'government',
  'internationalRelationships',
  'technology',
  'education',
  'naturalResources',
  'healthcare',
  'location',
  'tourism',
  'climate',
  'history',
  'culture'
];

let unmatched = [];

for (const line of lines) {
  const match = line.match(/^(\d+)\s+(.*?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/);
  if (!match) {
    console.error(`Failed to parse line: ${line}`);
    continue;
  }
  
  const [_, rank, nameRaw, ...scores] = match;
  let name = nameRaw.trim();
  
  // Find country block
  // A country block looks like: name: "United States", ... stats: { ... }
  // We can use a regex to find the block for the country
  const nameRegex = new RegExp(`name:\\s*"${name}"[\\s\\S]*?stats:\\s*\\{([\\s\\S]*?)\\}(?=\\s*,\\s*\\n\\s*\\{|$|\\s*\\})`);
  
  const blockMatch = countriesCode.match(nameRegex);
  if (!blockMatch) {
    unmatched.push(name);
    continue;
  }
  
  let statsBlock = blockMatch[1];
  
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    const score = scores[i];
    
    // Find the score for this category and replace it
    const catRegex = new RegExp(`${cat}:\\s*\\{\\s*score:\\s*\\d+`);
    if (statsBlock.match(catRegex)) {
      statsBlock = statsBlock.replace(catRegex, `${cat}: { score: ${score}`);
    } else {
      console.warn(`Could not find category ${cat} for ${name}`);
    }
  }
  
  // Replace the stats block back into the code
  countriesCode = countriesCode.replace(blockMatch[1], statsBlock);
}

fs.writeFileSync(countriesFile, countriesCode, 'utf-8');
console.log(`Unmatched: ${unmatched.join(', ')}`);
