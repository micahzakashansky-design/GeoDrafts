const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Add imports
if (!content.includes('useQueryClient')) {
  content = content.replace(
    'import { useLocation, Link } from "wouter";',
    'import { useLocation, Link } from "wouter";\nimport { useQueryClient } from "@tanstack/react-query";'
  );
}

if (!content.includes('getTopScores')) {
  content = content.replace(
    'checkDailySubmitted, getDailyState, createRoom, joinRoom } from "../lib/firestore";',
    'checkDailySubmitted, getDailyState, createRoom, joinRoom, getTopScores } from "../lib/firestore";'
  );
}

// Add queryClient and useEffect
if (!content.includes('const queryClient = useQueryClient();')) {
  content = content.replace(
    'export default function Home() {',
    `export default function Home() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Pre-load the default leaderboard
    queryClient.prefetchQuery({
      queryKey: ["leaderboard", "normal"],
      queryFn: () => getTopScores("normal"),
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);
`
  );
}

fs.writeFileSync('src/pages/Home.tsx', content);
console.log("Added prefetch!");
