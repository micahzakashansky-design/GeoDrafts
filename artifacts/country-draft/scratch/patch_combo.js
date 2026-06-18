const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace the flex-row isCombo block with a unified block if they are the same country,
  // and separate them if they are different!
  
  // Actually, we can just change displayCats to push Size and Population if they are different!
  content = content.replace(
    /if \(roster\.Size && roster\.Population\) \{ displayCats\.push\("Population Structure"(?: as any)?\); \}/,
    `if (roster.Size && roster.Population) { if (roster.Size.name === roster.Population.name) { displayCats.push("Population Structure" as any); } else { displayCats.push("Size" as any); displayCats.push("Population" as any); } }`
  );
  
  // Now if "Population Structure" is pushed, they ARE the same country!
  // Let's rewrite the isCombo block to be a unified card.
  
  // First, find the `if (isCombo && isWildcardTarget)` block and remove it?
  // No, if isWildcardTarget, they might want to click them separately to override.
  // Wait, if it's the same country, they are grouped as "Population Structure".
  // Can they click "Size" or "Population" separately to override?
  // In wildcard mode, they click the category. If it's a unified card, how do they click Size vs Population?
  // Ah! That's why `if (isCombo && isWildcardTarget)` renders them as TWO separate buttons!
  
  fs.writeFileSync(filePath, content);
}

['src/pages/normal/NormalUI.tsx', 'src/pages/daily/DailyUI.tsx', 'src/pages/sabotage/SabotageUI.tsx', 'src/pages/guess/GuessUI.tsx', 'src/pages/party/PartyUI.tsx', 'src/pages/double/DoubleUI.tsx'].forEach(patchFile);
