import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ALL_COUNTRIES as COUNTRIES, Country } from "@/data/countries";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Flag, Map as MapIcon, Globe, Brain, HelpCircle, CheckCircle2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Logo } from "@/components/Logo";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { createRoom } from "@/lib/firestore";
import { SettingsButton } from "@/components/SettingsButton";

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
  const { firebaseUser, profile } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);

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

  const hostMultiplayerRace = async () => {
    if (!firebaseUser || !profile) {
      alert("You must be signed in to host a multiplayer race.");
      return;
    }
    if (selectedTasks.length === 0 || selectedCountries.length === 0) return;
    
    setLoading(true);
    try {
      const code = await createRoom(firebaseUser.uid, profile.username, "associations_race", "easy", {
        tasks: selectedTasks,
        countries: selectedCountries
      });
      setLocation(`/game/associations_race?room=${code}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
      <header className="h-20 shrink-0 border-b border-border/50 bg-card/50 backdrop-blur-md px-6 md:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="font-sans text-lg md:text-xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity duration-75">
            <Logo className="w-5 h-5" />GeoDrafts
          </button>
          <div className="h-4 w-px bg-border hidden md:block" />
          <div className="px-3 py-1.5 rounded-full bg-card border border-border text-xs font-bold text-muted-foreground hidden sm:block tracking-widest uppercase">
            Associations Setup
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SettingsButton />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">1. Select Tasks</h2>
            <div className="space-y-2 bg-background border border-border rounded-xl p-4">
              {TASK_TYPES.map(task => {
                const isActive = selectedTasks.includes(task.id);
                return (
                  <label
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      isActive
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={isActive}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <div className="p-1.5 rounded-md bg-foreground/5 text-foreground shrink-0">
                      {task.icon}
                    </div>
                    <span className={`text-sm font-bold ${isActive ? "text-foreground" : "text-foreground/80"}`}>{task.label}</span>
                  </label>
                );
              })}
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
            
            <div className="flex flex-col gap-3">
              {countriesByRegion.map(([region, countries]) => {
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
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isCountrySelected ? "bg-primary/5 border border-primary/20" : "hover:bg-muted border border-transparent"}`}
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
            <div className="flex items-center gap-3">
              <Button 
                size="lg"
                variant="outline"
                onClick={hostMultiplayerRace}
                disabled={selectedTasks.length === 0 || selectedCountries.length === 0 || loading}
                className="font-bold text-lg px-8 flex items-center gap-2"
              >
                <Users className="w-5 h-5" /> {loading ? "Creating..." : "Host Multiplayer Race"}
              </Button>
              <Button 
                size="lg" 
                onClick={startGame}
                disabled={selectedTasks.length === 0 || selectedCountries.length === 0 || loading}
                className="font-bold text-lg px-8"
              >
                Start Local Game
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
