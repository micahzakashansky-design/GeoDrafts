import fs from "fs";

const files = [
  "src/pages/normal/NormalGame.tsx",
  "src/pages/guess/GuessGame.tsx",
  "src/pages/double/DoubleDraftGame.tsx",
  "src/pages/double/DoubleDraftMultiplayer.tsx",
  "src/pages/party/PartyGame.tsx",
  "src/pages/sabotage/SabotageGame.tsx",
  "src/pages/associations/AssociationsGame.tsx",
  "src/pages/associations/AssociationsRace.tsx",
  "src/pages/daily/DailyGame.tsx",
  "src/pages/Lobby.tsx",
  "src/pages/associations/AssociationsSetup.tsx",
  "src/pages/Leaderboard.tsx"
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, "utf8");
  
  if (content.includes("<SettingsButton />")) continue;

  // 1. Add import
  // Find the last import statement
  const importMatch = [...content.matchAll(/import .* from .*/g)].pop();
  if (importMatch) {
    const insertPos = importMatch.index + importMatch[0].length;
    content = content.substring(0, insertPos) + '\nimport { SettingsButton } from "@/components/SettingsButton";' + content.substring(insertPos);
  }

  // 2. Add to header
  // Find </header> and insert <SettingsButton /> right before it
  // But some headers might already have other elements on the right side.
  // Wait, let's see if they have other elements.
  // Most headers end with something like:
  //      </div>
  //    </header>
  // We can do:
  // content = content.replace("</header>", "  <SettingsButton />\n      </header>");

  content = content.replace(/<\/header>/, "  <div className=\"flex items-center gap-3\">\n          <SettingsButton />\n        </div>\n      </header>");

  fs.writeFileSync(file, content, "utf8");
}
console.log("Done");
