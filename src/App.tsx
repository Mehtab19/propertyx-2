/**
 * App.tsx — Wiring guide for AuthProvider + ProtectedRoute
 *
 * Copy the relevant sections into your existing App.tsx.
 * Do NOT replace your whole file — merge these pieces in.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// ── Pages (adjust import paths to match your project) ─────────────────────────
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import Dashboard from "@/pages/Dashboard";
import Portfolio from "@/pages/Portfolio";
import SubmitListing from "@/pages/SubmitListing";
import ScheduleMeeting from "@/pages/ScheduleMeeting";
import Mortgage from "@/pages/Mortgage";
import Compare from "@/pages/Compare";
import Chat from "@/pages/Chat";
import Admin from "@/pages/Admin";
import SavedProperties from "@/pages/SavedProperties";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* AuthProvider must wrap BrowserRouter so hooks work inside Route components */}
      <AuthProvider>
        <BrowserRouter basename="/demos/primeX">
          <Routes>

            {/* ── Public routes — no auth required ───────────────────────── */}
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/schedule-meeting" element={<ScheduleMeeting />} />
            <Route path="/mortgage" element={<Mortgage />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/chat" element={<Chat />} />

            {/* Auth page — redirect to dashboard if already logged in */}
            <Route path="/auth" element={<Auth />} />

            {/* ── Protected routes — any logged-in user ──────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/saved" element={<SavedProperties />} />
            </Route>

            {/* ── Agent + Developer only ─────────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={["agent", "developer"]} />}>
              <Route path="/submit-listing" element={<SubmitListing />} />
            </Route>

            {/* ── Admin only ─────────────────────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            {/* ── Fallback ───────────────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}