const fs = require('fs');

function addViewBox(filename) {
  let svg = fs.readFileSync(filename, 'utf8');
  
  // Find <svg ... >
  const svgMatch = svg.match(/<svg[^>]+>/);
  if (svgMatch) {
    let svgTag = svgMatch[0];
    if (!svgTag.includes('viewBox')) {
      svgTag = svgTag.replace('>', ' viewBox="45 45 411 413">');
      svg = svg.replace(svgMatch[0], svgTag);
      fs.writeFileSync(filename, svg);
      console.log(filename + " added viewBox!");
    } else {
      // replace existing viewBox
      svgTag = svgTag.replace(/viewBox="[^"]+"/, 'viewBox="45 45 411 413"');
      svg = svg.replace(svgMatch[0], svgTag);
      fs.writeFileSync(filename, svg);
      console.log(filename + " updated viewBox!");
    }
  }
}

addViewBox('artifacts/country-draft/public/favicon.svg');
addViewBox('artifacts/country-draft/public/logo.svg');
