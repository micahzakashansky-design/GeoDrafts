import React, { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ALL_COUNTRIES as COUNTRIES, Country } from "@/data/countries";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Flag, Map as MapIcon, Globe, HelpCircle, CheckCircle2, Brain, Settings2, X } from "lucide-react";
import { motion } from "framer-motion";

export const TASK_TYPES = [
  { id: "identify_from_flag", label: "Identify from flag", desc: "See a flag, name the country", icon: <Flag className="w-5 h-5" /> },
  { id: "identify_from_map", label: "Identify from map", desc: "See a highlighted map, name it", icon: <MapIcon className="w-5 h-5" /> },
  { id: "click_on_map", label: "Click on map", desc: "Find the named country on the globe", icon: <Globe className="w-5 h-5" /> },
  { id: "find_flag", label: "Find the flag", desc: "Pick the correct flag out of 9", icon: <HelpCircle className="w-5 h-5" /> },
  { id: "identify_capital", label: "Identify capital", desc: "Name the capital of the country", icon: <CheckCircle2 className="w-5 h-5" /> },
  { id: "identify_country_from_capital", label: "Identify country from capital", desc: "Name the country for the capital", icon: <Brain className="w-5 h-5" /> },
];

interface Props {
  initialTasks?: string[];
  initialCountries?: string[];
  onSave: (tasks: string[], countries: string[]) => void;
  disabled?: boolean;
}

