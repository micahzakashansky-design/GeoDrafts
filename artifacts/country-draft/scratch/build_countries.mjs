import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'scratch/new_data.txt');
const countriesFile = path.join(process.cwd(), 'src/data/countries.ts');

const newDataText = fs.readFileSync(dataFile, 'utf-8');
const oldTs = fs.readFileSync(countriesFile, 'utf-8');

const newNamesLines = newDataText.trim().split('\n');

const cats = [
  'military', 'economy', 'government', 'internationalRelationships',
  'technology', 'education', 'naturalResources', 'healthcare',
  'location', 'tourism', 'climate', 'history', 'culture'
];

const newScores = {};
for (const line of newNamesLines) {
  const match = line.match(/^(\d+)\s+(.*?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/);
  if (match) {
    const [_, rank, name, ...scores] = match;
    newScores[name.trim()] = scores.map(Number);
  }
}

const metadata = {
  "Taiwan": { flag: "🇹🇼", colors: ["Red", "Blue", "White"], cap: "Taipei", reg: "Asia", k: "High-tech manufacturing and complex geopolitical status", s: 3, p: 6 },
  "Malaysia": { flag: "🇲🇾", colors: ["Red", "White", "Blue", "Yellow"], cap: "Kuala Lumpur", reg: "Asia", k: "Diverse culture and modern tech hubs like Kuala Lumpur", s: 5, p: 6 },
  "Thailand": { flag: "🇹🇭", colors: ["Red", "White", "Blue"], cap: "Bangkok", reg: "Asia", k: "Bustling tourism, unique cuisine, and cultural heritage", s: 6, p: 7 },
  "Colombia": { flag: "🇨🇴", colors: ["Yellow", "Blue", "Red"], cap: "Bogotá", reg: "South America", k: "Coffee exports, rich biodiversity, and cultural revival", s: 7, p: 7 },
  "Vietnam": { flag: "🇻🇳", colors: ["Red", "Yellow"], cap: "Hanoi", reg: "Asia", k: "Rapid economic growth and rich historical landscape", s: 5, p: 8 },
  "Uruguay": { flag: "🇺🇾", colors: ["Blue", "White", "Yellow"], cap: "Montevideo", reg: "South America", k: "High quality of life, progressive laws, and agriculture", s: 4, p: 3 },
  "Morocco": { flag: "🇲🇦", colors: ["Red", "Green"], cap: "Rabat", reg: "Africa", k: "Strategic gateway to Europe, diverse landscapes, and history", s: 6, p: 6 },
  "Costa Rica": { flag: "🇨🇷", colors: ["Blue", "White", "Red"], cap: "San José", reg: "North America", k: "Eco-tourism and renewable energy leadership", s: 3, p: 3 },
  "Cyprus": { flag: "🇨🇾", colors: ["White", "Orange", "Green"], cap: "Nicosia", reg: "Europe", k: "Strategic Mediterranean island with divided history", s: 1, p: 2 },
  "Kuwait": { flag: "🇰🇼", colors: ["Green", "White", "Red", "Black"], cap: "Kuwait City", reg: "Middle East", k: "Massive oil reserves and high wealth per capita", s: 2, p: 3 },
  "Oman": { flag: "🇴🇲", colors: ["Red", "White", "Green"], cap: "Muscat", reg: "Middle East", k: "Diplomatic neutrality and strategic shipping lanes", s: 5, p: 3 },
  "Bulgaria": { flag: "🇧🇬", colors: ["White", "Green", "Red"], cap: "Sofia", reg: "Europe", k: "Ancient history and black sea coastal tourism", s: 4, p: 4 },
  "Serbia": { flag: "🇷🇸", colors: ["Red", "Blue", "White"], cap: "Belgrade", reg: "Europe", k: "Balkan crossroads and rich cultural history", s: 4, p: 4 },
  "Iran": { flag: "🇮🇷", colors: ["Green", "White", "Red"], cap: "Tehran", reg: "Middle East", k: "Ancient Persian history and vast energy reserves", s: 8, p: 8 },
  "Panama": { flag: "🇵🇦", colors: ["Red", "White", "Blue"], cap: "Panama City", reg: "North America", k: "The Panama Canal and rapid economic expansion", s: 3, p: 3 },
  "Jordan": { flag: "🇯🇴", colors: ["Black", "White", "Green", "Red"], cap: "Amman", reg: "Middle East", k: "Petra, the Dead Sea, and regional diplomacy", s: 4, p: 5 },
  "Kenya": { flag: "🇰🇪", colors: ["Black", "Red", "Green", "White"], cap: "Nairobi", reg: "Africa", k: "Tech innovation hub and world-class safaris", s: 6, p: 7 },
  "Bahrain": { flag: "🇧🇭", colors: ["Red", "White"], cap: "Manama", reg: "Middle East", k: "Financial center and early oil pioneer in the Gulf", s: 1, p: 2 },
  "Pakistan": { flag: "🇵🇰", colors: ["Green", "White"], cap: "Islamabad", reg: "Asia", k: "Nuclear capabilities and significant geopolitical weight", s: 6, p: 9 },
  "Tunisia": { flag: "🇹🇳", colors: ["Red", "White"], cap: "Tunis", reg: "Africa", k: "Mediterranean tourism and ancient Carthage", s: 4, p: 5 },
  "Ecuador": { flag: "🇪🇨", colors: ["Yellow", "Blue", "Red"], cap: "Quito", reg: "South America", k: "The Galapagos Islands and diverse ecosystems", s: 5, p: 5 },
  "Dominican Republic": { flag: "🇩🇴", colors: ["Blue", "White", "Red"], cap: "Santo Domingo", reg: "North America", k: "Caribbean tourism and robust regional economy", s: 3, p: 5 },
  "Jamaica": { flag: "🇯🇲", colors: ["Green", "Yellow", "Black"], cap: "Kingston", reg: "North America", k: "Global cultural impact through music and sports", s: 2, p: 3 },
  "Sri Lanka": { flag: "🇱🇰", colors: ["Yellow", "Maroon", "Orange", "Green"], cap: "Colombo", reg: "Asia", k: "Tea exports, diverse wildlife, and island tourism", s: 3, p: 6 },
  "Lebanon": { flag: "🇱🇧", colors: ["Red", "White", "Green"], cap: "Beirut", reg: "Middle East", k: "Levantine culture and historical Phoenician roots", s: 1, p: 4 },
  "Algeria": { flag: "🇩🇿", colors: ["Green", "White", "Red"], cap: "Algiers", reg: "Africa", k: "Vast Saharan territory and natural gas resources", s: 8, p: 6 },
  "Malta": { flag: "🇲🇹", colors: ["White", "Red"], cap: "Valletta", reg: "Europe", k: "Strategic Mediterranean outpost and rich history", s: 1, p: 1 },
  "Mauritius": { flag: "🇲🇺", colors: ["Red", "Blue", "Yellow", "Green"], cap: "Port Louis", reg: "Africa", k: "Strong economy and Indian Ocean tourism", s: 1, p: 2 },
  "Bangladesh": { flag: "🇧🇩", colors: ["Green", "Red"], cap: "Dhaka", reg: "Asia", k: "Massive population density and textile exports", s: 4, p: 9 },
  "Ghana": { flag: "🇬🇭", colors: ["Red", "Yellow", "Green", "Black"], cap: "Accra", reg: "Africa", k: "Stable democracy and gold/cocoa exports", s: 5, p: 6 },
  "Senegal": { flag: "🇸🇳", colors: ["Green", "Yellow", "Red"], cap: "Dakar", reg: "Africa", k: "Cultural hub in West Africa with stable governance", s: 5, p: 5 },
  "Tanzania": { flag: "🇹🇿", colors: ["Green", "Yellow", "Black", "Blue"], cap: "Dodoma", reg: "Africa", k: "Mount Kilimanjaro, Serengeti, and rich natural resources", s: 7, p: 7 },
  "Bolivia": { flag: "🇧🇴", colors: ["Red", "Yellow", "Green"], cap: "Sucre", reg: "South America", k: "High-altitude geography and massive lithium reserves", s: 7, p: 5 },
  "Cuba": { flag: "🇨🇺", colors: ["Blue", "White", "Red"], cap: "Havana", reg: "North America", k: "Unique political history and distinct cultural exports", s: 4, p: 5 },
  "El Salvador": { flag: "🇸🇻", colors: ["Blue", "White"], cap: "San Salvador", reg: "North America", k: "Bitcoin adoption and recent security transformations", s: 2, p: 4 },
  "Guatemala": { flag: "🇬🇹", colors: ["Blue", "White"], cap: "Guatemala City", reg: "North America", k: "Ancient Mayan history and diverse microclimates", s: 4, p: 6 },
  "Honduras": { flag: "🇭🇳", colors: ["Blue", "White"], cap: "Tegucigalpa", reg: "North America", k: "Central American location and agricultural exports", s: 4, p: 5 },
  "Paraguay": { flag: "🇵🇾", colors: ["Red", "White", "Blue"], cap: "Asunción", reg: "South America", k: "Guarani culture and massive hydroelectric power", s: 6, p: 4 },
  "Uganda": { flag: "🇺🇬", colors: ["Black", "Yellow", "Red"], cap: "Kampala", reg: "Africa", k: "Source of the Nile and diverse equatorial wildlife", s: 5, p: 7 },
  "Ivory Coast": { flag: "🇨🇮", colors: ["Orange", "White", "Green"], cap: "Yamoussoukro", reg: "Africa", k: "World's leading producer of cocoa beans", s: 5, p: 6 },
  "Belarus": { flag: "🇧🇾", colors: ["Red", "Green", "White"], cap: "Minsk", reg: "Europe", k: "Heavy industry and strategic Eastern European location", s: 5, p: 4 },
  "Azerbaijan": { flag: "🇦🇿", colors: ["Blue", "Red", "Green"], cap: "Baku", reg: "Asia", k: "Caspian Sea oil wealth and distinct regional culture", s: 4, p: 5 },
  "Rwanda": { flag: "🇷🇼", colors: ["Blue", "Yellow", "Green"], cap: "Kigali", reg: "Africa", k: "Rapid modernization and strong environmental policies", s: 2, p: 5 },
  "Uzbekistan": { flag: "🇺🇿", colors: ["Blue", "White", "Green", "Red"], cap: "Tashkent", reg: "Asia", k: "Heart of the ancient Silk Road and growing economy", s: 6, p: 6 }
};

function getGenericDesc(score, max) {
  const ratio = score / max;
  if (ratio >= 0.9) return "World-class capabilities and global influence.";
  if (ratio >= 0.7) return "Strong regional presence and advanced development.";
  if (ratio >= 0.5) return "Moderate infrastructure with ongoing modernization efforts.";
  if (ratio >= 0.3) return "Developing sector with some systemic challenges.";
  return "Critical limitations restricting overall effectiveness.";
}

function getTier(total) {
  if (total >= 140) return "first";
  if (total >= 110) return "second";
  if (total >= 85) return "third";
  return "fourth";
}

let existingNames = [];
let countriesList = [];

// Parse existing blocks
const blockRegex = /name:\s*"([^"]+)",[\s\S]*?stats:\s*\{([\s\S]*?)\n    \},/g;

