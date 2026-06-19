const fs = require('fs');

function fixSVG(filename) {
  let svg = fs.readFileSync(filename, 'utf8');

  // If the defs are before <svg, let's just remove them and re-insert properly
  const defsMatch = svg.match(/<defs>[\s\S]*?<g clip-path="url\(#circleClip\)">/);
  if (defsMatch) {
    svg = svg.replace(defsMatch[0], ''); // remove the broken one
  }
  
  // also remove the extra </g> at the end just in case so we can redo it cleanly
  svg = svg.replace('</g>\n</svg>', '</svg>');

  // Now find the <svg> tag
  const svgStartMatch = svg.match(/<svg[^>]+>/);
  if (svgStartMatch) {
    const insertPos = svgStartMatch.index + svgStartMatch[0].length;
    const clipPathDef = `
  <defs>
    <clipPath id="circleClip">
      <circle cx="250.5" cy="251.5" r="205.5" />
    </clipPath>
  </defs>
  <g clip-path="url(#circleClip)">
`;
    svg = svg.slice(0, insertPos) + clipPathDef + svg.slice(insertPos);
    svg = svg.replace('</svg>', '</g>\n</svg>');
    
    fs.writeFileSync(filename, svg);
    console.log(filename + " fixed XML structure!");
  }
}

fixSVG('artifacts/country-draft/public/favicon.svg');
fixSVG('artifacts/country-draft/public/logo.svg');
