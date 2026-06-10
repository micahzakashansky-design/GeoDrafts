import { readFileSync, writeFileSync } from 'fs';

const file = 'artifacts/country-draft/src/data/countries.ts';
let lines = readFileSync(file, 'utf8').split('\n');

// Population data (original scores/descriptions based on absolute population)
const popData = {
  'United States': [8, '334 million people; highly educated workforce; major immigration hub; world\'s 3rd most populous nation'],
  'Germany': [7, '84 million people; highly skilled workforce; aging population offset by immigration; world\'s 2nd immigration destination'],
  'Japan': [7, '125 million people; aging rapidly; one of world\'s most educated; intense urban density in Tokyo metro (37M)'],
  'United Kingdom': [6, '67 million; multicultural society; London one of world\'s most diverse cities; strong immigration from Commonwealth'],
  'France': [7, '68 million; multicultural; aging but fertility rate higher than EU average; 5th most visited country on earth'],
  'Sweden': [4, '10.5 million; one of world\'s most educated; high immigration rate; aging population well-managed by welfare system'],
  'Norway': [3, '5.4 million; most prosperous small nation on earth; high immigration; oil wealth distributed to entire population'],
  'Switzerland': [3, '8.7 million; 26% foreign-born; four linguistic groups; highest quality of life metrics; extremely low unemployment'],
  'Canada': [5, '40 million; world\'s highest immigration per capita; highly educated; concentrated in southern corridor near US border'],
  'Australia': [4, '26 million; one of world\'s most successful immigration models; cosmopolitan cities; very low population density'],
  'South Korea': [5, '52 million; world\'s most educated; extremely low birth rate crisis; hyper-urbanized (Seoul metro = 25M)'],
  'Singapore': [2, '5.9 million; 40% foreign-born; world\'s highest GDP per capita PPP; education system ranked #1 globally (PISA)'],
  'Denmark': [3, '5.9 million; very high social trust; homogeneous but increasingly diverse; happiest population metrics consistently'],
  'Finland': [3, '5.5 million; world\'s happiest 2023; highly educated; Finnish language isolates from EU linguistically'],
  'Netherlands': [4, '17.9 million; highly educated; multicultural legacy from colonial era; excellent English proficiency; progressive society'],
  'New Zealand': [2, '5 million; highly multicultural; 16% Maori; growing Asian community; immigration-friendly; low density'],
  'Austria': [3, '9.1 million; highly educated; 20% foreign-born; Vienna consistently ranked world\'s most livable city'],
  'Belgium': [3, '11.6 million; trilingual society (Dutch/French/German); 25% born abroad; Brussels most international city in EU'],
  'Ireland': [3, '5.1 million; global diaspora 70M+ worldwide; strong immigration reversal from emigration nation; young demographics'],
  'Italy': [6, '60 million; aging crisis; low birth rate; emigration of youth; Italian diaspora 80M worldwide; rich regional identity'],
  'Spain': [6, '47 million; aging; low birth rate; 15% foreign-born; strong Latin American immigration; regional languages complex'],
  'Portugal': [3, '10.2 million; declining due to emigration; large diaspora 5M worldwide; strong immigration from Brazil/Africa now'],
  'Czech Republic': [4, '10.9 million; homogeneous; low immigration historically; one of region\'s most skilled workforces'],
  'Poland': [6, '38 million; highly educated; Catholic-majority; 1M+ Ukrainians now resident; large diaspora in UK/Germany'],
  'Russia': [7, '145 million; declining due to war losses and emigration; multi-ethnic 190+ groups; highly educated but brain-draining'],
  'China': [10, '1.4 billion people; world\'s largest until 2023; massive urbanization; aging; one-child policy legacy; 56 ethnic groups'],
  'Turkey': [7, '85 million; young demographics; Istanbul 15M megacity; majority Muslim; secular tradition vs. Islamist tension'],
  'Ukraine': [6, 'Pre-war 44M; significantly reduced by displacement; 8M+ refugees in Europe; multilingual; young educated diaspora'],
  'Romania': [5, '19 million; declining due to emigration (3M+ left for Western Europe); young educated diaspora large'],
  'Hungary': [4, '9.7 million; declining; low birth rate; brain drain to Western EU; Roma minority largest in Europe (8%)'],
  'Israel': [2, '9.7 million; Jewish majority; Arab citizens 20%; rapid natural growth; immigration from global diaspora continues'],
  'Greece': [4, '10.7 million; significant emigration during debt crisis; aging; immigration from Middle East; Orthodox Christian majority'],
  'Estonia': [1, '1.37 million; one of world\'s smallest; 25% Russian minority; brain drain challenge; world\'s most digitally literate'],
  'Slovakia': [3, '5.5 million; homogeneous; Hungarian minority 10%; brain drain to Czech Republic and Austria challenge'],
  'Croatia': [3, '3.9 million; emigration challenge (500K to Germany/Austria); tourism-dependent seasonal economy; Catholic majority'],
  'Serbia': [4, '6.8 million; declining due to emigration; Serbian diaspora large worldwide; Orthodox Christian; Roma significant minority'],
  'Bulgaria': [4, '6.5 million; one of world\'s fastest declining populations (emigration + aging); significant diaspora in Spain/Germany'],
  'Kazakhstan': [4, '19 million; multi-ethnic (Kazakhs 70%, Russians 15%); nomadic heritage; rapid Astana urbanization; Baikonur city'],
  'Georgia': [2, '3.7 million; emigration challenge; large diaspora in Russia; significant Russian immigrant influx post-2022'],
  'Armenia': [2, '3 million; global diaspora 7-10M (more abroad than home); French, Russian, American Armenian communities strong'],
  'Iceland': [1, '376,000 — Europe\'s most sparsely populated capital; world\'s most genetically tracked population (deCODE genetics)'],
  'Luxembourg': [1, '660,000; 47% foreign-born (EU records); trilingual (Luxembourgish, French, German); extraordinary diversity in tiny space'],
  'Slovenia': [2, '2.1 million; highly educated; lowest emigration of ex-Yugoslav nations; Ljubljana charming compact capital'],
  'Latvia': [2, '1.84 million; declining due to emigration; 25% Russian minority; Baltic most ethnically complex; EU labor mobility'],
  'Lithuania': [2, '2.9 million; significant emigration to UK/Ireland; large return due to Ukraine war; geographically center of Europe'],
  'North Macedonia': [2, '2 million; multi-ethnic (Macedonians 65%, Albanians 25%); significant emigration; Orthodox-Muslim coexistence'],
  'Moldova': [2, '2.6 million; massive emigration (30%+ abroad); large diaspora in Romania, Italy, Russia; Moldova-Romania duality'],
  'Azerbaijan': [4, '10 million; Turkic Azerbaijani majority; Shia Muslim majority; significant Russian and Armenian minorities'],
  'Belarus': [4, '9.4 million; declining; large protest diaspora in Lithuania/Poland post-2020; Russian as daily language for most'],
  'Albania': [2, '2.8 million; 1M+ in Italy, 600K+ in Greece; massive emigration reversed slowly by tourism; very young population'],
};

