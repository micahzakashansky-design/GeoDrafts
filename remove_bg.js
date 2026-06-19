const fs = require('fs');

let svg = fs.readFileSync('artifacts/country-draft/public/favicon.svg', 'utf8');

// The first path is the background. Let's find <path fill="#000000" ... </path> (if it has a closing tag)
// or <path ... />
// The file has:
// <path fill="#000000" opacity="1.000000" stroke="none" 
// 	d="
// M285...
// ...
// 	C... "/>

// Let's just remove the first <path ... /> completely.
const pathStart = svg.indexOf('<path fill="#000000"');
if (pathStart !== -1) {
  const pathEnd = svg.indexOf('/>', pathStart);
  if (pathEnd !== -1) {
    const newSvg = svg.slice(0, pathStart) + svg.slice(pathEnd + 2);
    fs.writeFileSync('artifacts/country-draft/public/favicon.svg', newSvg);
    console.log("Removed first path.");
  } else {
    console.log("Could not find end of first path.");
  }
} else {
  console.log("Could not find first path.");
}
