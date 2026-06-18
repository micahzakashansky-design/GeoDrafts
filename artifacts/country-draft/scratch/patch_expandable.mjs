import fs from 'fs';

const exactOldText = `export function ExpandableDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [description]);
  return (
    <div className="relative flex flex-col flex-1">
      {/* Invisible placeholder to maintain the normal collapsed height in the DOM */}
      <div className="invisible flex flex-col flex-1" aria-hidden="true">
        <p className="text-sm leading-relaxed italic line-clamp-2 flex-1">{description}</p>
        {isOverflowing && (
          <div className="text-[10px] uppercase font-bold mt-auto pt-1 py-1">Show More</div>
        )}
      </div>
      
      {/* Absolute overlay for the actual content */}
      <div className={\`absolute top-0 left-0 right-0 flex flex-col \${expanded ? 'z-50 bg-card border border-border shadow-xl rounded-lg p-3 -mx-3 -my-3' : 'bottom-0'}\`}>
        <p ref={textRef} className={\`text-sm text-foreground/80 leading-relaxed italic flex-1 \${expanded ? "" : "line-clamp-2"}\`}>{description}</p>
        {isOverflowing && (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className={\`text-[10px] uppercase font-bold text-primary flex items-center gap-1 hover:bg-primary/20 px-2 py-1 rounded -ml-2 transition-colors w-max text-left \${expanded ? 'mt-2' : 'mt-auto pt-1'}\`}>
            {expanded ? "Show Less" : "Show More"}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}`;

const exactNewText = `export function ExpandableDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [description]);
  
  return (
    <div className="relative">
      <p ref={textRef} className={\`text-[11px] md:text-xs text-muted-foreground/80 leading-relaxed italic \${expanded ? "opacity-0 pointer-events-none" : "line-clamp-2"}\`}>
        {description}
      </p>
      
      {!expanded && isOverflowing && (
        <button 
          onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
          className="text-[10px] uppercase font-bold text-yellow-500 hover:text-yellow-400 mt-2 flex items-center gap-1 group w-max transition-colors"
        >
          Show More <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      {expanded && (
        <div className="absolute top-[-8px] left-[calc(-1rem-1px)] right-[calc(-1rem-1px)] md:left-[calc(-1.25rem-1px)] md:right-[calc(-1.25rem-1px)] bg-card border-x border-b border-border/50 rounded-b-2xl px-4 md:px-5 pt-[8px] pb-4 md:pb-5 z-50 shadow-2xl">
          <p className="text-[11px] md:text-xs text-foreground/90 leading-relaxed italic">
            {description}
          </p>
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
            className="text-[10px] uppercase font-bold text-yellow-500 hover:text-yellow-400 mt-3 flex items-center gap-1 group w-max transition-colors"
          >
            Show Less <ChevronUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}`;

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes(exactOldText)) {
    content = content.replace(exactOldText, exactNewText);
  } else {
    console.warn(`Could not find old text in ${filePath}`);
  }
  
  content = content.replace(/className="mt-auto space-y-1"/g, 'className="space-y-1 mt-3"');
  content = content.replace(/className="space-y-2 mt-auto"/g, 'className="space-y-2 mt-3"');
  content = content.replace(/className="space-y-3 mt-auto"/g, 'className="space-y-3 mt-3"');
  content = content.replace(/className="mt-auto pt-1"/g, 'className="mt-3"');
  
  fs.writeFileSync(filePath, content);
}

['src/pages/normal/NormalUI.tsx', 'src/pages/daily/DailyUI.tsx', 'src/pages/sabotage/SabotageUI.tsx', 'src/pages/guess/GuessUI.tsx', 'src/pages/party/PartyUI.tsx', 'src/pages/double/DoubleUI.tsx'].forEach(patchFile);
