const fs = require('fs');

let svg = fs.readFileSync('artifacts/country-draft/public/icon.svg', 'utf8');

// Insert the clipPath right after the <svg ...> opening tag
const svgEnd = svg.indexOf('>');
if (svgEnd !== -1) {
  const clipPathDef = `
  <defs>
    <clipPath id="circleClip">
      <circle cx="250" cy="250" r="215" />
    </clipPath>
  </defs>
  <g clip-path="url(#circleClip)">
`;
  
  // Replace the closing </svg> with </g></svg>
  let newSvg = svg.slice(0, svgEnd + 1) + clipPathDef + svg.slice(svgEnd + 1);
  newSvg = newSvg.replace('</svg>', '</g>\n</svg>');
  
  fs.writeFileSync('artifacts/country-draft/public/icon.svg', newSvg);
  console.log("SVG rounded with clipPath!");
} else {
  console.log("Could not parse SVG.");
}
