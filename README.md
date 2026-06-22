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
- **Backend/Database:** Firebase Auth, Cloud Firestore.
- **Package Manager:** pnpm with Workspaces.

## Monorepo Structure

- `artifacts/country-draft`: The main React frontend application.

## Getting Started

### Prerequisites

- Node.js (v22+ recommended)
- pnpm

### Development

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Run the Frontend:**
    ```bash
    pnpm --filter @workspace/country-draft run dev
    ```

### Common Scripts

- `pnpm run build`: Typecheck and build all packages.
- `pnpm run typecheck`: Run TypeScript type checking across the entire monorepo.
