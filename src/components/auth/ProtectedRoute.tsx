import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  /**
   * Optional list of roles allowed to access this route.
   * If omitted, any authenticated user can access it.
   * If provided, users with a non-matching role are redirected to /dashboard.
   */
  allowedRoles?: UserRole[];
  /**
   * Where to redirect unauthenticated users. Defaults to /auth.
   */
  redirectTo?: string;
}

/**
 * ProtectedRoute — wraps private routes in App.tsx.
 *
 * Handles three states:
 *   1. Loading  → show spinner (prevents flash of unauthenticated content)
 *   2. No user  → redirect to /auth
 *   3. Wrong role → redirect to /dashboard
 *   4. Authorised → render child routes via <Outlet />
 *
 * Usage in App.tsx:
 *
 *   // Any logged-in user
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   // Admin only
 *   <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
 *     <Route path="/admin" element={<Admin />} />
 *   </Route>
 *
 *   // Agents and developers only
 *   <Route element={<ProtectedRoute allowedRoles={["agent", "developer"]} />}>
 *     <Route path="/submit-listing" element={<SubmitListing />} />
 *   </Route>
 */
export function ProtectedRoute({
  allowedRoles,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // ── 1. Still resolving session ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // ── 2. Not authenticated ───────────────────────────────────────────────────
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // ── 3. Role check (only if allowedRoles is specified) ─────────────────────
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // ── 4. Authorised — render children ───────────────────────────────────────
  return <Outlet />;
}