import { useContext } from "react";
import { AuthContext, AuthContextType } from "@/contexts/AuthContext";

/**
 * useAuth — access the global auth state anywhere in the app.
 *
 * Must be used inside <AuthProvider>. Throws a clear error if not,
 * so you get a helpful message instead of a silent undefined crash.
 *
 * Usage:
 *   const { user, profile, signIn, signOut, loading } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider. " +
      "Wrap your app (or main.tsx) with <AuthProvider>."
    );
  }

  return context;
}

// Re-export types for convenience so consumers don't need two imports
export type { UserRole, Profile } from "@/contexts/AuthContext";