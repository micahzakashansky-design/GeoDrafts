import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { COUNTRIES, Country } from "@/data/countries";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Flag, Map as MapIcon, Globe, Brain, HelpCircle, CheckCircle2 } from "lucide-react";

export const TASK_TYPES = [
  { id: "identify_from_flag", label: "Identify a country from its flag", icon: <Flag className="w-4 h-4 text-red-400" /> },
  { id: "identify_from_map", label: "Identify a country from its map highlight", icon: <MapIcon className="w-4 h-4 text-blue-400" /> },
  { id: "click_on_map", label: "Click on a country on a world map", icon: <Globe className="w-4 h-4 text-green-400" /> },
  { id: "find_flag", label: "Find the country's flag (out of 9)", icon: <HelpCircle className="w-4 h-4 text-purple-400" /> },
  { id: "identify_capital", label: "Identify a country's capital", icon: <CheckCircle2 className="w-4 h-4 text-amber-400" /> },
  { id: "identify_country_from_capital", label: "Identify a country given its capital", icon: <Brain className="w-4 h-4 text-pink-400" /> },
];

export function AssociationsSetup() {
  const [, setLocation] = useLocation();

  const [selectedTasks, setSelectedTasks] = useState<string[]>(TASK_TYPES.map(t => t.id));
  const [selectedCountries, setSelectedCountries] = useState<string[]>(COUNTRIES.map(c => c.name));

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) ? prev.filter(t => t !== taskId) : [...prev, taskId]
    );
  };

  const countriesByRegion = useMemo(() => {
    const map = new Map<string, Country[]>();
    COUNTRIES.forEach(c => {
      if (!map.has(c.region)) map.set(c.region, []);
      map.get(c.region)!.push(c);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])) as [string, Country[]][];
  }, []);

  const toggleCountry = (countryName: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryName) ? prev.filter(n => n !== countryName) : [...prev, countryName]
    );
  };

  const toggleRegion = (region: string, countries: Country[]) => {
    const allSelected = countries.every(c => selectedCountries.includes(c.name));
    if (allSelected) {
      setSelectedCountries(prev => prev.filter(name => !countries.find(c => c.name === name)));
    } else {
      setSelectedCountries(prev => {
        const next = new Set(prev);
        countries.forEach(c => next.add(c.name));
        return Array.from(next);
      });
    }
  };

  const startGame = () => {
    if (selectedTasks.length === 0 || selectedCountries.length === 0) return;
    
    // Store configuration in sessionStorage to pass it to the game component
    sessionStorage.setItem("associations_tasks", JSON.stringify(selectedTasks));
    sessionStorage.setItem("associations_countries", JSON.stringify(selectedCountries));
    
    setLocation("/game/associations");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pt-12 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8 pb-32">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-serif tracking-tight">Associations Mode</h1>
            <p className="text-muted-foreground">Test your knowledge across different association tasks.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">1. Select Tasks</h2>
            <div className="space-y-2 bg-card border border-border rounded-xl p-4">
              {TASK_TYPES.map(task => (
                <label key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
                  <Checkbox 
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div className="p-1 rounded bg-secondary/80">
                    {task.icon}
                  </div>
                  <span className="text-sm font-medium">{task.label}</span>
                </label>
              ))}
            </div>
            {selectedTasks.length === 0 && (
              <p className="text-sm text-red-400">Please select at least one task.</p>
            )}
          </div>

          {/* Countries Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">2. Select Countries</h2>
              <span className="text-sm text-muted-foreground">{selectedCountries.length} / {COUNTRIES.length} selected</span>
            </div>
            
            <div className="space-y-4">
              {countriesByRegion.map(([region, countries]) => {
                const allSelected = countries.every(c => selectedCountries.includes(c.name));
                const someSelected = countries.some(c => selectedCountries.includes(c.name));
                
                return (
                  <div key={region} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-3 bg-secondary/30 border-b border-border flex justify-between items-center">
                      <div className="font-bold">{region}</div>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => toggleRegion(region, countries)}
                      >
                        {allSelected ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {countries.map(country => (
                        <label key={country.name} className="flex items-center gap-2 cursor-pointer group">
                          <Checkbox 
                            checked={selectedCountries.includes(country.name)}
                            onCheckedChange={() => toggleCountry(country.name)}
                          />
                          <span className="text-sm truncate group-hover:text-primary transition-colors">
                            {country.flag} {country.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedCountries.length === 0 && (
              <p className="text-sm text-red-400">Please select at least one country.</p>
            )}
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t border-border z-10">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedTasks.length} tasks • {selectedCountries.length} countries
            </div>
            <Button 
              size="lg" 
              onClick={startGame}
              disabled={selectedTasks.length === 0 || selectedCountries.length === 0}
              className="font-bold text-lg px-8"
            >
              Start Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
