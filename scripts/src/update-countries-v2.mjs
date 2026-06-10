#!/usr/bin/env node
/**
 * Adds education, location, naturalResources stats to all existing 50 countries,
 * updates the type/CATEGORIES/getCategoryKey, and appends 13 new countries.
 */
import { readFileSync, writeFileSync } from "fs";

const filePath = "artifacts/country-draft/src/data/countries.ts";
let content = readFileSync(filePath, "utf8");

// ─── 1. Update Country stats type ────────────────────────────────────────────
content = content.replace(
  `    history: CategoryStats;
    citiesLandmarks: CategoryStats;
  };`,
  `    history: CategoryStats;
    citiesLandmarks: CategoryStats;
    education: CategoryStats;
    location: CategoryStats;
    naturalResources: CategoryStats;
  };`
);

// ─── 2. Update CATEGORIES (12 → 15) ──────────────────────────────────────────
content = content.replace(
  `export const CATEGORIES = [
  "Military",
  "Economy",
  "Culture",
  "Healthcare",
  "International Relationships",
  "Government",
  "Climate",
  "Technology",
  "Size",
  "Population",
  "History",
  "Cities/Landmarks",
] as const;`,
  `export const CATEGORIES = [
  "Military",
  "Economy",
  "Government",
  "International Relationships",
  "Technology",
  "Education",
  "Location",
  "Natural Resources",
  "Healthcare",
  "Culture",
  "Climate",
  "History",
  "Cities/Landmarks",
  "Size",
  "Population",
] as const;`
);

// ─── 3. Update getCategoryKey map ─────────────────────────────────────────────
content = content.replace(
  `    Size: "size",
    "Population": "population",
    History: "history",
    "Cities/Landmarks": "citiesLandmarks",`,
  `    Size: "size",
    "Population": "population",
    History: "history",
    "Cities/Landmarks": "citiesLandmarks",
    Education: "education",
    Location: "location",
    "Natural Resources": "naturalResources",`
);

