const ts = require('typescript');
const fs = require('fs');

const code = fs.readFileSync('src/data/countries.ts', 'utf8');
const jsCode = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
fs.writeFileSync('temp_countries.js', jsCode);
const { COUNTRIES, shuffleArray } = require('./temp_countries.js');

let pool = [...COUNTRIES];
shuffleArray(pool);
console.log(pool[pool.length - 1].name);

let pool2 = [...COUNTRIES];
shuffleArray(pool2);
console.log(pool2[pool2.length - 1].name);

