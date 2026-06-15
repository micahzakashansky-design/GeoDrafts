import sys

file_path = 'artifacts/country-draft/src/pages/Leaderboard.tsx'
with open(file_path, 'r') as f:
    content = f.read()

old_code = """  // Prefetch other tabs
  useState(() => {
    const filters: ModeFilter[] = ["all", "daily", "easy", "hard"];
    filters.forEach(f => {
      if (f !== modeFilter) {
        queryClient.prefetchQuery({
          queryKey: ["leaderboard", f],
          queryFn: () => getTopScores(f, 10),
          staleTime: 1000 * 60 * 5,
        });
      }
    });
  });"""

new_code = """  // Prefetch other tabs
  import { useEffect } from "react";
  useEffect(() => {
    const filters: ModeFilter[] = ["all", "daily", "easy", "hard"];
    filters.forEach(f => {
      if (f !== modeFilter) {
        queryClient.prefetchQuery({
          queryKey: ["leaderboard", f],
          queryFn: () => getTopScores(f, 10),
          staleTime: 1000 * 60 * 5,
        });
      }
    });
  }, [queryClient, modeFilter]);"""

# Wait, I should add useEffect to the imports if it's not there, but it's easier to just use the existing import line.
# Let's check imports first.