let match;
while ((match = blockRegex.exec(oldTs)) !== null) {
  const name = match[1];
  existingNames.push(name);
}

// Rebuild file by parsing the existing TS AST? No, we can just rebuild it manually if we parse all info
// But we want to preserve the TS structure. Let's just modify the string for existing, and append for new.

let updatedTs = oldTs;

let luxIdx = updatedTs.indexOf('name: "Luxembourg"');
if (luxIdx !== -1) {
  let start = updatedTs.lastIndexOf('  {', luxIdx);
  let endNextCountry = updatedTs.indexOf('  {\n    name:', luxIdx);
  let endArray = updatedTs.indexOf('\n];', luxIdx);
  let end = endNextCountry !== -1 ? endNextCountry : endArray;
  updatedTs = updatedTs.substring(0, start) + updatedTs.substring(end);
}

// Update existing
for (const name of Object.keys(newScores)) {
  if (existingNames.includes(name) && name !== "Luxembourg") {
    // replace scores
    let blockStart = updatedTs.indexOf(`name: "${name}"`);
    let statsStart = updatedTs.indexOf('stats: {', blockStart);
    let statsEnd = updatedTs.indexOf('    },', statsStart);
    let statsBlock = updatedTs.substring(statsStart, statsEnd);
    
    for (let i = 0; i < cats.length; i++) {
      const cat = cats[i];
      const newScore = newScores[name][i];
      const catRegex = new RegExp(`${cat}:\\s*\\{\\s*score:\\s*\\d+`);
      statsBlock = statsBlock.replace(catRegex, `${cat}: { score: ${newScore}`);
    }
    updatedTs = updatedTs.substring(0, statsStart) + statsBlock + updatedTs.substring(statsEnd);
  }
}

