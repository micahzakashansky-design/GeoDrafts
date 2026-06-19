const fs = require('fs');

function processSVG(filename) {
  let svg = fs.readFileSync(filename, 'utf8');

  // Replace viewBox
  svg = svg.replace(/viewBox="[^"]+"/, 'viewBox="45 45 411 413"');

  // Check if clipPath already exists
  if (!svg.includes('clipPath id="circleClip"')) {
    const svgEnd = svg.indexOf('>');
    if (svgEnd !== -1) {
      const clipPathDef = `
  <defs>
    <clipPath id="circleClip">
      <circle cx="250.5" cy="251.5" r="205.5" />
    </clipPath>
  </defs>
  <g clip-path="url(#circleClip)">
`;
      svg = svg.slice(0, svgEnd + 1) + clipPathDef + svg.slice(svgEnd + 1);
      svg = svg.replace('</svg>', '</g>\n</svg>');
    }
  }

  fs.writeFileSync(filename, svg);
  console.log(filename + " fixed!");
}

processSVG('artifacts/country-draft/public/favicon.svg');
processSVG('artifacts/country-draft/public/logo.svg');
