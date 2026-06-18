import fs from 'fs';

const oldTs = fs.readFileSync('src/data/countries.ts', 'utf-8');
const newDataText = fs.readFileSync('scratch/new_data.txt', 'utf-8');

// Parse new data
const newScores = {};
let currentName = null;
const lines = newDataText.split('\n').map(l => l.trim()).filter(l => l);

for (const line of lines) {
  const match = line.match(/^(\d+)\s+(.+?)\s+((?:\d+\s*){13})$/);
  if (match) {
    const name = match[2].trim();
    const scores = match[3].trim().split(/\s+/).map(Number);
    newScores[name] = scores;
  }
}

const cats = [
  "military", "economy", "government", "internationalRelationships",
  "technology", "education", "naturalResources", "healthcare",
  "location", "tourism", "climate", "history", "culture"
];

// Helper to get generic description
function getGenericDesc(score) {
  if (score >= 12) return "World-class capabilities and global influence.";
  if (score >= 9) return "Strong regional presence and advanced development.";
  if (score >= 6) return "Moderate infrastructure with ongoing modernization efforts.";
  if (score >= 4) return "Developing sector with some systemic challenges.";
  return "Critical limitations restricting overall effectiveness.";
}

let resultTs = oldTs;

// Remove Luxembourg
let luxIdx = resultTs.indexOf('name: "Luxembourg"');
if (luxIdx !== -1) {
  let start = resultTs.lastIndexOf('  {', luxIdx);
  let endNextCountry = resultTs.indexOf('  {\n    name:', luxIdx);
  let endArray = resultTs.indexOf('\n];', luxIdx);
  let end = endNextCountry !== -1 ? endNextCountry : endArray;
  // Also remove trailing comma if it exists before end Array
  resultTs = resultTs.substring(0, start) + resultTs.substring(end);
}

// 1. Update existing countries
for (const [name, scores] of Object.entries(newScores)) {
  let blockStart = resultTs.indexOf(`name: "${name}"`);
  if (blockStart === -1) continue; // New country, handled later

  let statsStart = resultTs.indexOf('stats: {', blockStart);
  let nextCountryStart = resultTs.indexOf('  {\n    name:', statsStart);
  let endOfArray = resultTs.indexOf('\n];', statsStart);
  let limit = nextCountryStart !== -1 ? nextCountryStart : endOfArray;

  let statsBlock = resultTs.substring(statsStart, limit);
  
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    const newScore = scores[i];
    const catRegex = new RegExp(`(${cat}:\\s*\\{\\s*score:\\s*)\\d+`);
    statsBlock = statsBlock.replace(catRegex, `$1${newScore}`);
  }
  
  resultTs = resultTs.substring(0, statsStart) + statsBlock + resultTs.substring(limit);
}

