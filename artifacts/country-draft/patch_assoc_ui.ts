import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/associations/AssociationsUI.tsx', 'utf8');

// 1. Remove the old useEffect for auto-checking
const useEffectRegex = /\/\/ Check answers\s*useEffect\(\(\) => \{[\s\S]*?\}, \[input, task, country, onCorrect\]\);/;
content = content.replace(useEffectRegex, `const [isError, setIsError] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input) return;

    const val = normalize(input);
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
      onCorrect();
      setInput("");
      setIsError(false);
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
    }
  };`);

// 2. Change the Input to be wrapped in a form, and add isError styling
const inputRegex = /<motion\.div\s*initial=\{\{ opacity: 0, y: 10 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*>\s*<Input[\s\S]*?\/>\s*<\/motion\.div>/;

const replacementInput = `<motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, x: isError ? [-10, 10, -10, 10, 0] : 0 }}
            transition={{ x: { duration: 0.4 } }}
          >
            <form onSubmit={handleSubmit} className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type your answer..."
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  if (isError) setIsError(false);
                }}
                className={\`text-center text-xl md:text-2xl font-black h-16 md:h-20 rounded-2xl bg-card border-2 transition-colors shadow-inner \${isError ? 'border-red-500 focus-visible:ring-red-500' : 'border-border focus-visible:ring-primary focus-visible:border-primary'}\`}
              />
            </form>
          </motion.div>`;

content = content.replace(inputRegex, replacementInput);

writeFileSync('src/pages/associations/AssociationsUI.tsx', content);
