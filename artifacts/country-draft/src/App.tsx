import { useEffect, useState } from "react";
import { loadCountriesData } from "@/data/countries";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/use-firebase-auth";
import NotFound from "@/pages/not-found";
import NormalGame from "@/pages/normal/NormalGame";
import DoubleDraftGame from "@/pages/double/DoubleDraftGame";
import DoubleDraftMultiplayer from "@/pages/double/DoubleDraftMultiplayer";
import GuessGame from "@/pages/guess/GuessGame";
import DailyGame from "@/pages/daily/DailyGame";
import PartyGame from "@/pages/party/PartyGame";
import SabotageGame from "@/pages/sabotage/SabotageGame";
import Home from "@/pages/Home";
import Leaderboard from "@/pages/Leaderboard";
import About from "@/pages/About";
import Lobby from "@/pages/Lobby";
import { AssociationsSetup } from "@/pages/associations/AssociationsSetup";
import AssociationsGame from "@/pages/associations/AssociationsGame";
import AssociationsRace from "@/pages/associations/AssociationsRace";
import { Agentation } from "agentation";

const queryClient = new QueryClient();

import { ProtectedRoute } from "@/components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/about" component={About} />
      
      <Route path="/lobby">
        <ProtectedRoute><Lobby /></ProtectedRoute>
      </Route>
      <Route path="/game/normal">
        <ProtectedRoute><NormalGame /></ProtectedRoute>
      </Route>
      <Route path="/game/beta-normal">
        <ProtectedRoute><NormalGame isBetaMode={true} /></ProtectedRoute>
      </Route>
      <Route path="/game/double">
        <ProtectedRoute><DoubleDraftGame /></ProtectedRoute>
      </Route>
      <Route path="/game/guess">
        <ProtectedRoute><GuessGame /></ProtectedRoute>
      </Route>
      <Route path="/game/daily">
        <ProtectedRoute><DailyGame /></ProtectedRoute>
      </Route>
      <Route path="/game/party">
        <ProtectedRoute><PartyGame /></ProtectedRoute>
      </Route>
      <Route path="/game/sabotage">
        <ProtectedRoute><SabotageGame /></ProtectedRoute>
      </Route>
      <Route path="/game/associations/setup">
        <ProtectedRoute><AssociationsSetup /></ProtectedRoute>
      </Route>
      <Route path="/game/associations">
        <ProtectedRoute><AssociationsGame /></ProtectedRoute>
      </Route>
      <Route path="/game/double_draft">
        <ProtectedRoute><DoubleDraftMultiplayer /></ProtectedRoute>
      </Route>
      <Route path="/game/associations_race">
        <ProtectedRoute><AssociationsRace /></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadCountriesData().then(() => setDataLoaded(true));
  }, []);

  if (!dataLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading game data...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          <SonnerToaster />
          {import.meta.env.DEV && <Agentation />}
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
