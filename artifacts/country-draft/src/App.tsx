import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/use-firebase-auth";
import NotFound from "@/pages/not-found";
import NormalGame from "@/pages/normal/NormalGame";
import DoubleDraftGame from "@/pages/double/DoubleDraftGame";
import GuessGame from "@/pages/guess/GuessGame";
import DailyGame from "@/pages/daily/DailyGame";
import PartyGame from "@/pages/party/PartyGame";
import SabotageGame from "@/pages/sabotage/SabotageGame";
import Home from "@/pages/Home";
import Leaderboard from "@/pages/Leaderboard";
import About from "@/pages/About";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/game/normal" component={NormalGame} />
      <Route path="/game/double" component={DoubleDraftGame} />
      <Route path="/game/guess" component={GuessGame} />
      <Route path="/game/daily" component={DailyGame} />
      <Route path="/game/party" component={PartyGame} />
      <Route path="/game/sabotage" component={SabotageGame} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
