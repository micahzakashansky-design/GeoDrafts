import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/associations/AssociationsUI.tsx', 'utf8');

// Replace find_flag rendering
const findFlagRegex = /\{task === "find_flag" && options && \([\s\S]*?<\/div>\n\s*\)\}/;
const findFlagNew = `{task === "find_flag" && options && (
              <div className="grid grid-cols-3 gap-4 md:gap-6 p-4">
                {options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    onClick={() => handleFlagClick(opt)}
                    className="text-6xl md:text-8xl bg-card p-6 md:p-8 rounded-[2rem] border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-colors shadow-sm flex items-center justify-center"
                  >
                    {opt.flag}
                  </motion.button>
                ))}
              </div>
            )}`;
content = content.replace(findFlagRegex, findFlagNew);

// Replace input and skip button rendering
const inputRegex = /\{needsInput && \(\s*<Input\s*ref=\{inputRef\}\s*type="text"\s*placeholder="Type your answer\.\.\."\s*value=\{input\}\s*onChange=\{e => setInput\(e\.target\.value\)\}\s*className="text-center text-lg h-14 bg-foreground\/10 border-border"\s*\/>\s*\)\}\s*<div className="flex justify-center pt-4">\s*<Button variant="outline" className="w-32" onClick=\{onSkip\}>\s*Skip\s*<\/Button>\s*<\/div>/;

const inputNew = `{needsInput && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type your answer..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="text-center text-xl md:text-2xl font-black h-16 md:h-20 rounded-2xl bg-card border-2 border-border focus-visible:ring-primary focus-visible:border-primary shadow-inner"
            />
          </motion.div>
        )}
        
        <div className="flex justify-center pt-6">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSkip}
            className="px-8 py-3 rounded-xl border-2 border-border font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors uppercase tracking-widest text-sm"
          >
            Skip
          </motion.button>
        </div>`;

content = content.replace(inputRegex, inputNew);

// Make the Task Prompt look better
const taskPromptRegex = /<motion\.h2 \n\s*initial=\{\{ opacity: 0, y: -20 \}\}\n\s*animate=\{\{ opacity: 1, y: 0 \}\}\n\s*className="text-2xl md:text-3xl font-bold font-sans text-center"\n\s*>\n\s*\{renderTaskPrompt\(\)\}\n\s*<\/motion\.h2>/;

const taskPromptNew = `<motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-5xl font-black font-sans text-center tracking-tighter"
      >
        {renderTaskPrompt()}
      </motion.h2>`;
content = content.replace(taskPromptRegex, taskPromptNew);

writeFileSync('src/pages/associations/AssociationsUI.tsx', content);
