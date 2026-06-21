const fs = require('fs');

const sidebarFiles = [
  'src/pages/normal/SidebarRoster.tsx',
  'src/pages/daily/SidebarRoster.tsx',
  'src/pages/double/SidebarRoster.tsx',
  'src/pages/guess/SidebarRoster.tsx',
  'src/pages/party/SidebarRoster.tsx',
  'src/pages/sabotage/SidebarRoster.tsx'
];

for (const f of sidebarFiles) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');

  // Add categoryTimes to props
  const srPropsRegex = /export function SidebarRoster\(\{([^}]*)\} :\s*\{([^}]*)\}\) \{/g;
  content = content.replace(srPropsRegex, (match, props, types) => {
    if (props.includes('categoryTimes')) return match;
    return \`export function SidebarRoster({\${props}, categoryTimes } : {\${types} categoryTimes?: Partial<Record<Category, number>>;}) {\`;
  });

  // Render time inside category card
  const catRenderRegex = /(<span className="text-\[9px\] md:text-\[10px\] font-bold uppercase tracking-widest text-white\/80">\{?(sCat|cat|actualCat)\}?<\/span>)(<\/div>)/g;
  content = content.replace(catRenderRegex, 
    \`$1
    {categoryTimes?.[$2] !== undefined && (
      <span className="ml-2 text-[8px] md:text-[9px] font-mono bg-black/40 px-1.5 py-0.5 rounded text-white/60">
        {(categoryTimes[$2] / 1000).toFixed(1)}s
      </span>
    )}
    $3\`
  );

  fs.writeFileSync(f, content);
}

console.log("Updated SidebarRoster files!");
