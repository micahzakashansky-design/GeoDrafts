import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('vite.config.ts', 'utf8');

content = content.replace(
  /setupFiles: \["\.\/src\/setupTests\.ts"\],/,
  'setupFiles: ["./src/setupTests.ts"],\n    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/e2e/**"],'
);

writeFileSync('vite.config.ts', content);
