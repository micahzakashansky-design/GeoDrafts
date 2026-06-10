---
name: Country Draft data scripts
description: How to reliably bulk-update country stats in countries.ts
---

## Pattern
Use a standalone `.mjs` script in `scripts/` (not inline `node -e`) to avoid shell quoting issues with special chars like `²`, apostrophes, etc.

Process the file line-by-line, tracking `currentName` by matching `name: "..."` lines, then replacing the target stat line when you find it.

```js
lines = lines.map(line => {
  const nameMatch = line.match(/^\s+name: "(.+)"/);
  if (nameMatch) currentName = nameMatch[1];
  if (line.match(/^\s+population: \{ score: \d+,/) && data[currentName]) {
    const [score, desc] = data[currentName];
    return `      population: { score: ${score}, description: "${desc}" },`;
  }
  return line;
});
```

**Why:** Inline `node -e` with double-quoted shell args mangles apostrophes and Unicode characters in descriptions, causing 0 replacements. File-based scripts are reliable.

## Script location
`scripts/update-countries.mjs` — reuse or extend this for future bulk updates.
