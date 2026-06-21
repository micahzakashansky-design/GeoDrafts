const fs = require('fs');

let content = fs.readFileSync('src/pages/double/DoubleUI.tsx', 'utf8');

const oldSelectionPhase = `export function SelectionPhase({ options, onPick, isHardMode, mode }: { options: Country[]; onPick: (c: Country) => void; isHardMode: boolean; mode: string; }) {
  return (
    <div className="p-6 flex flex-col gap-6 items-center justify-start flex-1 overflow-y-auto w-full">
      <div className="text-center"><h2 className="text-3xl font-sans font-bold mb-1 text-white">{mode === "sabotage" ? "Sabotage Choice" : "Double Draft Choice"}</h2><p className="text-white/40 text-sm">{mode === "sabotage" ? "Pick a country for your opponent to use." : "Choose which country to add to your roster."}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {options.map((country, idx) => (
          <motion.div 
            key={country.name + idx} 
            whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }} 
            onClick={() => onPick(country)} 
            className="bg-[#000000] border border-white/10 rounded-2xl overflow-hidden shadow-xl text-left group cursor-pointer"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="p-8 border-b border-white/10 bg-white/5 flex flex-col items-center text-center"><div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{country.flag}</div><h3 className="text-2xl font-sans font-bold text-white">{country.name}</h3><p className="text-xs text-white/40 uppercase tracking-widest mt-1">{country.region}</p></div>
            <div className="p-5 space-y-4">
               <ExpandableDescription description={country.knownFor} />
               {!isHardMode && (() => {
                 const threeStars = ["Military", "Economy", "Government"] as Category[];
                 const twoStars = ["International Relationships", "Technology", "Education", "Natural Resources", "Healthcare"] as Category[];
                 const oneStars = ["Location", "Size", "Population", "Culture", "Climate", "History", "Tourism"] as Category[];
                 const avg3 = Math.round(threeStars.reduce((acc, cat) => acc + (country.stats[getCategoryKey(cat)].score ?? 0), 0) / threeStars.length);
                 const avg2 = Math.round(twoStars.reduce((acc, cat) => acc + (country.stats[getCategoryKey(cat)].score ?? 0), 0) / twoStars.length);
                 const avg1 = Math.round(oneStars.reduce((acc, cat) => acc + (country.stats[getCategoryKey(cat)].score ?? 0), 0) / oneStars.length);
                 return (
                   <div className="grid grid-cols-3 gap-2">
                     <div className="text-center p-2 rounded-lg bg-white/5 border border-white/10"><div className="text-[9px] uppercase font-bold text-white/40">3-Star Avg</div><div className="text-sm font-bold text-white">{avg3}/15</div></div>
                     <div className="text-center p-2 rounded-lg bg-white/5 border border-white/10"><div className="text-[9px] uppercase font-bold text-white/40">2-Star Avg</div><div className="text-sm font-bold text-white">{avg2}/12</div></div>
                     <div className="text-center p-2 rounded-lg bg-white/5 border border-white/10"><div className="text-[9px] uppercase font-bold text-white/40">1-Star Avg</div><div className="text-sm font-bold text-white">{avg1}/10</div></div>
                   </div>
                 );
               })()}
               <div className="mt-auto pt-4"><div className="w-full py-2.5 rounded-xl bg-white/10 text-white text-center font-bold text-sm group-hover:bg-white group-hover:text-black transition-colors border border-white/20">{mode === "sabotage" ? \`Give \${country.name}\` : \`Pick \${country.name}\`}</div></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}`;

const newSelectionPhase = `export function SelectionPhase({ options, onPick, isHardMode, mode, targetCategory }: { options: Country[]; onPick: (c: Country) => void; isHardMode: boolean; mode: string; targetCategory?: Category | null; }) {
  return (
    <div className="p-6 flex flex-col gap-6 items-center justify-start flex-1 overflow-y-auto w-full">
      <div className="text-center"><h2 className="text-3xl font-sans font-bold mb-1 text-white">{targetCategory ? "Wildcard Replacement" : mode === "sabotage" ? "Sabotage Choice" : "Double Draft Choice"}</h2><p className="text-white/40 text-sm">{targetCategory ? \`Choose a country to replace your \${targetCategory} slot.\` : mode === "sabotage" ? "Pick a country for your opponent to use." : "Choose which country to add to your roster."}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {options.map((country, idx) => (
          <motion.div 
            key={country.name + idx} 
            whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }} 
            onClick={() => onPick(country)} 
            className="bg-[#000000] border border-white/10 rounded-2xl overflow-hidden shadow-xl text-left group cursor-pointer"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="p-8 border-b border-white/10 bg-white/5 flex flex-col items-center text-center"><div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{country.flag}</div><h3 className="text-2xl font-sans font-bold text-white">{country.name}</h3><p className="text-xs text-white/40 uppercase tracking-widest mt-1">{country.region}</p></div>
            <div className="p-5 space-y-4">
               <ExpandableDescription description={country.knownFor} />
               {!isHardMode && (() => {
                 if (targetCategory) {
                    const stat = country.stats[getCategoryKey(targetCategory)];
                    if (!stat) return null;
                    return (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-white/40">
                          {CATEGORY_ICONS[targetCategory]}
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{targetCategory}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-white text-sm">{extractBonusText(stat.description, targetCategory)}</div>
                        </div>
                        <p className="text-[10px] text-white/40/80 leading-relaxed italic line-clamp-3">"{stat.description}"</p>
                      </div>
                    );
                 }
                 const threeStars = ["Military", "Economy", "Government"] as Category[];
                 const twoStars = ["International Relationships", "Technology", "Education", "Natural Resources", "Healthcare"] as Category[];
                 const oneStars = ["Location", "Size", "Population", "Culture", "Climate", "History", "Tourism"] as Category[];
                 const avg3 = Math.round(threeStars.reduce((acc, cat) => acc + (country.stats[getCategoryKey(cat)].score ?? 0), 0) / threeStars.length);
                 const avg2 = Math.round(twoStars.reduce((acc, cat) => acc + (country.stats[getCategoryKey(cat)].score ?? 0), 0) / twoStars.length);
                 const avg1 = Math.round(oneStars.reduce((acc, cat) => acc + (country.stats[getCategoryKey(cat)].score ?? 0), 0) / oneStars.length);
                 return (
                   <div className="grid grid-cols-3 gap-2">
                     <div className="text-center p-2 rounded-lg bg-white/5 border border-white/10"><div className="text-[9px] uppercase font-bold text-white/40">3-Star Avg</div><div className="text-sm font-bold text-white">{avg3}/15</div></div>
                     <div className="text-center p-2 rounded-lg bg-white/5 border border-white/10"><div className="text-[9px] uppercase font-bold text-white/40">2-Star Avg</div><div className="text-sm font-bold text-white">{avg2}/12</div></div>
                     <div className="text-center p-2 rounded-lg bg-white/5 border border-white/10"><div className="text-[9px] uppercase font-bold text-white/40">1-Star Avg</div><div className="text-sm font-bold text-white">{avg1}/10</div></div>
                   </div>
                 );
               })()}
               <div className="mt-auto pt-4"><div className="w-full py-2.5 rounded-xl bg-white/10 text-white text-center font-bold text-sm group-hover:bg-white group-hover:text-black transition-colors border border-white/20">{mode === "sabotage" ? \`Give \${country.name}\` : \`Pick \${country.name}\`}</div></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}`;

content = content.replace(oldSelectionPhase, newSelectionPhase);
fs.writeFileSync('src/pages/double/DoubleUI.tsx', content);
console.log("Updated SelectionPhase!");
