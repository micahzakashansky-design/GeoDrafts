function extractBonusText(desc, cat) {
  if (!desc) return "";
  if (cat === "Population") {
    const match = desc.match(/([\d\.,]+)\s*(million|billion|k|m|b)?/i);
    if (match) {
      let numStr = match[1].replace(/,/g, '');
      let num = parseFloat(numStr);
      let unit = match[2] ? match[2].toLowerCase() : '';
      if (unit === 'billion' || unit === 'b') {
        return `${num}B ppl`;
      } else if (unit === 'million' || unit === 'm') {
        return `${num}M ppl`;
      } else {
        if (num >= 1000000) {
          return `${+(num/1000000).toFixed(1)}M ppl`;
        } else if (num >= 1000) {
          return `${+(num/1000).toFixed(1)}K ppl`;
        } else {
          return `${num} ppl`;
        }
      }
    }
  }
  const match = desc.match(/(\d+(?:,\d+)*(?:\.\d+)?[A-Z]?\s*(?:km²)?)/i);
  if (match) {
    return match[1].trim();
  }
  return "";
}

console.log(extractBonusText("334 million people; highly educated...", "Population"));
console.log(extractBonusText("1.4 billion people; world's largest...", "Population"));
console.log(extractBonusText("376,000 — Europe's most sparsely...", "Population"));
console.log(extractBonusText("13.2 million; remarkable post-conflict...", "Population"));