// ─── 4. New stats data for all 50 existing countries ─────────────────────────
const newStats = {
  "United States": {
    education: [8, "MIT, Harvard, Stanford elite; strong STEM pipeline; but high tuition and uneven access across income levels"],
    location: [9, "Pacific + Atlantic coasts; borders stable Canada and Mexico; global power projection; Caribbean and Pacific strategic depth"],
    naturalResources: [8, "3rd largest oil producer; vast natural gas, coal, copper, gold; Mississippi basin agriculture; abundant arable land"],
  },
  "Germany": {
    education: [9, "Tuition-free universities; Technische Universitäten world-class; dual vocational apprenticeship system; engineering excellence"],
    location: [9, "Central Western Europe; surrounded by NATO allies; Rhine-Ruhr trade hub; Berlin's east-west connectivity"],
    naturalResources: [4, "Hard coal (declining), potash, some natural gas; largely import-dependent; compensated by industrial processing"],
  },
  "Japan": {
    education: [9, "University of Tokyo elite; rigorous K-12 system; world-leading science literacy; top PISA performer in math"],
    location: [7, "Island nation; US security umbrella; Pacific trade routes; but East Asian geopolitical tension with China/North Korea"],
    naturalResources: [2, "Almost entirely resource-poor; imports 90%+ of energy; limited minerals; drives technology and manufacturing focus"],
  },
  "United Kingdom": {
    education: [8, "Oxford and Cambridge globally ranked; strong STEM tradition; Russell Group universities; but rising tuition post-Brexit"],
    location: [9, "Northwest European platform; NATO core; English-speaking world hub; Channel provides defense depth"],
    naturalResources: [5, "North Sea oil and gas (declining); historic coal industry; some minerals; fishing rights; limited arable expansion"],
  },
  "France": {
    education: [8, "Grandes Ecoles (Polytechnique, ENS) elite; baccalaureat rigor; Sciences Po; strong research institutions; INSEAD"],
    location: [9, "Western Europe heartland; NATO and EU founding member; borders six friendly nations; Atlantic and Mediterranean access"],
    naturalResources: [4, "Some iron ore, bauxite, uranium (imported fuel); forests; agricultural land (wheat, wine); limited oil"],
  },
  "Sweden": {
    education: [9, "Tuition-free through university; progressive pedagogy; high literacy; Karolinska Institute for medicine; KTH engineering"],
    location: [8, "Nordic NATO member; Baltic Sea access; stable Scandinavian neighbors; Arctic strategic value emerging"],
    naturalResources: [7, "Iron ore (LKAB major producer); timber and paper; zinc, lead, copper; strong hydropower; Boliden mining"],
  },
  "Norway": {
    education: [9, "Free tuition; well-resourced K-12; strong universities; highest teacher status globally; Arctic research leader"],
    location: [9, "Nordic NATO; North Atlantic and Arctic access; only Russia land border among Nordics but well-defended; oil hub"],
    naturalResources: [8, "North Sea oil and gas (top 10 globally); sovereign wealth fund; fish; hydropower; timber; phosphates"],
  },
  "Switzerland": {
    education: [9, "ETH Zurich world top 10; multilingual education system; strong vocational training; CERN host; research excellence"],
    location: [8, "Central Europe hub; surrounded by NATO and EU members; Rhine access; neutral diplomatic hub; financial center"],
    naturalResources: [3, "Hydropower (Alpine rivers); salt; some minerals; fresh water abundance; compensates with precision industry"],
  },
  "Canada": {
    education: [9, "U of T, McGill, UBC globally ranked; multicultural campuses; generous student immigration policy; bilingual advantage"],
    location: [9, "US neighbor and close ally; three-ocean territory; no hostile land borders; NORAD and Five Eyes partnership"],
    naturalResources: [9, "Oil sands (3rd largest reserves); natural gas; potash world #2; uranium; gold; lumber; fisheries; vast fresh water"],
  },
  "Australia": {
    education: [8, "Group of Eight research universities; strong STEM programs; international student hub; high quality throughout"],
    location: [7, "Indo-Pacific stability anchor; Five Eyes member; US alliance; AUKUS pact; trade hub for Asian markets; isolated but secure"],
    naturalResources: [9, "Iron ore world #1 exporter; coal; gold; uranium; copper; bauxite; LNG; wool; wheat; immense mineral wealth"],
  },
  "South Korea": {
    education: [10, "World's highest college graduation rate; KAIST and POSTECH elite; intense but effective culture; PISA top scorer"],
    location: [6, "US troops stationed; USFK deterrence; but North Korea proximity; China economic dependency; peninsula vulnerability"],
    naturalResources: [2, "Virtually no fossil fuels; limited metals; fully import-dependent for energy; compensates with manufacturing"],
  },
  "Singapore": {
    education: [9, "NUS and NTU globally top 15; bilingual education; PISA world leader; meritocratic scholarships; SkillsFuture program"],
    location: [8, "Strait of Malacca chokepoint control; Five Power Defence Arrangements; US-friendly; global trading node of Asia"],
    naturalResources: [1, "Virtually no natural resources; even sand imported; all value derived from human capital and strategic location"],
  },
  "Denmark": {
    education: [9, "Tuition-free; Aarhus University and DTU strong; high research spending; no-stress pedagogy; world-class literacy"],
    location: [9, "NATO founding member; Greenland strategic Arctic value; North Sea; stable Scandinavian neighborhood; Baltic access"],
    naturalResources: [6, "North Sea oil and gas (modest); wind energy global leader; fish; amber; productive farmland; pharmaceutical"],
  },
  "Finland": {
    education: [10, "World's #1 education system; no standardized tests until 18; teaching as top profession; PISA consistent champion"],
    location: [7, "New NATO member; long 1,340km Russia border; well-defended; arctic expertise; elevated threat but capable response"],
    naturalResources: [7, "Timber and paper (world-class forestry); copper, nickel, zinc; granite; peat; clean water; biomass energy"],
  },
  "Netherlands": {
    education: [8, "TU Delft globally ranked; Leiden and Utrecht strong; English-medium programs common; Dutch research culture"],
    location: [9, "NATO and EU core; Rotterdam largest European port; Rhine delta trade hub; North Sea coastal access; Brussels proximity"],
    naturalResources: [5, "Groningen natural gas (declining); offshore oil; top-2 global food exporter by value; Rotterdam port processing"],
  },
  "New Zealand": {
    education: [8, "Strong public schooling; University of Auckland research; international student friendly; creative curriculum"],
    location: [7, "Five Eyes member; Pacific security anchor; Australia neighbor; isolated but low strategic threat; remote from conflicts"],
    naturalResources: [7, "World-class dairy farming; geothermal energy; gold and silver; fishing (vast EEZ); timber; wool; hydropower"],
  },
  "Austria": {
    education: [8, "Vienna University of Technology strong; TU Wien; excellent vocational training; cultural education tradition; free tuition"],
    location: [7, "Central European NATO neighborhood; Vienna as global diplomatic hub; EU core; no direct Russia border; Alpine buffer"],
    naturalResources: [4, "Some oil and gas; magnesite; iron ore (historical); timber; Alpine hydropower; salt (etymology of salary)"],
  },
  "Belgium": {
    education: [8, "KU Leuven consistently top-50 globally; multilingual advantage; strong research funding; Ghent University excellence"],
    location: [9, "NATO HQ in Brussels; EU institutions capital; Western Europe core; Channel and North Sea access; surrounded by allies"],
    naturalResources: [2, "Limited domestic resources; historic coal (Wallonia now depleted); primarily import-processing via Antwerp port"],
  },
  "Ireland": {
    education: [8, "Trinity College Dublin historic; tech-focused curricula; EU research partnerships; IDA talent pipeline for FDI"],
    location: [8, "EU member; English-speaking Atlantic hub; low threat environment; neutral but Western-aligned; Celtic Tiger positioning"],
    naturalResources: [4, "Natural gas (Corrib field); zinc and lead mining; peat (declining); fisheries; wind energy enormous potential"],
  },
  "Italy": {
    education: [6, "University of Bologna oldest in world; research quality variable; bureaucracy slows reform; significant brain drain"],
    location: [7, "Mediterranean NATO flank; Southern Europe anchor; migration pressure but stable allies; Adriatic and Tyrrhenian access"],
    naturalResources: [4, "Some natural gas; Carrara marble world-famous; sulfur; limited oil; fishing; declining domestic energy production"],
  },
  "Spain": {
    education: [6, "Several quality universities; gap between elite and regional; vocational improving; brain drain to UK and Germany"],
    location: [7, "NATO Western flank; Atlantic and Mediterranean; Gibraltar straits proximity; Canary Islands; stable Western Europe"],
    naturalResources: [5, "Iron ore, copper, lead, zinc; uranium; some oil and gas; wind and solar potential; fishing; olive oil agriculture"],
  },
  "Portugal": {
    education: [6, "IST Lisboa strong for tech; steadily improving; European integration lifting standards; high emigration of graduates"],
    location: [8, "NATO founding member; Atlantic coast; Azores strategic mid-Atlantic position; stable Western Europe; EU core member"],
    naturalResources: [5, "Copper and tungsten (world top 5); uranium; lithium (world top 5 reserves); cork world #1; wind and solar"],
  },
  "Czech Republic": {
    education: [7, "Charles University historic prestige; CEITEC research excellence; strong STEM tradition; post-communist reform progress"],
    location: [8, "Central European NATO and EU; surrounded by allies; Prague connects East-West commerce; no hostile borders"],
    naturalResources: [5, "Hard coal and lignite; silver; uranium; kaolin; some gold; strong industrial base but energy-import dependent"],
  },
  "Poland": {
    education: [7, "Jagiellonian University historic; Warsaw Tech strong; EU structural funds improving quality; growing STEM culture"],
    location: [7, "Eastern NATO flank; US troop presence increasing; near Russia-Belarus border; buffer position with growing strategic value"],
    naturalResources: [6, "Significant coal reserves; copper and silver (KGHM major producer); sulfur; natural gas; shale potential; amber"],
  },
  "Russia": {
    education: [7, "Lomonosov Moscow State elite; strong STEM heritage from Soviet era; but brain drain and international isolation"],
    location: [4, "Vast but surrounded by hostile or neutral states; only Belarus and North Korea friendly; Arctic isolation; sanctioned"],
    naturalResources: [10, "World's largest natural gas reserves; 2nd oil producer; vast coal, gold, diamonds (world #1 producer), nickel, timber"],
  },
  "China": {
    education: [8, "Tsinghua and Peking University world-class; STEM mass production; 8M+ engineering graduates yearly; but censorship limits"],
    location: [5, "Major power but 14 land borders; South China Sea disputes; Taiwan tensions; limited genuine allies; semi-isolated"],
    naturalResources: [7, "Rare earth elements world #1 (60%+ reserves); coal; iron ore; copper; gold; massive and diverse domestic base"],
  },
  "Turkey": {
    education: [6, "Bogazici and METU competitive; improving enrollment; but academic freedom concerns under Erdogan; brain drain risk"],
    location: [6, "NATO crossroads; controls Bosphorus strait; but complex Russia-Ukraine balancing; Kurdish tension; regional swing state"],
    naturalResources: [5, "Chromite world top 5; boron world #1; marble; some coal and oil/gas; hazelnuts and cotton agriculture; modest"],
  },
  "Ukraine": {
    education: [6, "Strong STEM tradition; KPI Kyiv polytechnic; brain drain accelerated by war; reform ongoing amid conflict"],
    location: [3, "Active war with Russia; NATO aspirant but not member; Black Sea access contested; front-line conflict zone currently"],
    naturalResources: [8, "Iron ore (Krivoy Rog deposits); manganese; coal; titanium; agricultural black soil (chernozem) world-class breadbasket"],
  },
  "Romania": {
    education: [5, "Several universities but quality inconsistent; significant brain drain to Western Europe; EU funding improving slowly"],
    location: [6, "NATO and EU Black Sea flank; borders Ukraine and Moldova; growing strategic value as eastern anchor; improving"],
    naturalResources: [6, "Oil and gas (significant, declining); coal; gold and silver (Rosia Montana); salt; agricultural land; timber"],
  },
  "Hungary": {
    education: [6, "CEU (relocated); BME strong engineering; EU-funded improvements; but Orban media control affects academic freedom"],
    location: [5, "Landlocked NATO member; Orban-Russia alignment reduces alliance value; surrounded by EU but diplomatically isolated"],
    naturalResources: [4, "Bauxite; some coal and gas; manganese; agricultural land; thermal springs; limited by small size"],
  },
  "Israel": {
    education: [9, "Weizmann Institute world-class; Technion top 10 globally for tech; Unit 8200 military-tech pipeline; R&D/GDP world #1"],
    location: [5, "Western-aligned Middle East anchor; US iron-clad support; Iron Dome protection; but surrounded by hostile states"],
    naturalResources: [5, "Natural gas (Leviathan field); potash; phosphates; copper; Dead Sea minerals; compensates with startup innovation"],
  },
  "Greece": {
    education: [6, "Athens Polytechnic historic; economic crisis impacted funding significantly; brain drain to EU; improving slowly"],
    location: [6, "NATO Mediterranean flank; Aegean and Ionian access; but Turkey territorial tensions; migration pressure from south"],
    naturalResources: [5, "Bauxite; nickel; iron ore; Pentelic marble world-class; some oil and gas; fishing; olive oil and wine agriculture"],
  },
  "Estonia": {
    education: [8, "TalTech and Tartu strong; digital native education from age 7; coding in schools; e-Estonia skills pipeline; EU-funded"],
    location: [6, "NATO Baltic member; direct Russia border elevates threat; Tallinn as digital governance hub; enhanced NATO presence"],
    naturalResources: [4, "Oil shale (world's largest per capita, but polluting); limestone; timber; peat; limited strategic mineral base"],
  },
  "Slovakia": {
    education: [6, "Slovak Technical University; improving with EU structural funding; brain drain to Czech Republic and Austria ongoing"],
    location: [7, "Central European NATO and EU; landlocked but surrounded by allies; Bratislava-Vienna economic corridor; stable"],
    naturalResources: [4, "Some coal and oil; antimony; copper; magnesite; agricultural land; limited overall mineral diversity"],
  },
  "Croatia": {
    education: [6, "Zagreb University decent quality; EU membership improving standards; tourism-driven economy creates skill mismatch"],
    location: [7, "Adriatic NATO and EU member; Dalmatian coast; tourism hub; borders Slovenia, Hungary, Serbia; mostly stable"],
    naturalResources: [5, "Offshore oil and gas (Adriatic); bauxite; some minerals; fishing; agricultural land; salt; limestone"],
  },
  "Serbia": {
    education: [5, "University of Belgrade large but limited funding; EU candidate slowly improving; brain drain to Western Europe"],
    location: [4, "Non-NATO; EU candidate; Kosovo tensions unresolved; Russia-China relations strain Western integration; landlocked"],
    naturalResources: [5, "Copper; gold; zinc; lead; coal; oil and gas; lithium (Jadar deposit, massive Tier-1 find); agricultural land"],
  },
  "Bulgaria": {
    education: [5, "Sofia Technical University decent; significant brain drain; underfunded despite EU membership; improving slowly"],
    location: [6, "NATO and EU Black Sea member; borders Turkey and Romania; growing strategic value as eastern flank; reducing Russia dependency"],
    naturalResources: [5, "Coal; copper; lead; zinc; gold; manganese; agricultural land; tobacco; roses (rose oil world #1 producer)"],
  },
  "Kazakhstan": {
    education: [5, "Nazarbayev University world-class (one elite school); rest of system improving; Bolashak scholarship program strong"],
    location: [4, "Central Asian landlocked; Russia and China neighbors; SCO not NATO; resource extraction vulnerability; geopolitically constrained"],
    naturalResources: [9, "Oil world top 12; uranium world #2 producer; copper; chromite; coal; zinc; rare earths; vast steppe farmland"],
  },
  "Georgia": {
    education: [6, "Tbilisi State and Free University of Tbilisi strong; EU-oriented reforms; IDP program; improving despite instability"],
    location: [3, "Russian-occupied Abkhazia and South Ossetia; non-NATO; Black Sea access but contested; EU aspirant but vulnerable"],
    naturalResources: [4, "Some oil and gas (Black Sea offshore); manganese; copper; gold; hydropower potential; wine (world's oldest wine culture)"],
  },
  "Armenia": {
    education: [6, "American University of Armenia strong; diaspora connections globally; tech education improving; Yerevan hub emerging"],
    location: [3, "Landlocked; Turkey border closed; Azerbaijan conflict losses; Russia dependency without NATO protection; very exposed"],
    naturalResources: [4, "Copper; molybdenum; gold; zinc; lead; limited oil; agricultural brandy; modest reserves overall"],
  },
  "Iceland": {
    education: [8, "University of Iceland strong for size; Nordic standards throughout; high literacy; notable research per capita"],
    location: [9, "NATO founding member; mid-Atlantic air defense position; Keflavik base; Arctic access; no land border threats at all"],
    naturalResources: [7, "Geothermal energy (virtually all heating and electricity); hydropower; massive fish EEZ; aluminum smelting hub"],
  },
  "Luxembourg": {
    education: [8, "University of Luxembourg trilingual; EU institutions proximity advantage; finance education strong; international faculty"],
    location: [9, "NATO and EU HQ adjacent; surrounded by France, Belgium, Germany; no direct threats; financial and political hub"],
    naturalResources: [2, "Historical iron ore now depleted; ArcelorMittal legacy; limited domestic resources; entirely financial value-added"],
  },
  "Slovenia": {
    education: [7, "University of Ljubljana quality; EU-funded improvements; high literacy; small but well-resourced system; STEM focus"],
    location: [8, "Alpine NATO and EU; borders Austria, Italy, Croatia, Hungary all EU; Adriatic access via Koper; very stable"],
    naturalResources: [3, "Coal (limited); some oil; timber; limestone; limited but efficient agricultural land; Alpine hydropower"],
  },
  "Latvia": {
    education: [7, "Riga Technical University strong; EU integration lifting standards; some brain drain to Western Europe; improving"],
    location: [6, "NATO Baltic member; direct Russia border elevates threat; Riga as Baltic commercial and cultural hub; enhanced NATO presence"],
    naturalResources: [5, "Timber and wood products; amber (world-class Baltic amber); peat; some minerals; agriculture; Daugava hydropower"],
  },
  "Lithuania": {
    education: [7, "Vilnius University historic; Kaunas Tech strong; EU-connected; digital skills focus; improving STEM pipeline"],
    location: [6, "NATO Baltic member; Suwalki Gap vulnerability (between Russia and Kaliningrad); Vilnius improving as tech hub"],
    naturalResources: [3, "Limestone; clay; some oil; amber; peat; agricultural land; limited mineral diversity; wind energy potential"],
  },
  "North Macedonia": {
    education: [5, "Limited resources; Ss Cyril and Methodius University; EU candidate status improving; brain drain ongoing to EU"],
    location: [5, "NATO member since 2020; Western Balkans; landlocked; Kosovo and Serbia instability nearby; improving position"],
    naturalResources: [3, "Chrome ore; zinc; lead; copper (some); iron ore; marble; limited by infrastructure and investment"],
  },
  "Moldova": {
    education: [4, "Limited funding; Chisinau State University; significant brain drain; poorest in Europe; EU candidate improving slowly"],
    location: [3, "Non-NATO; Transnistria Russian-occupied territory; Romania buffer; EU candidate but severely exposed to Russia"],
    naturalResources: [3, "Agricultural land (wine world-class quality); sunflower; grain; no significant minerals; water; very limited"],
  },
  "Azerbaijan": {
    education: [5, "Baku State University; oil revenue funding modernization; but academic integrity issues; quality gaps persist"],
    location: [4, "South Caucasus crossroads; BTC pipeline strategic; but Armenia conflict aftermath; Iran border tension; Russia proximity"],
    naturalResources: [7, "Caspian oil and gas; iron ore; copper; aluminum; BTC pipeline revenues; agricultural pomegranates, cotton, wheat"],
  },
  "Belarus": {
    education: [5, "Belarusian State University strong technically; Soviet STEM heritage; political repression has damaged academia severely"],
    location: [2, "Russian satellite state; NATO-hostile border; Lukashenko isolation; pariah status in Western Europe; frontline risk"],
    naturalResources: [4, "Potash world top 3 exporter; limited oil; timber; agricultural land; peat; sanction-limited extraction"],
  },
  "Albania": {
    education: [4, "University of Tirana basic; significant brain drain to Italy, Greece, UK; EU accession process improving slowly"],
    location: [6, "NATO member; Adriatic coast; EU candidate; Western-aligned in Balkans; improving but regional instability nearby"],
    naturalResources: [5, "Chrome ore (Europe's largest reserves); oil (limited but present); copper; iron-nickel; hydropower; natural gas"],
  },
};