// Technology data (public infrastructure tech: transit, smart cities, digital services)
const techData = {
  'United States': [7, 'Uneven public tech; Silicon Valley leads but cities car-dependent; NYC/SF transit acceptable; most cities tech-poor for public infrastructure; strong private consumer tech'],
  'Germany': [7, 'Efficient DB rail network; growing digitization (but paper-heavy government); strong industrial automation; autobahn smart management; excellent engineering infrastructure'],
  'Japan': [10, 'World\'s most advanced public tech; Shinkansen perfection; IC card transit everywhere; robotics in public spaces; smart traffic systems; cashless infrastructure; earthquake-resilient smart grid'],
  'United Kingdom': [6, 'London TfL Oyster card excellent; rest of UK aging rail; NHS app and digital health decent; smart motorway system; government digitization improving but lagging'],
  'France': [7, 'TGV high-speed rail; Paris Metro world-class; contactless payments widespread; strong digital state services; Minitel legacy now reversed into strong digital infrastructure'],
  'Sweden': [8, 'Swish mobile payments universal; digital ID BankID; Stockholm smart city; cashless society furthest in EU; excellent fiber coverage; SJ rail growing; strong e-government'],
  'Norway': [7, 'World\'s highest EV charging density; BankID digital identity; strong e-government; excellent public transport in Oslo; Ruter app; fully digital public services'],
  'Switzerland': [8, 'SBB Swiss rail precision legendary; SwissPass integrated transit card; excellent nationwide public transport; strong e-government; precise infrastructure maintenance; high reliability'],
  'Canada': [7, 'Decent urban transit in Toronto/Vancouver/Montreal; digital government services improving; PRESTO transit card growing; 5G expanding; but vast rural digital divide'],
  'Australia': [7, 'Opal/Myki transit cards; smart city initiatives in Sydney/Melbourne; digital government services modernizing; NBN broadband (controversial rollout); large distances challenge connectivity'],
  'South Korea': [10, 'T-money contactless transit universal; 5G density highest globally; smart city Songdo; fully paperless digital government; KTX bullet trains; AI traffic management; fastest average internet'],
  'Singapore': [10, 'Smart Nation initiative benchmark; EZ-Link seamless transit; autonomous test vehicles deployed; digital government 100%; sensor-laden infrastructure; cashless economy; world\'s most connected city'],
  'Denmark': [8, 'Copenhagen Rejsekort transit card; smart city Copenhagen; digital government MitID; bike superhighways; district heating smart grid; excellent digital public services'],
  'Finland': [8, 'Whim mobility-as-a-service world\'s first; HSL Helsinki transit excellent; digital government excellent; fastest average internet in EU; 5G leading; strong digital ID infrastructure'],
  'Netherlands': [8, 'OV-chipkaart nationwide transit integration; Amsterdam smart city; excellent cycling infrastructure tech; digital government DigiD; advanced water management sensors; strong e-services'],
  'New Zealand': [6, 'AT HOP transit cards in Auckland; government digital services; geographic isolation limits infra density; rural broadband investment ongoing; smart city infrastructure growing'],
  'Austria': [7, 'OBB Austrian rail among Europe\'s best; Wiener Linien Vienna transit world-class; klimaticket integrated national pass; e-government modernizing; excellent alpine infrastructure maintenance'],
  'Belgium': [6, 'STIB/De Lijn transit systems; aging rail infrastructure (frequent delays); 5G growing; digital government itsme app; Brussels smart city project; digital divide between regions'],
  'Ireland': [6, 'Leap Card Dublin transit; TFI Live app; poor public transport outside Dublin; government MyGovID digital; fiber rollout ongoing; tech cluster but public infra lags private sector'],
  'Italy': [5, 'Frecciarossa excellent but limited routes; regional variance massive; aging metro systems; CIE digital ID growing; Telepass road tolls smart; paper bureaucracy stubbornly persistent'],
  'Spain': [7, 'AVE high-speed rail world\'s 2nd largest network; Madrid Metro excellent; Tarjeta Transporte integrated; Barcelona smart city pioneer; government Cl@ve digital; strong contactless adoption'],
  'Portugal': [5, 'Andante/Navegante transit cards; Lisboa Metro decent; CP rail improving; digital e.gov growing; fiber expanding; but significant rural gaps and older infrastructure remain'],
  'Czech Republic': [6, 'Prague Metro excellent; Litacka Prague transit card; PID integrated transport system; Czech POINT digital citizen services; 5G growing; good fiber coverage in cities'],
  'Poland': [6, 'Warsaw Metro and SKM growing fast; mObywatel digital ID app; PKP Intercity rail improving; ZTM transit cards; strong IT talent but public digital services still modernizing'],
  'Russia': [6, 'Moscow Metro world-class (deep, fast, ornate); Troika card; but outside Moscow/St.Pete poor; Gosuslugi digital services widely used; sovereign internet concerns; high urban-rural gap'],
  'China': [9, 'Largest bullet train network globally (40,000km); Alipay/WeChat Pay ubiquitous everywhere; facial recognition transit boarding; smart city pilots nationwide; 5G blanket coverage in cities'],
  'Turkey': [5, 'Istanbul Metrobus BRT excellent; Istanbulkart contactless; Marmaray tunnel; e-Devlet digital government improving; but Ankara/Izmir transit limited; digital government growing'],
  'Ukraine': [6, 'Kyiv Metro still functional; Diia digital government app world-leading (wartime resilience); e-services record; drone integration for defense; tech-forward despite war disruption'],
  'Romania': [4, 'Bucharest Metro limited; CFR rail slow and aging; digital gov.ro patchy; paradoxically fast fiber internet (top 10 globally); Cluj-Napoca smart city project; tech sector growing'],
  'Hungary': [5, 'BKK Budapest transit decent; MAV rail underinvested; Nemzeti Mobilfizetes NFC payments; Ugyfelkapu digital ID; Budapest smart city limited; rural broadband improving with EU funds'],
  'Israel': [7, 'New Tel Aviv light rail; Rav Kav transit card; digital government e-citizen; autonomous vehicle testing; strong tech infrastructure in cities; innovative public safety tech systems'],
  'Greece': [4, 'Athens Metro modern and clean; OASTH Thessaloniki transit old; digital gov.gr improving; e-prescription medical; aging infrastructure overall; fiber rollout slow outside Athens'],
  'Estonia': [9, 'World leader in e-governance; X-Road digital backbone; digital voting since 2005; e-Residency program; Tallinn free public transit; 99% public services online; ID-kaart everywhere; digital prescriptions'],
  'Slovakia': [4, 'IDS BK Bratislava transit card; ZSR rail aging; Slovensko.sk digital portal improving; 5G coverage in cities; limited smart infrastructure outside Bratislava'],
  'Croatia': [5, 'ZET Zagreb transit; HZ rail scenic but slow; m-parking digital; e-Gradani digital government; Dubrovnik smart tourism management; EU funds improving connectivity'],
  'Serbia': [5, 'BeoVoz/Metro growing; Belgrade bus decent; e-Uprava digital services; EPS smart meters; Telekom Serbia 5G; modernizing but significant urban-rural digital divide'],
  'Bulgaria': [4, 'Sofia Metro 3 lines; digital gov.bg services; aging infrastructure; paper-heavy bureaucracy; fiber internet surprisingly fast; 5G Sofia only; significant digital divide'],
  'Kazakhstan': [4, 'Astana smart city ambitious LRT; digital government eGov.kz; 5G in Astana and Almaty; smart buildings; Starlink available; vast steppe connectivity challenge'],
  'Georgia': [4, 'Tbilisi Metro 2 lines; marshrutka city transport; my.gov.ge digital portal; Bolt ride-hailing ubiquitous; tech nomad hub growing; public infrastructure investment low'],
  'Armenia': [5, 'Yerevan transit modernizing; e-government e-services good; EKENG digital infrastructure; Silicon Mountains tech hub; iDram digital payments; public tech investment limited'],
  'Iceland': [7, '100% renewable geothermal grid; Straeto bus digital app; digital government Island.is excellent; world\'s first cashless society push; clean tech public systems; Starlink early adopter'],
  'Luxembourg': [7, 'Free public transit entire country (world first since 2020); CFL rail excellent; GoPass integrated transit; e-government My Guichet; satellite expertise SES; tiny but cutting-edge'],
  'Slovenia': [6, 'LPP Ljubljana transit Urbana card; SZ rail; e-uprava digital government; excellent fiber coverage; EV charging network; compact country means good coverage nationwide'],
  'Latvia': [6, 'Rigas Satikusme transit e.talons card; LDz rail modernizing; e-Latvija digital services; 5G Riga; improving digital government; strong IT sector in Riga'],
  'Lithuania': [7, 'Vilnius public transit M-ticket app; LitRail growing; e-government VIISP; Revolut and NordVPN HQ; fastest internet in Baltics; strong fintech and digital services; 5G nationwide'],
  'North Macedonia': [4, 'Skopje city buses; JSP transit limited; e-Government portal; EU-funded broadband projects; limited smart infrastructure; small market constrains investment'],
  'Moldova': [3, 'Chisinau trolleybus aging; MPay digital payments; e-government basic; Moldtelecom fiber growing; EU\'s poorest digital infrastructure; significant brain drain of IT talent'],
  'Azerbaijan': [4, 'Baku Metro modernizing; ASAN service digital government excellent; e-government growing; 5G Baku; smart city projects; oil wealth funding new infrastructure'],
  'Belarus': [5, 'Minsk Metro 3 lines excellent; Minsk transit well-organized; HTP digital free economic zone; EPAM IT legacy; Viber created here; isolated from Western tech ecosystems'],
  'Albania': [3, 'Tirana transit minimal; no metro; digital government e-Albania improving; major infrastructure gaps; fiber expanding in cities; significant rural connectivity gaps'],
};

