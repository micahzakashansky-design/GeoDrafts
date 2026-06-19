import React, { useState, useEffect, useRef } from "react";
import { Question } from "./AssociationsGame";
import { WorldMap } from "./WorldMap";
import { Country, COUNTRIES } from "@/data/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface AssociationsUIProps {
  question: Question;
  onCorrect: () => void;
  onSkip: () => void;
  validIsos: string[];
}

function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function AssociationsUI({ question, onCorrect, onSkip, validIsos }: AssociationsUIProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { task, country, options } = question;

  // Auto-focus input when task changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [task]);

  // Check answers
  useEffect(() => {
    if (!input) return;

    const val = normalize(input);

    if (task === "identify_from_flag" || task === "identify_from_map" || task === "identify_country_from_capital") {
      const matchName = normalize(country.name) === val;
      const matchAlias = country.aliases?.some(a => normalize(a) === val);
      if (matchName || matchAlias) {
        onCorrect();
      }
    } else if (task === "identify_capital") {
      const matchCap = normalize(country.capital) === val;
      const matchCapAlias = country.capitalAliases?.some(a => normalize(a) === val);
      if (matchCap || matchCapAlias) {
        onCorrect();
      }
    }
  }, [input, task, country, onCorrect]);

  const handleMapClick = (clickedCountry: Country) => {
    if (task === "click_on_map") {
      if (clickedCountry.name === country.name) {
        onCorrect();
      } else {
        // Maybe visual feedback for wrong click?
      }
    }
  };

  const handleFlagClick = (selectedCountry: Country) => {
    if (task === "find_flag") {
      if (selectedCountry.name === country.name) {
        onCorrect();
      }
    }
  };

  const renderTaskPrompt = () => {
    switch (task) {
      case "identify_from_flag":
        return "Identify this country";
      case "identify_from_map":
        return "Identify the highlighted country";
      case "click_on_map":
        return `Click on ${country.name}`;
      case "find_flag":
        return `Find the flag for ${country.name}`;
      case "identify_capital":
        return `What is the capital of ${country.name}?`;
      case "identify_country_from_capital":
        return `Which country's capital is ${country.capital}?`;
      default:
        return "";
    }
  };

  const needsInput = ["identify_from_flag", "identify_from_map", "identify_capital", "identify_country_from_capital"].includes(task);

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 w-full max-w-4xl mx-auto space-y-8">
      
      {/* Task Prompt */}
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold font-serif text-center"
      >
        {renderTaskPrompt()}
      </motion.h2>

      {/* Visual Content (Map or Flag) */}
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
              <div className="text-[12rem] leading-none select-none drop-shadow-2xl">
                {country.flag}
              </div>
            )}

            {task === "identify_from_map" && (
              <div className="w-full h-full p-4">
                <WorldMap 
                  highlightedCountryIso={country.isoNumeric}
                  interactive={false}
                  zoomToCountry={country}
                />
              </div>
            )}

            {task === "click_on_map" && (
              <div className="w-full h-full p-4">
                <WorldMap 
                  interactive={true}
                  validIsos={validIsos}
                  onCountryClick={handleMapClick}
                />
              </div>
            )}

            {task === "find_flag" && options && (
              <div className="grid grid-cols-3 gap-4 md:gap-8 p-4">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleFlagClick(opt)}
                    className="text-6xl md:text-8xl hover:scale-110 transition-transform active:scale-95 bg-secondary/20 p-6 rounded-2xl border border-border"
                  >
                    {opt.flag}
                  </button>
                ))}
              </div>
            )}

            {task === "identify_capital" && (
              <div className="text-[8rem] leading-none select-none drop-shadow-2xl opacity-50">
                {country.flag}
              </div>
            )}

            {task === "identify_country_from_capital" && (
              <div className="text-4xl md:text-6xl font-serif font-bold text-primary">
                {country.capital}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Input / Controls */}
      <div className="w-full max-w-md space-y-4">
        {needsInput && (
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your answer..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="text-center text-lg h-14 bg-secondary/50 border-border"
          />
        )}
        
        <div className="flex justify-center pt-4">
          <Button variant="outline" className="w-32" onClick={onSkip}>
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
