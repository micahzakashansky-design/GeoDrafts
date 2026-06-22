import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const countriesPath = path.join(__dirname, 'src/data/countries.ts');
let content = fs.readFileSync(countriesPath, 'utf8');

// Use a regex to extract the COUNTRIES array
const match = content.match(/export const COUNTRIES: Country\[\] = (\[[\s\S]*?\]);/);
if (!match) {
  console.error("Could not find COUNTRIES array in countries.ts");
  process.exit(1);
}

let countries;
try {
  // Unsafe eval to parse the object string
  countries = eval(match[1]);
} catch (e) {
  console.error("Failed to eval countries", e);
  process.exit(1);
}

async function augment() {
  const res = await fetch('https://raw.githubusercontent.com/mledoze/countries/master/countries.json');
  const data = await res.json();
  
  for (const c of countries) {
    const match = data.find((d) => {
      if (d.cca3 === c.id || d.cca2 === c.id) return true;
      if (d.name.common === c.name || d.name.official === c.name) return true;
      return false;
    });

    if (match) {
      // restcountries returns [lat, lng], but react-simple-maps expects [lng, lat]
      c.coordinates = [match.latlng[1], match.latlng[0]];
      c.area = match.area;
    } else {
      console.warn("No match for", c.name);
    }
  }

  // Write back
  const newInterface = `export interface Country {
  id: string;
  name: string;
  capital: string;
  region: string;
  population: number;
  flag: string;
  hints: string[];
  isoNumeric?: string;
  aliases?: string[];
  capitalAliases?: string[];
  coordinates?: [number, number];
  area?: number;
}`;

  content = content.replace(/export interface Country \{[\s\S]*?\}/, newInterface);
  
  const newArrayStr = JSON.stringify(countries, null, 2).replace(/"([^"]+)":/g, '$1:');
  content = content.replace(/export const COUNTRIES: Country\[\] = \[[\s\S]*?\];/, "export const COUNTRIES: Country[] = " + newArrayStr + ";");

  fs.writeFileSync(countriesPath, content);
  console.log("Augmented countries with coordinates and area.");
}

augment();
