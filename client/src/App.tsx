import { useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import AppShell from "./components/AppShell";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import INPSPage from "./pages/INPSPage";
import EntratePage from "./pages/EntratePage";
import PagoPAPage from "./pages/PagoPAPage";
import ANPRPage from "./pages/ANPRPage";
import SalutePage from "./pages/SalutePage";
import AutoPage from "./pages/AutoPage";
import APIGatewayPage from "./pages/APIGatewayPage";
import NotFound from "./pages/not-found";

// Easter Egg: Ctrl+Shift+P to reveal project origin
function useEasterEgg() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        console.log(
          "%c 🇮🇹 Portale Italia — CittadinoOS ",
          "background: #003366; color: white; display: block; padding: 8px 12px; font-size: 16px; font-weight: bold; border-radius: 4px;"
        );
        console.log("%cOrchestration Layer progettato da Seph Martin (Giuseppe Petrini).", "font-size: 12px; color: #666;");
        console.log("%cCodice soggetto a licenza AGPLv3.", "font-size: 12px; color: #666;");
        console.log("%cGitHub: https://github.com/sephmartin/portale-italia", "font-size: 12px; color: #0366d6;");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}

export default function App() {
  useEasterEgg();

  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <AppShell>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/inps" component={INPSPage} />
            <Route path="/entrate" component={EntratePage} />
            <Route path="/pagopa" component={PagoPAPage} />
            <Route path="/anpr" component={ANPRPage} />
            <Route path="/salute" component={SalutePage} />
            <Route path="/auto" component={AutoPage} />
            <Route path="/api" component={APIGatewayPage} />
            <Route component={NotFound} />
          </Switch>
        </AppShell>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
