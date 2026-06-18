import fs from 'fs';
const files = [
  'src/pages/normal/NormalUI.tsx',
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx',
  'src/pages/guess/GuessUI.tsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  // Update ExpandableDescription
  content = content.replace(/export function ExpandableDescription[\s\S]*?return \([\s\S]*?\n  \);\n\}/, `export function ExpandableDescription({ description }: { description: string }) {
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
      <div className={\`absolute top-0 left-0 right-0 flex flex-col \${expanded ? 'z-50 bg-[#161b22] border border-border shadow-xl rounded-lg p-3 -mx-3 -my-3' : 'bottom-0'}\`}>
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
}`);

  // Remove overflow-hidden from category selection cards and roster cards
  content = content.replace(/overflow-hidden (\$\{isHovered \? "bg-primary\/5)/g, '$1');
  content = content.replace(/relative overflow-hidden/g, 'relative');
  
  // Add rounded-xl to absolute inset-0 backgrounds
  content = content.replace(/className="absolute inset-0 bg-primary\/5 animate-pulse"/g, 'className="absolute inset-0 bg-primary/5 animate-pulse rounded-xl"');

  fs.writeFileSync(file, content);
  console.log('Patched', file);
}
