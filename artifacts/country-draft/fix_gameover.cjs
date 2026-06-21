const fs = require('fs');
let content = fs.readFileSync('src/pages/double/DoubleUI.tsx', 'utf8');

const oldGameOverDef = `export function GameOver({ roster, totalScore, bonus, onReset, onDownload, onWildcard, onWildcardSelect, setWildcardPhase, wildcardUsed, wildcardPhase, rosterRef, isHardMode, isDailyMode, onSubmitLeaderboard, gameMode, leaderboardSubmitted, room, players }: { roster: Partial<Record<Category, Country>>; totalScore: number; bonus: number; onReset: () => void; onDownload: () => void; onWildcard: () => void; onWildcardSelect: (cat: Category) => void; wildcardUsed: boolean; wildcardPhase: boolean; setWildcardPhase: (val: boolean) => void; rosterRef: React.RefObject<HTMLDivElement | null>; isHardMode: boolean; isDailyMode: boolean; onSubmitLeaderboard: () => void; gameMode: string; leaderboardSubmitted: boolean; room?: any | null; players?: any[]; }) {
  const rating = getRating(totalScore); const archetype = getCountryArchetype(roster); const bPath = getBonusPath(roster); const isGuest = room && gameMode === "sabotage" && players;
  const isMultiplayerGame = gameMode === "sabotage" || gameMode === "party";
  return (
    <div className="p-4 md:p-8 flex-1 overflow-y-auto" ref={rosterRef}>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">`;

const newGameOverDef = `export function GameOver({ roster, totalScore, bonus, onReset, onDownload, onWildcard, onWildcardSelect, setWildcardPhase, wildcardUsed, wildcardPhase, rosterRef, isHardMode, isDailyMode, onSubmitLeaderboard, gameMode, leaderboardSubmitted, room, players, wildcardOptions, wildcardTargetCategory, onResolveWildcard }: { roster: Partial<Record<Category, Country>>; totalScore: number; bonus: number; onReset: () => void; onDownload: () => void; onWildcard: () => void; onWildcardSelect: (cat: Category) => void; wildcardUsed: boolean; wildcardPhase: boolean; setWildcardPhase: (val: boolean) => void; rosterRef: React.RefObject<HTMLDivElement | null>; isHardMode: boolean; isDailyMode: boolean; onSubmitLeaderboard: () => void; gameMode: string; leaderboardSubmitted: boolean; room?: any | null; players?: any[]; wildcardOptions?: Country[] | null; wildcardTargetCategory?: Category | null; onResolveWildcard?: (c: Country) => void; }) {
  const rating = getRating(totalScore); const archetype = getCountryArchetype(roster); const bPath = getBonusPath(roster); const isGuest = room && gameMode === "sabotage" && players;
  const isMultiplayerGame = gameMode === "sabotage" || gameMode === "party";

  if (wildcardOptions && wildcardTargetCategory && onResolveWildcard) {
    return (
      <div className="p-4 md:p-8 flex-1 overflow-y-auto w-full h-full" ref={rosterRef}>
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20 h-full flex flex-col">
          <SelectionPhase 
            options={wildcardOptions} 
            onPick={onResolveWildcard} 
            isHardMode={isHardMode} 
            mode="double" 
            targetCategory={wildcardTargetCategory} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex-1 overflow-y-auto" ref={rosterRef}>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">`;

content = content.replace(oldGameOverDef, newGameOverDef);
fs.writeFileSync('src/pages/double/DoubleUI.tsx', content);
console.log("Updated GameOver!");