// 2. Append new countries
const metadata = {
  "Uzbekistan": { flag: "🇺🇿", colors: ["Blue","White","Green","Red"], cap: "Tashkent", reg: "Asia", k: "Heart of the ancient Silk Road and growing economy", s: 4, p: 4 },
  "Rwanda": { flag: "🇷🇼", colors: ["Blue","Yellow","Green"], cap: "Kigali", reg: "Africa", k: "Fastest-growing tech hub in Africa, 'Land of a Thousand Hills'", s: 2, p: 3 },
  "Madagascar": { flag: "🇲🇬", colors: ["White","Red","Green"], cap: "Antananarivo", reg: "Africa", k: "Unique biodiversity found nowhere else on Earth", s: 5, p: 4 },
  "Dominican Republic": { flag: "🇩🇴", colors: ["Blue","White","Red"], cap: "Santo Domingo", reg: "North America", k: "Most visited destination in the Caribbean", s: 3, p: 3 },
  "Mongolia": { flag: "🇲🇳", colors: ["Red","Blue","Yellow"], cap: "Ulaanbaatar", reg: "Asia", k: "Vast steppes and the legacy of Genghis Khan", s: 6, p: 2 },
  "Syria": { flag: "🇸🇾", colors: ["Red","White","Black","Green"], cap: "Damascus", reg: "Asia", k: "One of the oldest continuously inhabited cities in the world", s: 4, p: 4 },
  "Burkina Faso": { flag: "🇧🇫", colors: ["Red","Green","Yellow"], cap: "Ouagadougou", reg: "Africa", k: "Major gold producer and West African cultural center", s: 4, p: 4 },
  "Senegal": { flag: "🇸🇳", colors: ["Green","Yellow","Red"], cap: "Dakar", reg: "Africa", k: "Stable democracy and westernmost point of Africa", s: 4, p: 4 },
  "Honduras": { flag: "🇭🇳", colors: ["Blue","White"], cap: "Tegucigalpa", reg: "North America", k: "Ancient Mayan ruins at Copán", s: 3, p: 3 },
  "Somalia": { flag: "🇸🇴", colors: ["Blue","White"], cap: "Mogadishu", reg: "Africa", k: "Longest coastline on mainland Africa", s: 5, p: 4 },
  "Mali": { flag: "🇲🇱", colors: ["Green","Yellow","Red"], cap: "Bamako", reg: "Africa", k: "Historic empires and the legendary city of Timbuktu", s: 6, p: 4 },
  "Papua New Guinea": { flag: "🇵🇬", colors: ["Red","Black","Yellow","White"], cap: "Port Moresby", reg: "Oceania", k: "Most linguistically diverse country in the world", s: 5, p: 3 },
  "Cambodia": { flag: "🇰🇭", colors: ["Blue","Red","White"], cap: "Phnom Penh", reg: "Asia", k: "The monumental temple complex of Angkor Wat", s: 4, p: 4 },
  "Zambia": { flag: "🇿🇲", colors: ["Green","Red","Black","Orange"], cap: "Lusaka", reg: "Africa", k: "Victoria Falls and vast copper reserves", s: 5, p: 4 },
  "Guatemala": { flag: "🇬🇹", colors: ["Blue","White"], cap: "Guatemala City", reg: "North America", k: "Heart of the Mayan world and spectacular volcanoes", s: 3, p: 4 },
  "Tajikistan": { flag: "🇹🇯", colors: ["Red","White","Green"], cap: "Dushanbe", reg: "Asia", k: "Towering Pamir Mountains", s: 3, p: 3 },
  "Cameroon": { flag: "🇨🇲", colors: ["Green","Red","Yellow"], cap: "Yaoundé", reg: "Africa", k: "Africa in miniature due to its diverse geography", s: 5, p: 4 },
  "Ecuador": { flag: "🇪🇨", colors: ["Yellow","Blue","Red"], cap: "Quito", reg: "South America", k: "The Galápagos Islands and the equator", s: 4, p: 4 },
  "Ghana": { flag: "🇬🇭", colors: ["Red","Yellow","Green","Black"], cap: "Accra", reg: "Africa", k: "Rich Gold Coast history and stable democracy", s: 4, p: 4 },
  "Yemen": { flag: "🇾🇪", colors: ["Red","White","Black"], cap: "Sana'a", reg: "Asia", k: "Ancient mud-brick skyscrapers and strategic location", s: 5, p: 4 },
  "Zimbabwe": { flag: "🇿🇼", colors: ["Green","Yellow","Red","Black","White"], cap: "Harare", reg: "Africa", k: "Victoria Falls and ancient Great Zimbabwe ruins", s: 4, p: 4 },
  "Bolivia": { flag: "🇧🇴", colors: ["Red","Yellow","Green"], cap: "Sucre", reg: "South America", k: "Salar de Uyuni, the world's largest salt flat", s: 6, p: 3 },
  "Cote d'Ivoire": { flag: "🇨🇮", colors: ["Orange","White","Green"], cap: "Yamoussoukro", reg: "Africa", k: "World's leading producer of cocoa beans", s: 4, p: 4 },
  "Belarus": { flag: "🇧🇾", colors: ["Red","Green","White"], cap: "Minsk", reg: "Europe", k: "Heavy industry and strategic Eastern European location", s: 5, p: 3 },
  "Azerbaijan": { flag: "🇦🇿", colors: ["Blue","Red","Green"], cap: "Baku", reg: "Asia", k: "Caspian Sea oil wealth and distinct regional culture", s: 4, p: 3 },
  "Malawi": { flag: "🇲🇼", colors: ["Black","Red","Green"], cap: "Lilongwe", reg: "Africa", k: "Lake Malawi and the 'Warm Heart of Africa'", s: 3, p: 4 },
  "Uruguay": { flag: "🇺🇾", colors: ["Blue","White","Yellow"], cap: "Montevideo", reg: "South America", k: "Progressive social policies and high quality of life", s: 4, p: 2 },
  "Croatia": { flag: "🇭🇷", colors: ["Red","White","Blue"], cap: "Zagreb", reg: "Europe", k: "Stunning Adriatic coastline and islands", s: 3, p: 2 },
  "Oman": { flag: "🇴🇲", colors: ["Red","White","Green"], cap: "Muscat", reg: "Asia", k: "Traditional Arabian culture and peaceful diplomacy", s: 4, p: 2 },
  "Guinea": { flag: "🇬🇳", colors: ["Red","Yellow","Green"], cap: "Conakry", reg: "Africa", k: "Massive bauxite reserves", s: 5, p: 3 },
  "Kuwait": { flag: "🇰🇼", colors: ["Green","White","Red","Black"], cap: "Kuwait City", reg: "Asia", k: "Vast oil wealth and modern skyline", s: 2, p: 2 },
  "Chad": { flag: "🇹🇩", colors: ["Blue","Yellow","Red"], cap: "N'Djamena", reg: "Africa", k: "Lake Chad and the vast Sahara desert", s: 6, p: 4 },
  "Panama": { flag: "🇵🇦", colors: ["Blue","White","Red"], cap: "Panama City", reg: "North America", k: "The Panama Canal connecting two oceans", s: 3, p: 2 },
  "Moldova": { flag: "🇲🇩", colors: ["Blue","Yellow","Red"], cap: "Chișinău", reg: "Europe", k: "Extensive underground wine cellars", s: 2, p: 2 },
  "Georgia": { flag: "🇬🇪", colors: ["White","Red"], cap: "Tbilisi", reg: "Asia", k: "Birthplace of wine and Caucasus mountain scenery", s: 2, p: 2 },
  "Bosnia and Herzegovina": { flag: "🇧🇦", colors: ["Blue","Yellow","White"], cap: "Sarajevo", reg: "Europe", k: "Where East meets West in the Balkans", s: 3, p: 2 },
  "Costa Rica": { flag: "🇨🇷", colors: ["Blue","White","Red"], cap: "San José", reg: "North America", k: "Pioneering eco-tourism and abolished its army", s: 2, p: 2 },
  "Tanzania": { flag: "🇹🇿", colors: ["Green","Yellow","Blue","Black"], cap: "Dodoma", reg: "Africa", k: "Mount Kilimanjaro and the Serengeti", s: 5, p: 5 },
  "South Africa": { flag: "🇿🇦", colors: ["Red","Blue","Green","Yellow","Black","White"], cap: "Pretoria", reg: "Africa", k: "Nelson Mandela and diverse wildlife", s: 6, p: 5 },
  "Serbia": { flag: "🇷🇸", colors: ["Red","Blue","White"], cap: "Belgrade", reg: "Europe", k: "Crossroads of the Balkans and rich history", s: 3, p: 3 },
  "Lithuania": { flag: "🇱🇹", colors: ["Yellow","Green","Red"], cap: "Vilnius", reg: "Europe", k: "Fast internet and strong tech sector", s: 2, p: 2 },
  "El Salvador": { flag: "🇸🇻", colors: ["Blue","White"], cap: "San Salvador", reg: "North America", k: "Volcanoes and adoption of Bitcoin", s: 2, p: 3 },
  "Lebanon": { flag: "🇱🇧", colors: ["Red","White","Green"], cap: "Beirut", reg: "Asia", k: "Cedar trees and vibrant Mediterranean culture", s: 2, p: 2 },
  "New Zealand": { flag: "🇳🇿", colors: ["Blue","Red","White"], cap: "Wellington", reg: "Oceania", k: "Breathtaking landscapes and Maori culture", s: 4, p: 2 }
};

