import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Chat from "./pages/Chat";
import Compare from "./pages/Compare";
import Mortgage from "./pages/Mortgage";
import SubmitListing from "./pages/SubmitListing";
import Handoff from "./pages/Handoff";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import SavedProperties from "./pages/SavedProperties";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";
import StatePage from "./pages/StatePage";
import ScheduleMeeting from "./pages/ScheduleMeeting";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/mortgage" element={<Mortgage />} />
            <Route path="/submit-listing" element={<SubmitListing />} />
            <Route path="/handoff" element={<Handoff />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/saved" element={<SavedProperties />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/state/:stateName" element={<StatePage />} />
            <Route path="/schedule-meeting" element={<ScheduleMeeting />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
