import React, { useState, useEffect, useRef, useMemo } from "react";
import { Question } from "./AssociationsGame";
import { WorldMap } from "./WorldMap";
import { Country, ALL_COUNTRIES as COUNTRIES } from "@/data/countries";
import { motion, AnimatePresence } from "framer-motion";
import Search from "lucide-react/dist/esm/icons/search";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import SkipForward from "lucide-react/dist/esm/icons/skip-forward";
import CornerDownLeft from "lucide-react/dist/esm/icons/corner-down-left";
import ArrowUpDown from "lucide-react/dist/esm/icons/arrow-up-down";

interface AssociationsUIProps {
  question: Question;
  onCorrect: () => void;
  onWrong: () => void;
  onSkip: () => void;
  validIsos: string[];
}

import { MAJOR_NON_CAPITAL_CITIES } from "@/data/majorCities";

function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function AssociationsUI({ question, onCorrect, onWrong, onSkip, validIsos }: AssociationsUIProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [incorrectFeedback, setIncorrectFeedback] = useState(false);
  const [correctFeedback, setCorrectFeedback] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [skipFeedback, setSkipFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        skipButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const { task, country, options } = question;

  // Auto-focus input when task changes
  useEffect(() => {
    setInput("");
    setIncorrectFeedback(false);
    setCorrectFeedback(false);
    setSkipFeedback(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [task, country]);

  const suggestions = useMemo(() => {
    if (!input.trim()) return [];
    const query = input.toLowerCase();
    if (task === "identify_capital") {
      const capMatches = COUNTRIES.filter(c => c.capital.toLowerCase().includes(query))
        .map(c => ({ displayText: c.capital }));
      const cityMatches = MAJOR_NON_CAPITAL_CITIES.filter(city => city.toLowerCase().includes(query))
        .map(city => ({ displayText: city }));
      return [...capMatches, ...cityMatches]
        .sort((a, b) => a.displayText.localeCompare(b.displayText))
        .slice(0, 6);
    } else {
      return COUNTRIES.filter(c => c.name.toLowerCase().includes(query))
        .slice(0, 6)
        .map(c => ({ displayText: c.name }));
    }
  }, [input, task]);

  const handleSkipLocal = () => {
    if (incorrectFeedback || correctFeedback || skipFeedback) return;
    setSkipFeedback(true);
    setTimeout(() => {
      onSkip();
    }, 2000);
  };

  const handleSuccess = () => {
    setCorrectFeedback(true);
    setTimeout(() => {
      onCorrect();
    }, 1500);
  };

  const handleFail = () => {
    setIncorrectFeedback(true);
    setTimeout(() => {
      onWrong();
    }, 2000);
  };

  const handleGuess = (guessVal: string) => {
    if (incorrectFeedback || correctFeedback || skipFeedback) return;
    const val = normalize(guessVal);
    let isMatch = false;

    if (task === "identify_from_flag" || task === "identify_from_map" || task === "identify_country_from_capital") {
      const matchName = normalize(country.name) === val;
      const matchAlias = country.aliases?.some(a => normalize(a) === val);
      isMatch = matchName || !!matchAlias;
    } else if (task === "identify_capital") {
      const matchCap = normalize(country.capital) === val;
      const matchCapAlias = country.capitalAliases?.some(a => normalize(a) === val);
      isMatch = matchCap || !!matchCapAlias;
    }

    if (isMatch) {
      handleSuccess();
    } else {
      handleFail();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    }
  };

const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input || incorrectFeedback || skipFeedback) return;
    if (showSuggestions && suggestions.length > 0) {
      handleGuess(suggestions[selectedIndex].displayText);
      setShowSuggestions(false);
    } else {
      handleGuess(input);
    }
  };

  const handleMapClick = (clickedCountry: Country) => {
    if (incorrectFeedback || correctFeedback || skipFeedback) return;
    if (task === "click_on_map") {
      if (clickedCountry.name === country.name) {
        handleSuccess();
      } else {
        handleFail();
      }
    }
  };

  const handleFlagClick = (selectedCountry: Country) => {
    if (incorrectFeedback || correctFeedback || skipFeedback) return;
    if (task === "find_flag") {
      if (selectedCountry.name === country.name) {
        handleSuccess();
      } else {
        handleFail();
      }
    }
  };

  const renderTaskPrompt = () => {
    switch (task) {
      case "identify_from_flag": return "Identify this country";
      case "identify_from_map": return "Identify the highlighted country";
      case "click_on_map": return `Click on ${country.name}`;
      case "find_flag": return `Find the flag for ${country.name}`;
      case "identify_capital": return `What is the capital of ${country.name}?`;
      case "identify_country_from_capital": return `Which country's capital is ${country.capital}?`;
      default: return "";
    }
  };

  const needsInput = ["identify_from_flag", "identify_from_map", "identify_capital", "identify_country_from_capital"].includes(task);

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 w-full max-w-4xl mx-auto space-y-8 relative">
      
      {/* Correct Overlay */}
      <AnimatePresence>
        {correctFeedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/90 backdrop-blur-sm"
          >
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl max-w-lg w-full">
              <CheckCircle className="w-20 h-20 text-emerald-500 mb-6" />
              <h2 className="text-3xl font-black text-emerald-500 mb-2">Correct!</h2>
              <p className="text-muted-foreground text-lg mb-6">Great job!</p>
              
              <div className="bg-card px-8 py-6 rounded-2xl shadow-inner border border-border w-full flex flex-col items-center">
                {task === "identify_capital" ? (
                  <span className="text-4xl font-bold text-foreground">{country.capital}</span>
                ) : (
                  <>
                    <span className="text-6xl mb-4">{country.flag}</span>
                    <span className="text-3xl font-bold text-foreground">{country.name}</span>
                  </>
                )}
                { (task === "click_on_map" || task === "identify_from_map") && (
                  <div className="w-full h-40 mt-6 rounded-xl overflow-hidden pointer-events-none border border-border shadow-inner">
                    <WorldMap highlightedCountryIso={country.isoNumeric} interactive={false} zoomToCountry={country} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incorrect Overlay */}
      <AnimatePresence>
        {incorrectFeedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/90 backdrop-blur-sm"
          >
            <div className="bg-destructive/10 border border-destructive/20 p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl max-w-lg w-full">
              <XCircle className="w-20 h-20 text-destructive mb-6" />
              <h2 className="text-3xl font-black text-destructive mb-2">Incorrect!</h2>
              <p className="text-muted-foreground text-lg mb-6">The correct answer was:</p>
              
              <div className="bg-card px-8 py-6 rounded-2xl shadow-inner border border-border w-full flex flex-col items-center">
                {task === "identify_capital" ? (
                  <span className="text-4xl font-bold text-foreground">{country.capital}</span>
                ) : (
                  <>
                    <span className="text-6xl mb-4">{country.flag}</span>
                    <span className="text-3xl font-bold text-foreground">{country.name}</span>
                  </>
                )}
                { (task === "click_on_map" || task === "identify_from_map") && (
                  <div className="w-full h-40 mt-6 rounded-xl overflow-hidden pointer-events-none border border-border shadow-inner">
                    <WorldMap highlightedCountryIso={country.isoNumeric} interactive={false} zoomToCountry={country} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Overlay */}
      <AnimatePresence>
        {skipFeedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/90 backdrop-blur-sm"
          >
            <div className="bg-muted/50 border border-border p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl max-w-lg w-full">
              <SkipForward className="w-20 h-20 text-muted-foreground mb-6" />
              <h2 className="text-3xl font-black text-foreground mb-2">Skipped</h2>
              <p className="text-muted-foreground text-lg mb-6">The correct answer was:</p>
              
              <div className="bg-card px-8 py-6 rounded-2xl shadow-inner border border-border w-full flex flex-col items-center">
                {task === "identify_capital" ? (
                  <span className="text-4xl font-bold text-foreground">{country.capital}</span>
                ) : (
                  <>
                    <span className="text-6xl mb-4">{country.flag}</span>
                    <span className="text-3xl font-bold text-foreground">{country.name}</span>
                  </>
                )}
                { (task === "click_on_map" || task === "identify_from_map") && (
                  <div className="w-full h-40 mt-6 rounded-xl overflow-hidden pointer-events-none border border-border shadow-inner">
                    <WorldMap highlightedCountryIso={country.isoNumeric} interactive={false} zoomToCountry={country} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-5xl font-black font-sans text-center tracking-tighter"
      >
        {renderTaskPrompt()}
      </motion.h2>

      <div className="w-full flex-1 min-h-[300px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={task + country.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full flex items-center justify-center"
          >
            {task === "identify_from_flag" && (
              <div className="text-[12rem] leading-none select-none drop-shadow-2xl">{country.flag}</div>
            )}
            {task === "identify_from_map" && (
              <div className="w-full h-full p-4"><WorldMap highlightedCountryIso={country.isoNumeric} interactive={false} zoomToCountry={country} /></div>
            )}
            {task === "click_on_map" && (
              <div className="w-full h-full p-4"><WorldMap interactive={true} validIsos={validIsos} onCountryClick={handleMapClick} /></div>
            )}
            {task === "find_flag" && options && (
              <div className="grid grid-cols-3 gap-4 md:gap-6 p-4">
                {options.map((opt, i) => (
                  <motion.button tabIndex={-1} key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleFlagClick(opt)} className="text-6xl md:text-8xl bg-card p-6 md:p-8 rounded-[2rem] border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-colors shadow-sm flex items-center justify-center">{opt.flag}</motion.button>
                ))}
              </div>
            )}
            {task === "identify_capital" && (
              <div className="text-[8rem] leading-none select-none drop-shadow-2xl opacity-50">{country.flag}</div>
            )}
            {task === "identify_country_from_capital" && (
              <div className="text-4xl md:text-6xl font-sans font-bold text-primary">{country.capital}</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md space-y-4">
        {needsInput && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-40">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <form onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your answer..."
                  value={input}
                  onKeyDown={handleKeyDown}
                  onChange={e => {
                    setInput(e.target.value);
                    setShowSuggestions(true);
                    setSelectedIndex(0);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  disabled={incorrectFeedback || correctFeedback || skipFeedback}
                  className="w-full bg-card border-2 border-border rounded-2xl pl-12 pr-4 py-4 text-xl md:text-2xl font-black focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-inner disabled:opacity-50"
                />
              </form>

              {showSuggestions && suggestions.length > 0 && !(incorrectFeedback || correctFeedback) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="absolute bottom-full left-0 w-full mb-3 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  {[...suggestions].reverse().map((s, idx) => {
                    const actualIndex = suggestions.length - 1 - idx;
                    const isSelected = actualIndex === selectedIndex;
                    return (
                      <button 
                        type="button"
                        tabIndex={-1}
                        key={s.displayText} 
                        onClick={() => {
                          setShowSuggestions(false);
                          handleGuess(s.displayText);
                        }} 
                        onMouseMove={() => setSelectedIndex(actualIndex)}
                        className={`w-full px-5 py-4 text-left transition-colors border-b border-border last:border-0 flex items-center justify-between ${isSelected ? 'bg-primary/10' : 'bg-transparent'}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-foreground text-lg">{s.displayText}</span>
                        </div>
                        {isSelected ? (
                          <div className="flex items-center gap-3 text-primary transition-colors">
                            <ArrowUpDown className="w-4 h-4 opacity-50" />
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline-block">Enter</span>
                              <CornerDownLeft className="w-4 h-4" />
                            </div>
                          </div>
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground transition-colors" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
        
        <div className="flex justify-center pt-6 relative z-30">
          <motion.button 
            ref={skipButtonRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkipLocal}
            disabled={incorrectFeedback || correctFeedback || skipFeedback}
            className="px-8 py-3 rounded-xl border-2 border-border font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors uppercase tracking-widest text-sm disabled:opacity-50"
          >
            Skip
          </motion.button>
        </div>
      </div>
    </div>
  );
}