let newCountriesStr = "";
for (const [name, scores] of Object.entries(newScores)) {
  if (resultTs.includes(`name: "${name}"`)) continue;
  
  const m = metadata[name] || { flag: "🏳️", colors: ["White"], cap: "Unknown", reg: "Unknown", k: "Unknown", s: 1, p: 1 };
  
  newCountriesStr += `  {\n`;
  newCountriesStr += `    name: "${name}",\n`;
  newCountriesStr += `    flag: "${m.flag}",\n`;
  newCountriesStr += `    flagColors: ${JSON.stringify(m.colors)},\n`;
  newCountriesStr += `    tier: "fourth",\n`;
  newCountriesStr += `    capital: "${m.cap}",\n`;
  newCountriesStr += `    region: "${m.reg}",\n`;
  newCountriesStr += `    knownFor: "${m.k.replace(/"/g, '\\"')}",\n`;
  newCountriesStr += `    stats: {\n`;
  
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    const score = scores[i];
    newCountriesStr += `      ${cat}: { score: ${score}, description: "${getGenericDesc(score)}" },\n`;
  }
  newCountriesStr += `      size: { score: ${m.s}, description: "Geographic size score based on landmass area." },\n`;
  newCountriesStr += `      population: { score: ${m.p}, description: "Population score based on total demographic size." },\n`;
  newCountriesStr += `    },\n  },\n`;
}

// Clean up any double commas or syntax errors at the end of the array
resultTs = resultTs.replace(/,\n\s*\];/g, '\n];'); // remove extra comma at end
resultTs = resultTs.replace(/\n\];/, ',\n' + newCountriesStr + '];');

fs.writeFileSync('src/data/countries.ts', resultTs, 'utf-8');
console.log("Updated countries.ts");