// Now append new countries
let insertIdx = 0;
let newCountriesStr = "";

const MAX_SCORES = {
  military: 15, economy: 15, government: 15,
  internationalRelationships: 12, technology: 12, education: 12, naturalResources: 12, healthcare: 12,
  location: 10, tourism: 10, climate: 10, history: 10, culture: 10,
  size: 10, population: 10
};

for (const name of Object.keys(metadata)) {
  if (!newScores[name]) {
    console.error(`Missing scores for ${name}!`);
    continue;
  }
  
  const m = metadata[name];
  const scores = newScores[name];
  
  let total = scores.reduce((a, b) => a + b, 0);
  let tier = getTier(total);
  
  newCountriesStr += `  {
    name: "${name}",
    flag: "${m.flag}",
    flagColors: ${JSON.stringify(m.colors)},
    tier: "${tier}",
    capital: "${m.cap}",
    region: "${m.reg}",
    knownFor: "${m.k}",
    stats: {
`;

  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    const score = scores[i];
    const desc = getGenericDesc(score, MAX_SCORES[cat]);
    newCountriesStr += `      ${cat}: { score: ${score}, description: "${desc}" },\n`;
  }
  
  newCountriesStr += `      size: { score: ${m.s}, description: "Geographic size score based on landmass area." },\n`;
  newCountriesStr += `      population: { score: ${m.p}, description: "Population score based on total demographic size." },\n`;
  
  newCountriesStr += `    },\n  },\n`;
}

updatedTs = updatedTs.replace(/\n\];/, ',\n' + newCountriesStr + '];');

fs.writeFileSync(countriesFile, updatedTs, 'utf-8');
console.log("Updated countries.ts");