export function AssociationsConfigModal({ initialTasks, initialCountries, onSave, disabled }: Props) {
  const [open, setOpen] = useState(false);
  
  // Local state for the modal forms
  const [selectedTasks, setSelectedTasks] = useState<string[]>(initialTasks || TASK_TYPES.map(t => t.id));
  const [selectedCountries, setSelectedCountries] = useState<string[]>(initialCountries || COUNTRIES.map(c => c.name));
  
  // Local state for inner region dialog
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  // Sync with props when opened
  useEffect(() => {
    if (open) {
      if (initialTasks) setSelectedTasks(initialTasks);
      if (initialCountries) setSelectedCountries(initialCountries);
    }
  }, [open, initialTasks, initialCountries]);

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) ? prev.filter(t => t !== taskId) : [...prev, taskId]
    );
  };

  const toggleCountry = (countryName: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryName) ? prev.filter(c => c !== countryName) : [...prev, countryName]
    );
  };

  const countriesByRegion = useMemo(() => {
    const map = new Map<string, Country[]>();
    for (const c of COUNTRIES) {
      if (!map.has(c.region)) map.set(c.region, []);
      map.get(c.region)!.push(c);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const toggleRegion = (regionCountries: Country[]) => {
    const regionCountryNames = regionCountries.map(c => c.name);
    const selectedInRegion = regionCountryNames.filter(name => selectedCountries.includes(name));
    
    if (selectedInRegion.length === regionCountries.length) {
      // Deselect all in region
      setSelectedCountries(prev => prev.filter(c => !regionCountryNames.includes(c)));
    } else {
      // Select all in region
      setSelectedCountries(prev => {
        const next = new Set(prev);
        for (const name of regionCountryNames) next.add(name);
        return Array.from(next);
      });
    }
  };

  const handleSave = () => {
    if (selectedTasks.length > 0 && selectedCountries.length > 0) {
      onSave(selectedTasks, selectedCountries);
      setOpen(false);
    }
  };

  const activeRegionCountries = activeRegion ? countriesByRegion.find(r => r[0] === activeRegion)?.[1] : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button disabled={disabled} className="w-full flex items-center justify-between p-4 rounded-[1.25rem] bg-card border border-border shadow-sm hover:bg-muted/50 transition-colors disabled:opacity-50 group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-colors group-hover:bg-primary/20">
              <Settings2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-foreground">Configure Associations</h4>
              <p className="text-xs font-medium text-muted-foreground">{initialTasks?.length || 0} tasks • {initialCountries?.length || 0} countries</p>
            </div>
          </div>
          <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg transition-colors group-hover:bg-primary/20">Edit</div>
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-none rounded-[2rem] shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-border/50 shrink-0 bg-background flex items-center justify-between z-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-foreground">Configure Associations</h1>
            <p className="text-muted-foreground font-medium mt-1">Select the tasks and countries for this race.</p>
          </div>
          <button 
            onClick={() => setOpen(false)}
            className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center text-foreground hover:bg-foreground/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-background/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Tasks Column */}
            <div className="space-y-6">
              <div className="flex items-end justify-between mb-2">
                <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
                <span className="text-sm font-bold text-muted-foreground bg-foreground/5 px-3 py-1 rounded-full">
                  {selectedTasks.length} / {TASK_TYPES.length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {TASK_TYPES.map(task => {
                  const isActive = selectedTasks.includes(task.id);
                  return (
                    <motion.button
                      key={task.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleTask(task.id)}
                      className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-colors text-left ${
                        isActive
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:bg-muted/50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? "bg-primary/20 text-primary" : "bg-foreground/5 text-muted-foreground"}`}>
                        {task.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`font-black text-base tracking-tight ${isActive ? "text-foreground" : "text-foreground/80"}`}>{task.label}</div>
                        <div className="text-[11px] font-medium text-muted-foreground mt-0.5">{task.desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                        {isActive && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              {selectedTasks.length === 0 && (
                <p className="text-sm font-bold text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">Please select at least one task to proceed.</p>
              )}
            </div>

            {/* Countries Column */}
            <div className="space-y-6">
              <div className="flex items-end justify-between mb-2">
                <h2 className="text-2xl font-bold tracking-tight">Regions</h2>
                <span className="text-sm font-bold text-muted-foreground bg-foreground/5 px-3 py-1 rounded-full">
                  {selectedCountries.length} / {COUNTRIES.length}
                </span>
              </div>
              
              <div className="flex flex-col gap-3">
                {countriesByRegion.map(([region, regionCountries]) => {
                  const selectedCount = regionCountries.filter(c => selectedCountries.includes(c.name)).length;
                  const allSelected = selectedCount === regionCountries.length;
                  
                  return (
                    <motion.div 
                      key={region}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-stretch rounded-2xl border transition-colors overflow-hidden ${
                        allSelected ? "border-primary/50 bg-primary/5 shadow-sm" : 
                        selectedCount > 0 ? "border-foreground/20 bg-card" : 
                        "border-border bg-card"
                      }`}
                    >
                      {/* Left: Checkbox Zone */}
                      <div 
                        className="p-5 flex items-center justify-center cursor-pointer hover:bg-foreground/5 transition-colors border-r border-border/50 shrink-0"
                        onClick={() => toggleRegion(regionCountries)}
                      >
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          allSelected ? "border-primary bg-primary text-primary-foreground" : 
                          selectedCount > 0 ? "border-primary bg-primary/20 text-primary" : 
                          "border-border"
                        }`}>
                          {allSelected ? <CheckCircle2 className="w-4 h-4" /> : selectedCount > 0 ? <div className="w-2.5 h-2.5 rounded-sm bg-primary" /> : null}
                        </div>
                      </div>
                      
                      {/* Right: Edit Zone */}
                      <button 
                        onClick={() => setActiveRegion(region)}
                        className="flex-1 p-5 flex items-center justify-between text-left hover:bg-foreground/5 transition-colors group"
                      >
                        <div>
                          <h3 className="font-black text-lg tracking-tight">{region}</h3>
                          <div className="font-mono text-sm font-bold tracking-tighter opacity-80 mt-0.5">
                            {selectedCount} <span className="text-xs text-muted-foreground font-sans uppercase tracking-widest ml-1">/ {regionCountries.length} selected</span>
                          </div>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                          Edit
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
              {selectedCountries.length === 0 && (
                <p className="text-sm font-bold text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">Please select at least one country to proceed.</p>
              )}
            </div>
            
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-border/50 shrink-0 bg-background flex justify-end gap-3 z-10">
           <Button 
             variant="ghost"
             size="lg"
             onClick={() => setOpen(false)}
             className="px-6 font-bold rounded-xl"
           >
             Cancel
           </Button>
           <Button 
             size="lg" 
             onClick={handleSave} 
             disabled={selectedTasks.length === 0 || selectedCountries.length === 0}
             className="px-8 font-black rounded-xl tracking-wide text-primary-foreground"
           >
             Save Configuration
           </Button>
        </div>
      </DialogContent>

      {/* Inner Dialog for Specific Region Edit */}
      <Dialog open={activeRegion !== null} onOpenChange={(open) => !open && setActiveRegion(null)}>
        <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden bg-background border-none rounded-[2rem] shadow-2xl">
          {activeRegionCountries && (
            <>
              <div className="p-6 border-b border-border/50 bg-background shrink-0 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter">{activeRegion}</h2>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    {activeRegionCountries.filter(c => selectedCountries.includes(c.name)).length} of {activeRegionCountries.length} selected
                  </p>
                </div>
                <button 
                  onClick={() => setActiveRegion(null)}
                  className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground hover:bg-foreground/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-background/50 grid gap-2">
                {activeRegionCountries.map(c => {
                  const isCountrySelected = selectedCountries.includes(c.name);
                  return (
                    <label 
                      key={c.name} 
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors ${
                        isCountrySelected ? "bg-primary/5 border border-primary/20 shadow-sm" : "bg-card border border-border/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${isCountrySelected ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                        {isCountrySelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className="text-lg font-bold tracking-tight">{c.flag} {c.name}</span>
                    </label>
                  );
                })}
              </div>
              <div className="p-4 border-t border-border/50 bg-background shrink-0 z-10">
                <Button className="w-full font-bold rounded-xl" size="lg" onClick={() => setActiveRegion(null)}>Done</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
