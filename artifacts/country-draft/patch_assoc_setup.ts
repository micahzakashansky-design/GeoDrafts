import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/associations/AssociationsSetup.tsx', 'utf8');

// Replace tasks
const tasksRegex = /\{TASK_TYPES\.map\(task => \{[\s\S]*?\}\)\}/;

const tasksNew = `{TASK_TYPES.map(task => {
                const isActive = selectedTasks.includes(task.id);
                return (
                  <label
                    key={task.id}
                    className={\`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors \${
                      isActive
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-card hover:bg-muted/50"
                    }\`}
                  >
                    <Checkbox
                      checked={isActive}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <div className="p-1.5 rounded-md bg-foreground/5 text-foreground shrink-0">
                      {task.icon}
                    </div>
                    <span className={\`text-sm font-bold \${isActive ? "text-foreground" : "text-foreground/80"}\`}>{task.label}</span>
                  </label>
                );
              })}`;

content = content.replace(tasksRegex, tasksNew);

// Replace regions
const regionsRegex = /\{countriesByRegion\.map\(\(\[region, countries\]\) => \{[\s\S]*?<\/div>\n\s*\);\n\s*\}\)\}/;

const regionsNew = `{countriesByRegion.map(([region, countries]) => {
                const selectedCount = countries.filter(c => selectedCountries.includes(c.name)).length;
                const allSelected = selectedCount === countries.length;
                const someSelected = selectedCount > 0;
                return (
                  <div key={region} className="border border-border rounded-xl overflow-hidden bg-card flex items-stretch">
                    <div className="px-5 cursor-pointer flex items-center justify-center hover:bg-muted/50 transition-colors border-r border-border" onClick={() => toggleRegion(region, countries)}>
                      <Checkbox checked={allSelected ? true : someSelected ? "indeterminate" : false} />
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex-1 flex items-center p-4 text-left hover:bg-muted/50 transition-colors">
                          <div className="font-bold text-lg">{region}</div>
                          <div className="text-sm font-medium text-muted-foreground ml-auto">
                            {selectedCount} / {countries.length}
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[85vh] flex flex-col sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black">{region}</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-2">
                          {countries.map(c => {
                            const isCountrySelected = selectedCountries.includes(c.name);
                            return (
                              <label 
                                key={c.name} 
                                className={\`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors \${isCountrySelected ? "bg-primary/5 border border-primary/20" : "hover:bg-muted border border-transparent"}\`}
                              >
                                <Checkbox 
                                  checked={isCountrySelected}
                                  onCheckedChange={() => toggleCountry(c.name)}
                                />
                                <span className="text-base font-bold">{c.flag} {c.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              })}`;

content = content.replace(regionsRegex, regionsNew);

writeFileSync('src/pages/associations/AssociationsSetup.tsx', content);

