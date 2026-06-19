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