// ─── 5. Insert new stats line-by-line after citiesLandmarks ──────────────────
const lines = content.split("\n");
const outputLines = [];
let currentCountry = "";

for (const line of lines) {
  outputLines.push(line);
  const nameMatch = line.match(/^\s+name: "(.+)"/);
  if (nameMatch) currentCountry = nameMatch[1];
  if (line.includes("citiesLandmarks:") && newStats[currentCountry]) {
    const s = newStats[currentCountry];
    outputLines.push(`      education: { score: ${s.education[0]}, description: "${s.education[1]}" },`);
    outputLines.push(`      location: { score: ${s.location[0]}, description: "${s.location[1]}" },`);
    outputLines.push(`      naturalResources: { score: ${s.naturalResources[0]}, description: "${s.naturalResources[1]}" },`);
    currentCountry = ""; // prevent double-insert
  }
}

content = outputLines.join("\n");

// ─── 6. Append new countries before closing bracket ──────────────────────────
const newCountries = `
  {
    name: "Saudi Arabia",
    flag: "🇸🇦",
    tier: "second",
    capital: "Riyadh",
    region: "Middle East",
    knownFor: "Birthplace of Islam and custodian of Mecca; world oil hegemon transforming via Vision 2030 megaprojects",
    stats: {
      military: { score: 7, description: "US-equipped armed forces; Patriot missiles; large defense budget; regional intervention capacity in Yemen" },
      economy: { score: 7, description: "Saudi Aramco world's most profitable company; Vision 2030 diversification; Neom; $700B+ sovereign wealth fund" },
      culture: { score: 6, description: "Birthplace of Islam; Al-Ula ancient Nabataean city; conservative but globalizing; camel racing; Arabic poetry" },
      healthcare: { score: 6, description: "King Fahad Medical City world-class; expanding hospitals; Vision 2030 healthcare investment; urban quality high" },
      internationalRelationships: { score: 6, description: "US strategic partner; Abraham Accords normalization; OPEC leadership; recent China-brokered Iran reconciliation" },
      government: { score: 3, description: "Absolute monarchy; no elections; strict religious law; Vision 2030 social reforms but political rights absent" },
      climate: { score: 3, description: "90% desert; extreme heat (50°C+); Rub al-Khali Empty Quarter; Asir mountains exception in southwest" },
      technology: { score: 6, description: "Neom smart city project; Saudi Digital Academy; e-government expanding; smart governance app Absher" },
      size: { score: 8, description: "2.15M km²; largest country in Middle East; Arabian Peninsula dominance; vast desert territories" },
      population: { score: 4, description: "35 million people; young population; 40% expats; rapidly urbanizing; Riyadh mega-city growth" },
      history: { score: 7, description: "Ancient Nabataean kingdom; birthplace of Islam (622 CE); Ottoman era; Ibn Saud unification 1932; oil discovery 1938" },
      citiesLandmarks: { score: 7, description: "Mecca and Medina (Islam's holiest sites); Al-Ula Hegra UNESCO; Riyadh skyline; Diriyah heritage; Neom under construction" },
      education: { score: 5, description: "KAUST world-class for STEM research; King Abdulaziz University large; expanding rapidly; gender gaps improving" },
      location: { score: 5, description: "Middle East oil hub; controls Red Sea Bab el-Mandeb adjacent; but volatile neighborhood; Yemen conflict; Iran tension" },
      naturalResources: { score: 10, description: "World's 2nd largest oil reserves; major natural gas; vast desalination capacity; minerals under Rub al-Khali unexplored" },
    },
  },
  {
    name: "United Arab Emirates",
    flag: "🇦🇪",
    tier: "second",
    capital: "Abu Dhabi",
    region: "Middle East",
    knownFor: "Dubai's iconic skyline meets Emirati tradition; global aviation and trade hub that reinvented desert living",
    stats: {
      military: { score: 6, description: "Modern US-equipped armed forces; F-35 purchase approved; UAE fought in Libya and Yemen; professional small force" },
      economy: { score: 8, description: "Dubai global financial and tourism hub; Abu Dhabi wealth fund #3 globally; diversified beyond oil; DP World ports" },
      culture: { score: 7, description: "Multicultural melting pot; Louvre Abu Dhabi; Dubai Design Week; traditional Emirati culture alongside 200 nationalities" },
      healthcare: { score: 7, description: "World-class private hospitals; medical tourism hub; COVID-19 vaccination leader; DHA and HAAD regulation" },
      internationalRelationships: { score: 7, description: "Abraham Accords with Israel; pragmatic diplomacy; Expo 2020 soft power; COP28 host; US base at Al Dhafra" },
      government: { score: 4, description: "Federal monarchy; rulers of 7 emirates; improving worker rights; political parties banned; security state elements" },
      climate: { score: 3, description: "Extreme desert heat (48°C+); near-zero rainfall; heavily air-conditioned infrastructure; indoor ski slopes exist" },
      technology: { score: 8, description: "Smart Dubai initiative; DIFC FinTech Hive; Hope Probe Mars mission; AI strategy 2031; cashless society leader" },
      size: { score: 3, description: "83,600 km²; small but strategically positioned; 7 emirates from desert interior to Arabian Gulf coastline" },
      population: { score: 2, description: "10 million people; 90% expatriates; Emirati citizens a minority in their own country; diverse expat workforce" },
      history: { score: 5, description: "Ancient Trucial States; pearl diving economy; British protectorate; independence 1971; rapid transformation since" },
      citiesLandmarks: { score: 9, description: "Burj Khalifa world's tallest; Palm Jumeirah; Louvre Abu Dhabi; Ferrari World; Burj Al Arab; Sheikh Zayed Mosque" },
      education: { score: 7, description: "NYU Abu Dhabi, Sorbonne Abu Dhabi branch campuses; GEMS network; STEM investment; ambitious 2031 knowledge economy" },
      location: { score: 6, description: "Strait of Hormuz adjacent (controls 20% world oil transit); Dubai as East-West aviation hub; 4-hour flight to 2.5B people" },
      naturalResources: { score: 8, description: "World's 7th largest oil reserves; major natural gas exporter; strategic port infrastructure; Rub al-Khali potential" },
    },
  },
  {
    name: "Qatar",
    flag: "🇶🇦",
    tier: "second",
    capital: "Doha",
    region: "Middle East",
    knownFor: "World Cup 2022 host and LNG export titan; Education City of branch universities and Al Jazeera media power",
    stats: {
      military: { score: 5, description: "Al Udeid Air Base (largest US air base in Middle East); modern French and US equipment; small but well-funded force" },
      economy: { score: 8, description: "World's highest GDP per capita; Qatar Investment Authority $500B+; LNG export revenue; diversified via QIA investments" },
      culture: { score: 6, description: "Museum of Islamic Art; Doha film festival; conservative Islamic tradition; World Cup 2022 global spotlight; desert culture" },
      healthcare: { score: 7, description: "Hamad Medical Corporation world-class; Sidra Medicine top hospital; universal healthcare for residents; COVID response excellent" },
      internationalRelationships: { score: 7, description: "Al Jazeera global influence; mediator in Taliban talks, Hamas negotiations; hosts US base; hedges between US and Iran" },
      government: { score: 4, description: "Hereditary monarchy; National Consultative Assembly advisory; worker rights improving post-World Cup scrutiny" },
      climate: { score: 3, description: "Extreme desert heat (50°C+); almost no rainfall; artificial cooling for outdoor World Cup venues; coastal humidity" },
      technology: { score: 7, description: "Qatar Science and Technology Park; smart city Lusail built from scratch; 5G leader; Aspire Zone innovation hub" },
      size: { score: 2, description: "11,586 km²; tiny peninsula jutting into Persian Gulf; one of world's smallest countries by land area" },
      population: { score: 2, description: "3 million people; only 350,000 Qatari citizens (12%); vast South Asian and other expat workforce" },
      history: { score: 5, description: "Ancient pearl fishing economy; Ottoman province; British protectorate 1916; independence 1971; rapid transformation since gas" },
      citiesLandmarks: { score: 6, description: "Doha skyline; Museum of Islamic Art (I.M. Pei); Al Zubarah fort UNESCO; Souq Waqif; Lusail city; World Cup stadiums" },
      education: { score: 7, description: "Education City hosts Georgetown, Cornell Medicine, CMU, Northwestern, UCL branches; Qatar University; massive investment" },
      location: { score: 5, description: "Persian Gulf LNG shipping control; Al Udeid US base strategic; but surrounded by Saudi Arabia; small and exposed" },
      naturalResources: { score: 9, description: "World's 3rd largest natural gas reserves (North Field); significant oil reserves; LNG technology leader; finite but enormous" },
    },
  },
  {
    name: "India",
    flag: "🇮🇳",
    tier: "second",
    capital: "New Delhi",
    region: "South Asia",
    knownFor: "World's most populous democracy; ancient civilizations to Bollywood to IT superpower — a civilization of contradictions",
    stats: {
      military: { score: 8, description: "Nuclear-armed; 3rd largest military by active personnel (1.4M); aircraft carriers; ISRO dual-use capability; Brahmos missiles" },
      economy: { score: 8, description: "5th largest GDP at $3.7T; fastest growing major economy; IT superpower; UPI digital payments; manufacturing rising" },
      culture: { score: 9, description: "Bollywood world's largest film industry by tickets; 22 official languages; yoga; spices; festivals; billion-strong diaspora" },
      healthcare: { score: 4, description: "World-class private hospitals (medical tourism); severe public health gaps; rural access poor; Ayushman Bharat expanding" },
      internationalRelationships: { score: 7, description: "Quad member; G20 host 2023; BRICS; strategic autonomy doctrine; US, Russia, Gulf all partners; non-aligned tradition" },
      government: { score: 6, description: "World's largest democracy; federal system; but press freedom concerns under Modi; CAA controversy; democratic backsliding risk" },
      climate: { score: 5, description: "Himalayan peaks to Kerala backwaters; monsoon-dependent; extreme heat waves; flooding; but incredible diversity of climates" },
      technology: { score: 7, description: "Bangalore global IT hub; UPI payments digital revolution; ISRO cost-effective space missions; Aadhaar biometric system" },
      size: { score: 7, description: "7th largest country at 3.29M km²; Himalayan north, Deccan plateau, Gangetic plains, tropical south; two coastlines" },
      population: { score: 10, description: "1.44 billion people; world's most populous nation (surpassed China 2023); youngest major workforce; 1.2B mobile users" },
      history: { score: 10, description: "Indus Valley civilization 3300 BCE; Maurya and Gupta empires; Mughal golden age; British Raj; Gandhi's independence movement" },
      citiesLandmarks: { score: 9, description: "Taj Mahal; Varanasi ghats; Kerala backwaters; Golden Temple Amritsar; Rajasthan forts; Himalayas; Mumbai cosmopolis" },
      education: { score: 6, description: "IITs and IIMs globally elite; ISRO scientists; but massive quality inequality; rural access poor; 300M still illiterate" },
      location: { score: 6, description: "Indian Ocean centrality; trade routes to Africa, Gulf, Southeast Asia; but China border tensions and Pakistan conflict" },
      naturalResources: { score: 6, description: "Coal (4th largest reserves); iron ore; manganese; mica; bauxite; sufficient domestic base but not globally exceptional" },
    },
  },
  {
    name: "Mexico",
    flag: "🇲🇽",
    tier: "second",
    capital: "Mexico City",
    region: "North America",
    knownFor: "Land of Aztec pyramids and Caribbean beaches; the US's top trading partner riding a nearshoring manufacturing boom",
    stats: {
      military: { score: 5, description: "192,000 active; internal-focused combating cartels; limited power projection; US-equipped but domestically constrained" },
      economy: { score: 6, description: "15th largest GDP; nearshoring boom from US-China decoupling; auto manufacturing; USMCA anchor; oil through Pemex" },
      culture: { score: 8, description: "Dia de los Muertos UNESCO; mariachi; mole 30+ varieties; muralism (Rivera, Orozco); telenovelas; tequila and mezcal" },
      healthcare: { score: 5, description: "IMSS and ISSSTE public systems strained; INSABI reform messy; urban private excellent; rural access very limited" },
      internationalRelationships: { score: 6, description: "USMCA cornerstone trade partner; non-interventionist Estrada doctrine; G20; relationship with US complex but essential" },
      government: { score: 5, description: "Democracy with cartel violence undermining rule of law; AMLO-Morena institutional erosion concerns; Claudia Sheinbaum era" },
      climate: { score: 7, description: "Pacific beaches; Caribbean turquoise; central highlands; Copper Canyon; Yucatan cenotes; incredibly diverse geography" },
      technology: { score: 5, description: "Guadalajara Silicon Valley of Mexico; OXXO fintech; growing startup scene; but public infrastructure tech limited" },
      size: { score: 7, description: "14th largest country at 1.96M km²; Pacific + Atlantic Gulf coasts; Sierra Madre ranges; Yucatan peninsula" },
      population: { score: 7, description: "130 million people; 4th most populous in Americas; young median age; 60M Mexicans and diaspora in US" },
      history: { score: 8, description: "Olmec, Maya, Aztec (Tenochtitlan 1325 CE); Spanish conquest 1519; independence 1821; revolution 1910; muralist golden age" },
      citiesLandmarks: { score: 9, description: "Chichen Itza; Teotihuacan pyramids; Mexico City historic center; Guanajuato colonial; Oaxacan cuisine; Copper Canyon" },
      education: { score: 5, description: "UNAM among world's largest universities; ITESM Tec de Monterrey strong; but wide quality gaps between states" },
      location: { score: 7, description: "Shares 3,145km US border; USMCA trade access; Pacific and Gulf coasts; bridges Latin America to North America markets" },
      naturalResources: { score: 7, description: "World's #1 silver producer; oil through Pemex; copper; gold; zinc; lead; agricultural avocados, corn, tomatoes" },
    },
  },
  {
    name: "Brazil",
    flag: "🇧🇷",
    tier: "second",
    capital: "Brasilia",
    region: "South America",
    knownFor: "Amazon custodian and Carnival host; South America's sleeping giant rising through agriculture, fintech, and soft power",
    stats: {
      military: { score: 6, description: "Largest in Latin America; 334,000 active; nuclear program (civilian); Embraer military aircraft; Amazon patrol mission" },
      economy: { score: 7, description: "8th largest GDP at $2.1T; agriculture superpower (soy, beef, coffee); Embraer; Petrobras oil; fintech giant Nubank" },
      culture: { score: 9, description: "Carnival world's biggest party; samba and bossa nova; football religion; Amazon indigenous cultures; diverse racial mosaic" },
      healthcare: { score: 5, description: "SUS universal healthcare system (largest globally); world-class public health campaigns; but strained quality in public sector" },
      internationalRelationships: { score: 6, description: "BRICS co-founder; G20 member; non-aligned tradition; Lula 2023 global diplomacy; Amazon leverage on climate talks" },
      government: { score: 5, description: "Democracy restored; but institutional stress cycles; Lula vs Bolsonaro polarization; corruption systemic challenge" },
      climate: { score: 6, description: "Amazon tropical; fertile southern Pampas; northeast drought-prone; southern subtropical; cerrado savanna vast breadbasket" },
      technology: { score: 6, description: "Nubank world's largest digital bank; Embraer aerospace; agricultural tech precision farming; Pix instant payment system" },
      size: { score: 10, description: "5th largest country at 8.5M km²; Amazon basin; Atlantic coast 7,500km; world's largest river system; massive biodiversity" },
      population: { score: 8, description: "215 million people; 6th most populous; diverse from indigenous to German-Brazilians; Sao Paulo megacity 22M" },
      history: { score: 7, description: "Indigenous empires; Portuguese Empire; Imperial Brazil (unique in Americas); coffee republic; Vargas era; military rule; democracy" },
      citiesLandmarks: { score: 9, description: "Christ the Redeemer; Iguazu Falls; Amazon River; Carnival Rio; Salvador colonial; Fernando de Noronha; Pantanal wetlands" },
      education: { score: 5, description: "USP and UNICAMP excellent research universities; strong in agri-science; but systemic inequality between regions" },
      location: { score: 6, description: "South Atlantic trade routes; Amazon climate leverage globally; removed from NATO core; BRICS South-South diplomacy base" },
      naturalResources: { score: 9, description: "Iron ore world #2 exporter; pre-salt oil; soybeans world #1; gold; timber; freshwater world's largest reserves; minerals" },
    },
  },
  {
    name: "Argentina",
    flag: "🇦🇷",
    tier: "second",
    capital: "Buenos Aires",
    region: "South America",
    knownFor: "Tango, asado, and Lionel Messi; a European-influenced Southern Cone nation cycling between boom and economic crisis",
    stats: {
      military: { score: 5, description: "70,000 active; Falklands legacy; professional but limited budget; regional stability focus; South Atlantic patrols" },
      economy: { score: 5, description: "Chronic hyperinflation and debt cycles; but agriculture powerhouse (soy, beef); Vaca Muerta shale; Milei shock therapy" },
      culture: { score: 8, description: "Tango UNESCO; asado culture; Messi and Maradona football legends; Buenos Aires arts scene; Borges literature; wine culture" },
      healthcare: { score: 6, description: "Public healthcare better than Latin American average; medical tourism destination; but brain drain affecting quality" },
      internationalRelationships: { score: 5, description: "G20 member; non-aligned tradition; Falklands dispute with UK ongoing; Mercosur; BRICS applicant under Milei reconsidered" },
      government: { score: 5, description: "Democracy; Peronism vs anti-Peronism polarization; Milei libertarian experiment; institutional cycles of boom and bust" },
      climate: { score: 8, description: "Patagonian Andes and glaciers; fertile Pampas; subtropical Iguazu; Atacama puna; Mediterranean Mendoza wine country" },
      technology: { score: 6, description: "Strong software export sector; Mercado Libre e-commerce giant; Buenos Aires tech scene; Satellogic satellite company" },
      size: { score: 9, description: "8th largest country at 2.78M km²; Andes to Atlantic; Patagonia to Iguazu; long coastline with Antarctic claim" },
      population: { score: 6, description: "46 million people; highly educated; European-descended majority; Buenos Aires primate city of 15M; aging demographics" },
      history: { score: 7, description: "Indigenous Mapuche; Spanish colonial; massive European immigration wave; Peron era; military dictatorship; democratic transition" },
      citiesLandmarks: { score: 8, description: "Iguazu Falls; Perito Moreno Glacier; Patagonia trekking; Buenos Aires La Boca; Mendoza wine; Ushuaia End of the World" },
      education: { score: 7, description: "Free public university system (UBA globally ranked); high literacy 99%; professional culture; brain drain a major challenge" },
      location: { score: 5, description: "Southern cone Atlantic; Antarctic gateway; removed from NATO core; Pacific Alliance adjacent; trade routes to Europe viable" },
      naturalResources: { score: 8, description: "Lithium triangle #2; Vaca Muerta shale oil and gas world-class; soybeans; beef; gold; silver; copper; wind and solar" },
    },
  },
  {
    name: "Chile",
    flag: "🇨🇱",
    tier: "second",
    capital: "Santiago",
    region: "South America",
    knownFor: "Earth's driest desert to Patagonian glaciers; South America's most stable economy backed by copper and lithium",
    stats: {
      military: { score: 5, description: "75,000 active; professional and capable for region; Atacama border patrol; peacekeeping missions; modest but respected" },
      economy: { score: 6, description: "Most stable Latin American economy; copper world #1; lithium world #2; OECD member; sound fiscal policy; Pacific Alliance" },
      culture: { score: 7, description: "Pablo Neruda and Gabriela Mistral Nobel Prize literature; Atacama stargazing; wine culture; Easter Island mystique; cueca" },
      healthcare: { score: 7, description: "Best in Latin America; mixed public-private FONASA/ISAPRE; strong maternal health; life expectancy 80+; improving access" },
      internationalRelationships: { score: 6, description: "Pacific Alliance leadership; OECD member since 2010; strong trade ties with US, EU, China; copper diplomacy effective" },
      government: { score: 7, description: "Strong democratic institutions; independent judiciary; Pinochet transition to democracy model; Boric progressive governance" },
      climate: { score: 9, description: "Atacama world's driest desert; Patagonian ice fields; Mediterranean Santiago; Andean skiing; lush Lake District; 4,300km length" },
      technology: { score: 6, description: "Atacama solar energy world's cheapest; Santiago growing tech hub; Cornershop acquired by Uber; green hydrogen potential" },
      size: { score: 6, description: "756,000 km² but extremely narrow (avg 180km wide); 4,300km long Pacific coast; Andes to Pacific dramatic geography" },
      population: { score: 5, description: "19 million people; highly urbanized (87%); Santiago dominates; significant Venezuelan and Haitian immigration recently" },
      history: { score: 6, description: "Mapuche resistance; Incan edge; Spanish colonial; independence 1818; nitrate wealth; Pinochet dictatorship; democratic model" },
      citiesLandmarks: { score: 9, description: "Torres del Paine; Atacama stargazing; Easter Island Moai; Perito Moreno via border; Valle de la Luna; Chiloe churches" },
      education: { score: 7, description: "Education reform focus; Pontificia U Catolica top in Latin America; high literacy; free university for lower income now" },
      location: { score: 5, description: "Pacific South America; Drake Passage gateway; removed from NATO but OECD stable; trade bridges Asia-Pacific via ports" },
      naturalResources: { score: 9, description: "Copper world #1 producer (28% global); lithium world #2; gold; molybdenum; salmon aquaculture; Atacama solar energy" },
    },
  },
  {
    name: "Peru",
    flag: "🇵🇪",
    tier: "second",
    capital: "Lima",
    region: "South America",
    knownFor: "Home of the Inca Empire and Machu Picchu; Lima crowned the culinary capital of the Americas",
    stats: {
      military: { score: 5, description: "120,000 active; internal counter-narcotics focus; Shining Path legacy; limited regional power projection; Ecuador border past" },
      economy: { score: 5, description: "Mining-driven (copper, gold, zinc); Lima as business hub; inequality severe; but consistent growth past two decades" },
      culture: { score: 9, description: "Lima named culinary capital of Americas; Inca heritage; 48 ecosystems; 55 indigenous peoples; colorful textiles; ceviche" },
      healthcare: { score: 4, description: "SIS public insurance expanding; Lima private hospitals good; rural indigenous communities severely underserved; gaps large" },
      internationalRelationships: { score: 5, description: "Pacific Alliance co-founder; APEC member; China top trade partner; US relations complex; political instability affects diplomacy" },
      government: { score: 4, description: "Chronic political instability; 6 presidents in 7 years; Boluarte controversy; impeachment culture; constitution needs reform" },
      climate: { score: 7, description: "Amazon rainforest; Andes highland; coastal desert Lima; Lake Titicaca; 4 of world's 32 ecosystems; incredible biodiversity" },
      technology: { score: 4, description: "Lima startup scene growing; Yape digital payment popular; but rural connectivity severely limited; infrastructure gaps" },
      size: { score: 7, description: "4th largest in South America at 1.28M km²; Amazon basin to Andes to Pacific coast; diverse geography extremes" },
      population: { score: 6, description: "33 million people; 10M in Lima; significant indigenous Quechua and Aymara populations; highland to coastal migration" },
      history: { score: 9, description: "Caral civilization 3000 BCE; Chavin; Moche; Tiwanaku; Inca Empire greatest in Americas; Machu Picchu 1450 CE" },
      citiesLandmarks: { score: 9, description: "Machu Picchu; Nazca Lines; Lake Titicaca; Colca Canyon; Amazon River; Lima Larco Museum; Chan Chan UNESCO; Rainbow Mountain" },
      education: { score: 5, description: "PUCP and San Marcos universities decent; but national quality very uneven; rural dropout rates high; access improving" },
      location: { score: 5, description: "Pacific South America; removed from power centers; Pacific Alliance trade routes; Amazon governance leverage in climate talks" },
      naturalResources: { score: 8, description: "Gold world top 5; copper world top 3; silver world top 3; zinc; iron ore; natural gas; anchovy fishing world's largest" },
    },
  },
  {
    name: "Indonesia",
    flag: "🇮🇩",
    tier: "second",
    capital: "Jakarta",
    region: "Southeast Asia",
    knownFor: "17,000 islands; world's largest Muslim nation; Bali spiritual mysticism meeting Jakarta's billion-dollar startup boom",
    stats: {
      military: { score: 6, description: "395,000 active; largest in Southeast Asia; Sukhoi jets and F-16s; maritime patrol critical; counter-terror focus; modernizing" },
      economy: { score: 7, description: "16th largest GDP; fastest growing G20; digital economy GoTo and Sea Group; nickel EV battery supply chain; palm oil export" },
      culture: { score: 8, description: "300+ ethnic groups; batik and wayang UNESCO; gamelan music; Bali Hinduism; Javanese court culture; 700+ regional languages" },
      healthcare: { score: 5, description: "JKN universal coverage (world's largest single-payer by enrollment); but rural island quality severe gaps; doctor shortage" },
      internationalRelationships: { score: 6, description: "ASEAN founding leadership; G20 host 2022; non-aligned active; US and China both court Indonesia; South China Sea claims" },
      government: { score: 6, description: "Democracy consolidating; Jokowi infrastructure transformation; Prabowo 2024 presidency; corruption remains systemic challenge" },
      climate: { score: 5, description: "Tropical equatorial; high humidity; volcanic risk (127 active volcanoes); flooding; but stunning biodiversity from this ecology" },
      technology: { score: 6, description: "GoTo (Gojek+Tokopedia) $40B+ tech giant; Sea Group gaming; Traveloka; largest startup ecosystem in Southeast Asia" },
      size: { score: 8, description: "Archipelago 1.9M km²; stretches 5,100km; 17,508 islands; 4th most extensive EEZ; Borneo, Java, Sumatra, Sulawesi, Papua" },
      population: { score: 9, description: "280 million people; 4th most populous nation; Java densest major island; 64M in greater Jakarta metro area" },
      history: { score: 8, description: "Srivijaya maritime empire; Hindu-Buddhist Majapahit (1293-1527 CE); Dutch 350-year colonial rule; 1945 independence struggle" },
      citiesLandmarks: { score: 8, description: "Bali temples and rice terraces; Borobudur world's largest Buddhist temple; Komodo dragons; Raja Ampat diving paradise" },
      education: { score: 5, description: "University of Indonesia and ITB strong; STEM improving; but quality disparities across 17,000 island archipelago severe" },
      location: { score: 7, description: "Strait of Malacca choke point (40% world trade); strategic Indo-Pacific position; ASEAN hub; both US and China want partnership" },
      naturalResources: { score: 7, description: "Nickel world #1 (critical for EV batteries); coal; palm oil; tin; gold; natural gas; copper; tropical timber" },
    },
  },
  {
    name: "Philippines",
    flag: "🇵🇭",
    tier: "second",
    capital: "Manila",
    region: "Southeast Asia",
    knownFor: "7,641 islands of fiestas and Spanish-Catholic heritage; English-speaking global workforce powering BPO and remittances",
    stats: {
      military: { score: 4, description: "140,000 active; US mutual defense treaty; but limited hardware aging; internal focus on NPA, Abu Sayyaf; South China Sea patrols" },
      economy: { score: 5, description: "BPO industry $30B; OFW remittances $36B; growing tourism; middle-income trap challenge; Marcos economic policy unclear" },
      culture: { score: 8, description: "Fiesta culture (7,000+ festivals); 333 years Spanish Catholic influence; kundiman music; Filipino food fusion; jeepney art" },
      healthcare: { score: 5, description: "PhilHealth universal insurance expanding; Manila private hospitals decent; rural barangay health centers limited; brain drain doctors" },
      internationalRelationships: { score: 6, description: "US mutual defense treaty; ASEAN founding member; South China Sea arbitration won vs China; strategic to US Indo-Pacific" },
      government: { score: 5, description: "Democracy with authoritarian cycles; Marcos Jr presidency dynastic return; Duterte drug war controversy; separation of powers tested" },
      climate: { score: 4, description: "20 typhoons annually average; Haiyan Super Typhoon 2013; high flooding risk; but tropical beauty in calm season" },
      technology: { score: 5, description: "BPO tech infrastructure strong; Maya and GCash fintech growing; Jollibee global expansion; startup scene emerging in BGC Manila" },
      size: { score: 5, description: "300,000 km² archipelago; 7,641 islands; Luzon, Visayas, Mindanao main groups; dispersed geography complicates governance" },
      population: { score: 7, description: "115 million people; 12th most populous; young median age 25; 10M OFWs abroad; Manila metro 24M; rapid urbanization" },
      history: { score: 7, description: "Austronesian kingdoms; 333 years Spanish colonization; 1898 American occupation; WW2 Battle of Manila; 1986 People Power" },
      citiesLandmarks: { score: 7, description: "Palawan El Nido paradise; Banaue Rice Terraces UNESCO; Chocolate Hills Bohol; Coron diving; Batanes islands; Mayon Volcano" },
      education: { score: 6, description: "98% literacy; English-medium instruction advantage; UP Diliman globally recognized; but public school quality uneven" },
      location: { score: 6, description: "South China Sea; US basing at Subic and Clark returning; critical to US Indo-Pacific strategy; Pacific typhoon vulnerability" },
      naturalResources: { score: 6, description: "Copper; gold (world top 5 reserves); nickel; chromite; geothermal energy (#2 globally); coconut oil; tuna fisheries" },
    },
  },
  {
    name: "Egypt",
    flag: "🇪🇬",
    tier: "second",
    capital: "Cairo",
    region: "Middle East",
    knownFor: "Mother of civilization; pharaohs and pyramids meet the Suez Canal chokepoint where Africa connects the world",
    stats: {
      military: { score: 7, description: "440,000 active; 3rd largest in Middle East; US-equipped F-16s; M1 Abrams tanks; Camp David aid dependency; Sinai missions" },
      economy: { score: 5, description: "Suez Canal $9B revenue; tourism; natural gas (Zohr field); but high debt, inflation 30%+; IMF bailouts recurring challenge" },
      culture: { score: 9, description: "Mother of the world (Um al-Dunya); Arabic music and film hub; Cairo Jazz; Naguib Mahfouz Nobel; belly dance; Umm Kulthum" },
      healthcare: { score: 4, description: "Universal Health Insurance expanding to all governorates; Cairo private hospitals good; rural Upper Egypt severely underserved" },
      internationalRelationships: { score: 7, description: "Camp David Accords peace with Israel; key US ally; Arab League HQ Cairo; Suez Canal leverage; African Union engagement" },
      government: { score: 3, description: "Military authoritarian since 2013 Sisi coup; press suppression; political prisoners; NGO restrictions; security state dominates" },
      climate: { score: 3, description: "90% uninhabitable desert; extreme heat; only Nile valley and Delta habitablefor agriculture; Mediterranean coast pleasant" },
      technology: { score: 5, description: "Fawry fintech and digital payments growing; Smart Egypt initiative; Cairo tech scene; Egypt Vision 2030 digital transformation" },
      size: { score: 7, description: "1.01M km²; 10th largest in Africa; but 95% uninhabited desert; population concentrated in 4% Nile Valley" },
      population: { score: 7, description: "107 million people; most populous Arab country; 22M in Cairo megacity; Nile Delta extremely dense; young population" },
      history: { score: 10, description: "Ancient Egypt 3100 BCE; pyramids of Giza; Pharaonic civilization 30 dynasties; Cleopatra; Roman conquest; Arab Islamic caliphate" },
      citiesLandmarks: { score: 10, description: "Great Pyramid of Giza (last ancient wonder); Sphinx; Valley of the Kings; Luxor Temple; Abu Simbel; Cairo Islamic quarter" },
      education: { score: 4, description: "Cairo University one of world's largest enrollment; Al-Azhar Islamic authority; but quality concerns; literacy gaps in rural south" },
      location: { score: 7, description: "Suez Canal controls 12% world trade; connects Mediterranean to Red Sea; bridge between Africa, Asia, Europe; strategic chokepoint" },
      naturalResources: { score: 5, description: "Zohr natural gas field (largest in Mediterranean); limited oil; phosphates world top 3; iron ore; some gold mining" },
    },
  },
  {
    name: "Nigeria",
    flag: "🇳🇬",
    tier: "second",
    capital: "Abuja",
    region: "Africa",
    knownFor: "Africa's most populous nation; Nollywood, Afrobeats, and Lagos fintech leading a continental renaissance",
    stats: {
      military: { score: 6, description: "224,000 active; largest in West Africa; peacekeeping in Mali and DR Congo; counter-Boko Haram in northeast; Gulf of Guinea" },
      economy: { score: 6, description: "Largest in Africa by GDP at $440B; oil via NNPC; Nollywood $1B; Lagos fintech Flutterwave and Paystack; agri-sector huge" },
      culture: { score: 9, description: "Afrobeats global conquest (Burna Boy, Wizkid, Davido); Nollywood world's 2nd largest by volume; 250 ethnicities; jollof rice wars" },
      healthcare: { score: 3, description: "Serious systemic gaps; severe brain drain of doctors to UK; private hospitals urban-only; maternal mortality very high" },
      internationalRelationships: { score: 6, description: "African Union leading voice; ECOWAS anchor; G20 aspirant; diaspora 17M globally influential; oil diplomacy in Africa" },
      government: { score: 4, description: "Democracy with persistent corruption (Transparency International low rank); Tinubu fuel subsidy reform; security multi-front challenge" },
      climate: { score: 5, description: "Tropical rainforest south; Guinea savanna middle; arid Sahel north; high flooding in delta; diverse but challenging extremes" },
      technology: { score: 7, description: "Africa's #1 fintech hub; Flutterwave unicorn; Paystack acquired by Stripe; Lagos as Silicon Lagoon; 10M+ developers by 2030 goal" },
      size: { score: 6, description: "923,768 km²; size of Texas and California combined; Niger Delta oil-rich; Lake Chad basin; diverse terrain" },
      population: { score: 8, description: "220 million people; most populous in Africa; by 2050 projected 400M; median age 18; Lagos 25M megacity; fastest growing" },
      history: { score: 7, description: "Benin Bronze Kingdom (1300 CE); Sokoto Caliphate; Yoruba Oyo Empire; British colonization; independence 1960; civil war 1967-70" },
      citiesLandmarks: { score: 5, description: "Lagos Victoria Island; Abuja modernist capital; Benin City bronze collection; Zuma Rock; Obudu Ranch; Niger Delta" },
      education: { score: 4, description: "Lagos UNILAG and Ibadan improving; but underfunding chronic; ASUU strikes; quality varies wildly; improving in Lagos and Abuja" },
      location: { score: 5, description: "West Africa Gulf of Guinea; Atlantic coast; ECOWAS economic hub; Sahel instability nearby; landlocked neighbors depend on Nigeria" },
      naturalResources: { score: 8, description: "6th largest oil producer (OPEC); massive natural gas flaring being captured; tin; iron ore; coal; agricultural cocoa, cashew" },
    },
  },
  {
    name: "South Africa",
    flag: "🇿🇦",
    tier: "second",
    capital: "Pretoria",
    region: "Africa",
    knownFor: "Rainbow Nation of Mandela; from Table Mountain to Kruger safaris; Africa's most industrialized and diversified economy",
    stats: {
      military: { score: 6, description: "SANDF 90,000 active; historically capable; AU peacekeeping missions in DRC, Mozambique; submarine and naval capability" },
      economy: { score: 6, description: "Most industrialized in Africa; Johannesburg financial hub; mining, finance, tourism, auto manufacturing; but inequality extreme" },
      culture: { score: 8, description: "Ubuntu philosophy; Zulu, Xhosa, Cape Malay, Afrikaner cultures; Cape Town jazz; Mandela legacy; wine culture; 11 official languages" },
      healthcare: { score: 6, description: "World-class private hospitals (Netcare, Mediclinic); strained public health system; HIV treatment program global model" },
      internationalRelationships: { score: 6, description: "BRICS founding voice; African Union champion; ICC war crimes tension (Zuma); G20; non-aligned but China-Russia tilting" },
      government: { score: 6, description: "Strong constitution and Constitutional Court; Mandela democratic legacy; but ANC governance decline; Ramaphosa reform challenges" },
      climate: { score: 8, description: "Mediterranean Cape Town; Highveld; Kruger savanna; Drakensberg mountains; generally mild and diverse; world-class wine regions" },
      technology: { score: 6, description: "Naspers and Prosus global media venture capital; Cape Town startup scene; African fintech pioneer; load-shedding energy crisis" },
      size: { score: 7, description: "1.22M km²; southern Africa; borders Atlantic and Indian Oceans; Lesotho landlocked inside; Drakensberg to Karoo diversity" },
      population: { score: 6, description: "62 million people; highly urbanized; Johannesburg 10M; Cape Town 5M; diverse ethnic mosaic; aging HIV demographic impact" },
      history: { score: 8, description: "Zulu and Xhosa kingdoms; Dutch VOC Cape Colony; Great Trek; Anglo-Boer Wars; apartheid 1948-1994; Mandela Nobel Peace Prize" },
      citiesLandmarks: { score: 8, description: "Table Mountain; Kruger National Park; Cape of Good Hope; Garden Route; Robben Island; Drakensberg; wine estates" },
      education: { score: 6, description: "UCT and Stellenbosch world-class; Wits strong; but systemic inequality in access; fees must fall movement; rural gaps severe" },
      location: { score: 6, description: "Southern tip controlling Cape sea route; Indian and Atlantic Ocean junction; gateway to sub-Saharan Africa; SADC anchor" },
      naturalResources: { score: 9, description: "Gold world #2; platinum world #1 (90% reserves); diamonds; coal; chromium; manganese; iron ore; titanium; vanadium" },
    },
  },
`;

// Insert before the closing bracket of COUNTRIES array
content = content.replace(
  /(\n\];)\n\nexport const CATEGORIES/,
  `${newCountries}];\n\nexport const CATEGORIES`
);

writeFileSync(filePath, content, "utf8");
console.log("✅ countries.ts updated successfully");