// Process lines: track current country name, replace population and technology entries
let currentName = '';
let popUpdated = 0;
let techUpdated = 0;

lines = lines.map(line => {
  // Detect current country name
  const nameMatch = line.match(/^\s+name: "(.+)"/);
  if (nameMatch) {
    currentName = nameMatch[1];
  }

  // Replace population line
  if (line.match(/^\s+population: \{ score: \d+, description: ".+" \},/) && popData[currentName]) {
    const [score, desc] = popData[currentName];
    popUpdated++;
    return `      population: { score: ${score}, description: "${desc}" },`;
  }

  // Replace technology line
  if (line.match(/^\s+technology: \{ score: \d+, description: ".+" \},/) && techData[currentName]) {
    const [score, desc] = techData[currentName];
    techUpdated++;
    return `      technology: { score: ${score}, description: "${desc}" },`;
  }

  return line;
});

// Fix CATEGORIES: rename "Population Density" to "Population"
lines = lines.map(line =>
  line === '  "Population Density",' ? '  "Population",' : line
);

// Fix getCategoryKey: "Population Density" → "Population", value → "population"
lines = lines.map(line =>
  line.includes('"Population Density": "populationDensity"')
    ? '    "Population": "population",'
    : line
);

writeFileSync(file, lines.join('\n'));
console.log(`Population updated: ${popUpdated}, Technology updated: ${techUpdated}`);
