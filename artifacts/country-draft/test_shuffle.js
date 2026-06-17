import fs from 'fs';
// get the code
let code = fs.readFileSync('src/data/countries.ts', 'utf8');
// regex extract the function
let match = code.match(/export function shuffleArray[\s\S]*?\n\}/);
if (match) {
  let funcBody = match[0].replace('export function shuffleArray<T>(array: T[]): T[]', 'function shuffleArray(array)');
  eval(funcBody);
  let arr = [1,2,3,4,5,6,7,8,9,10];
  shuffleArray(arr);
  console.log(arr);
}
