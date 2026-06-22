import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/associations/AssociationsSetup.tsx', 'utf8');

// The original checkbox mapping:
// {TASK_TYPES.map(task => (
//   <label key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-foreground/10 cursor-pointer transition-colors">
//     <Checkbox 
//       checked={selectedTasks.includes(task.id)}
//       onCheckedChange={() => toggleTask(task.id)}
//     />
//     <div className="p-1 rounded bg-foreground/10/80">
//       {task.icon}
//     </div>
//     <span className="text-sm font-medium">{task.label}</span>
//   </label>
// ))}

const replacementTasks = `{TASK_TYPES.map(task => {
                const isActive = selectedTasks.includes(task.id);
                return (
                  <motion.button
                    key={task.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    onClick={() => toggleTask(task.id)}
                    className={\`w-full flex items-center gap-5 p-5 rounded-2xl border transition-colors text-left \${
                      isActive
                        ? "border-primary/50 bg-primary/10"
                        : "border-border bg-card hover:bg-muted/50"
                    }\`}
                  >
                    <div className={\`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 \${isActive ? "bg-primary/20 text-primary" : "bg-foreground/10 text-muted-foreground"}\`}>
                      {task.icon}
                    </div>
                    <div>
                      <div className={\`font-black text-xl tracking-tight \${isActive ? "text-foreground" : "text-foreground/80"}\`}>{task.label}</div>
                      <div className="text-sm font-medium text-muted-foreground mt-1">Included in test</div>
                    </div>
                    <div className={\`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 \${isActive ? "border-primary" : "border-border"}\`}>
                      {isActive && (
                        <motion.div layoutId={\`\${task.id}-dot\`} className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                  </motion.button>
                );
              })}`;

const regexTasks = /\{TASK_TYPES\.map\(task => \([\s\S]*?<\/label>\n\s*\)\)\}/;
content = content.replace(regexTasks, replacementTasks);

// The original regions mapping:
// {countriesByRegion.map(([region, countries]) => {
//   const allSelected = countries.every(c => selectedCountries.includes(c.name));
//   const someSelected = countries.some(c => selectedCountries.includes(c.name));
//   return (
//     <div key={region} className="border border-border rounded-lg overflow-hidden">
//       <div className="flex items-center gap-3 p-3 bg-foreground/5 cursor-pointer hover:bg-foreground/10 transition-colors" onClick={() => toggleRegion(region, countries)}>
//         <Checkbox 
//           checked={allSelected}
//           className={someSelected && !allSelected ? "opacity-50" : ""}
//         />
//         <span className="font-bold">{region} <span className="text-muted-foreground text-sm font-normal">({countries.length} countries)</span></span>
//       </div>
//       <div className="p-3 grid grid-cols-2 gap-2 bg-background max-h-48 overflow-y-auto">
//         {countries.map(c => (
//           <label key={c.name} className="flex items-center gap-2 p-1.5 rounded hover:bg-foreground/5 cursor-pointer transition-colors">
//             <Checkbox 
//               checked={selectedCountries.includes(c.name)}
//               onCheckedChange={() => toggleCountry(c.name)}
//             />
//             <span className="text-sm truncate">{c.flag} {c.name}</span>
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// })}

const replacementRegions = `{countriesByRegion.map(([region, countries]) => {
                const allSelected = countries.every(c => selectedCountries.includes(c.name));
                const someSelected = countries.some(c => selectedCountries.includes(c.name));
                return (
                  <div key={region} className="border border-border rounded-2xl overflow-hidden bg-card">
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleRegion(region, countries)}
                      className={\`flex items-center gap-4 p-5 cursor-pointer transition-colors \${allSelected ? "bg-primary/5" : "hover:bg-muted/50"}\`}
                    >
                      <div className={\`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 \${allSelected ? "border-primary bg-primary text-primary-foreground" : someSelected ? "border-primary/50 bg-primary/20" : "border-border"}\`}>
                        {allSelected && <CheckCircle2 className="w-4 h-4" />}
                        {someSelected && !allSelected && <div className="w-3 h-0.5 bg-primary rounded-full" />}
                      </div>
                      <div className="font-black text-xl tracking-tight text-foreground">{region}</div>
                      <div className="text-sm font-medium text-muted-foreground ml-auto">{countries.length} countries</div>
                    </motion.div>
                    <div className="p-4 grid grid-cols-2 gap-2 bg-background max-h-48 overflow-y-auto border-t border-border">
                      {countries.map(c => {
                        const isCountrySelected = selectedCountries.includes(c.name);
                        return (
                          <motion.label 
                            key={c.name} 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={\`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors \${isCountrySelected ? "bg-primary/10" : "hover:bg-muted"}\`}
                          >
                            <Checkbox 
                              checked={isCountrySelected}
                              onCheckedChange={() => toggleCountry(c.name)}
                              className="hidden"
                            />
                            <div className={\`w-5 h-5 rounded border flex items-center justify-center shrink-0 \${isCountrySelected ? "border-primary bg-primary text-primary-foreground" : "border-border"}\`}>
                              {isCountrySelected && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <span className="text-sm font-medium truncate">{c.flag} {c.name}</span>
                          </motion.label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}`;

const regexRegions = /\{countriesByRegion\.map\(\(\[region, countries\]\) => \{[\s\S]*?<\/div>\n\s*\);\n\s*\}\)\}/;
content = content.replace(regexRegions, replacementRegions);

// Replace "Start Game" button styling
const startBtnRegex = /<Button \n\s*onClick=\{startGame\}\n\s*disabled=\{selectedTasks\.length === 0 \|\| selectedCountries\.length === 0\}\n\s*className="w-full h-14 text-lg font-bold"\n\s*>\n\s*Start Game\n\s*<\/Button>/;

const startBtnNew = `<motion.button
            whileHover={selectedTasks.length > 0 && selectedCountries.length > 0 ? { scale: 1.02, backgroundColor: "#ffffff" } : {}}
            whileTap={selectedTasks.length > 0 && selectedCountries.length > 0 ? { scale: 0.98 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={startGame}
            disabled={selectedTasks.length === 0 || selectedCountries.length === 0}
            className="w-full py-5 rounded-2xl bg-white/90 text-black font-black text-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] disabled:opacity-30 disabled:shadow-none uppercase tracking-widest mt-8"
          >
            Start Game
          </motion.button>`;
          
content = content.replace(startBtnRegex, startBtnNew);

writeFileSync('src/pages/associations/AssociationsSetup.tsx', content);

