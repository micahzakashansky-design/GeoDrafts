# GeoDrafts

GeoDrafts is a nation-building draft game where players build their ideal nation by drafting random countries and assigning them to strategic category slots. Score points based on real-world statistics and compete on the global leaderboard.

## Features

- **15 Category Slots:** Strategic drafting across categories including Military, Economy, Technology, Culture, and more.
- **Real-World Stats:** Scoring is based on comprehensive real-world data for a wide variety of countries.
- **Easy & Hard Modes:** Play with stat ratings visible or challenge yourself with objective stats only.
- **Daily Challenges:** A new shuffled pool every day. Compete with everyone else on the same set of countries.
- **Global Leaderboard:** Submit your best scores and see how your nations rank against others.
- **Bonus Mechanics:** Special scoring formulas like the Size + Population density bonus.

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 4, Framer Motion 12, Wouter 3.
- **Backend:** Express 5, Node.js 22.
- **Database:** PostgreSQL with Drizzle ORM.
- **Authentication:** Firebase Auth.
- **API:** OpenAPI (Swagger) with Orval for client/Zod schema codegen.
- **Package Manager:** pnpm with Workspaces.

## Monorepo Structure

- `artifacts/country-draft`: The main React frontend application.
- `artifacts/api-server`: Express backend serving the API and leaderboard.
- `lib/db`: Shared database schema and Drizzle client.
- `lib/api-spec`: OpenAPI specification and Orval configuration.
- `lib/api-client-react`: Generated React Query hooks for the API.
- `lib/api-zod`: Generated Zod schemas for API validation.
- `lib/replit-auth-web`: Firebase Auth integration for the web.

## Getting Started

### Prerequisites

- Node.js (v22+ recommended)
- pnpm

### Development

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Environment Variables:**
    Create a `.env` file or set the following:
    - `DATABASE_URL`: Your PostgreSQL connection string.
    - `PORT`: Port for the API server (default 5000).

3.  **Run the API server:**
    ```bash
    pnpm --filter @workspace/api-server run dev
    ```

4.  **Run the Frontend:**
    ```bash
    pnpm --filter @workspace/country-draft run dev
    ```

### Common Scripts

- `pnpm run build`: Typecheck and build all packages.
- `pnpm run typecheck`: Run TypeScript type checking across the entire monorepo.
- `pnpm --filter @workspace/api-spec run codegen`: Regenerate API hooks and Zod schemas from the OpenAPI spec.
- `pnpm --filter @workspace/db run push`: Push database schema changes to the database.
