import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Assessment from "./pages/Assessment";
import AssessmentResults from "./pages/AssessmentResults";
import Tools from "./pages/Tools";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MatomoProvider, matomoInstance, trackPageView } from "./lib/matomo";

const queryClient = new QueryClient();

// Track page views on route changes
const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, [location]);

  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MatomoProvider value={matomoInstance}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <RouteTracker />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/assessment-results/:id" element={<AssessmentResults />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </MatomoProvider>
  </QueryClientProvider>
);

export default App;
