# Workspace Rules

- Before making any code changes, ALWAYS run `git pull` to fetch the latest changes from the remote repository.
- ALWAYS run tests (if testing is configured) before you commit your code.
- ALWAYS run `pnpm run typecheck` to verify types before you commit your code.
- ALWAYS automatically run `git push` right after committing changes to keep the remote branch up to date.
- Whenever instructed, check Render deploy logs. If there is an error, try to fix it. If the deployment is successful, use Chrome tools to inspect the website changes (the URL can be found in the Render extension).
- Whenever testing the GeoDrafts website and a login is required, ALWAYS use the following credentials:
  - **Email**: `antigravity@test.com`
  - **Password**: `Antigravity123!`
  - **Username**: `Antigravity`

- **Radio Button Style**: When asked to create or use a radio button, ALWAYS use the "card" style seen in the Game Mode selection (e.g. `Lobby.tsx`). This includes:
  - A full-width `motion.button` wrapper with hover/tap animations (`scale: 1.02` / `scale: 0.98`), a `rounded-2xl` border, and `p-5` padding.
  - A `w-14 h-14 rounded-2xl` icon container on the left with a Lucide icon.
  - Title and subtitle text in the middle (Title is `font-black text-xl tracking-tight`, subtitle is `text-sm font-medium text-muted-foreground`).
  - A `w-6 h-6 rounded-full border-2` ring on the far right containing an animated `layoutId="<id>-dot"` filled circle when active.
  - Semantic Tailwind colors for active/inactive states (e.g. inactive is `bg-card border-border hover:bg-muted/50`, active has a color tint like `border-primary/50 bg-primary/10`). Do not hardcode `#000000` or `white` unless enforcing dark mode exclusively.

