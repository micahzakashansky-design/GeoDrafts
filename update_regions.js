const fs = require('fs');
let content = fs.readFileSync('artifacts/country-draft/src/data/countries.ts', 'utf8');

const countryOverrides = {
  'Taiwan': 'Asia-Pacific',
  'Malaysia': 'Asia-Pacific',
  'Thailand': 'Asia-Pacific',
  'Vietnam': 'Asia-Pacific',
  'Pakistan': 'Asia-Pacific',
  'Sri Lanka': 'Asia-Pacific',
  'Bangladesh': 'Asia-Pacific',
  'Kuwait': 'Middle East & Central Asia',
  'Oman': 'Middle East & Central Asia',
  'Iran': 'Middle East & Central Asia',
  'Jordan': 'Middle East & Central Asia',
  'Bahrain': 'Middle East & Central Asia',
  'Lebanon': 'Middle East & Central Asia',
  'Azerbaijan': 'Middle East & Central Asia',
  'Uzbekistan': 'Middle East & Central Asia'
};

const regionMap = {
  "North America": "Americas",
  "South America": "Americas",
  "Africa": "Africa",
  "Western Europe": "Western & Northern Europe",
  "Northern Europe": "Western & Northern Europe",
  "Eastern Europe": "Eastern & Southern Europe",
  "Southern Europe": "Eastern & Southern Europe",
  "Central Europe": "Eastern & Southern Europe",
  "Southeast Europe": "Eastern & Southern Europe",
  "Europe": "Eastern & Southern Europe", 
  "Middle East / Southern Europe": "Eastern & Southern Europe", 
  "Eastern Europe / North Asia": "Eastern & Southern Europe", 
  "Middle East": "Middle East & Central Asia",
  "Caucasus": "Middle East & Central Asia",
  "Central Asia": "Middle East & Central Asia",
  "East Asia": "Asia-Pacific",
  "Southeast Asia": "Asia-Pacific",
  "South Asia": "Asia-Pacific",
  "Oceania": "Asia-Pacific",
  "Asia": "Asia-Pacific"
};

const blocks = content.split(/(name:\s*"[^"]+",)/);

let newContent = blocks[0];
for (let i = 1; i < blocks.length; i += 2) {
  const nameLine = blocks[i];
  const nameMatch = nameLine.match(/name:\s*"([^"]+)"/);
  const name = nameMatch ? nameMatch[1] : null;
  
  let rest = blocks[i+1];
  
  rest = rest.replace(/region:\s*"([^"]+)"/, (match, oldRegion) => {
    let newRegion = regionMap[oldRegion] || oldRegion;
    if (countryOverrides[name]) {
      newRegion = countryOverrides[name];
    }
    return `region: "${newRegion}"`;
  });
  
  newContent += nameLine + rest;
}

fs.writeFileSync('artifacts/country-draft/src/data/countries.ts', newContent);
console.log("Regions updated successfully.");
