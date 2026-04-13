/**
 * Auth Hook Compatibility Layer
 * Wraps the existing AuthContext to provide the same interface as the source project
 */

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export type AppRole = 'buyer' | 'investor' | 'developer' | 'agent' | 'admin';

export const useAuth = () => {
  const auth = useAuthContext();

  const role = (auth.profile?.role as AppRole) || null;

  const hasRole = (requiredRole: AppRole | AppRole[]) => {
    if (!role) return false;
    if (role === 'admin') return true;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    return role === requiredRole;
  };

  return {
    user: auth.user,
    session: auth.session,
    role,
    loading: auth.loading,
    signUp: async (email: string, password: string, fullName: string, selectedRole: AppRole) => {
      return auth.signUp(email, password, fullName);
    },
    signIn: auth.signIn,
    signOut: auth.signOut,
    isAuthenticated: !!auth.user,
    hasRole,
    profile: auth.profile,
  };
};

export const getDashboardRoute = (role: AppRole | null): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'buyer':
      return '/buyer/dashboard';
    case 'investor':
      return '/investor/dashboard';
    case 'developer':
      return '/developer/dashboard';
    case 'agent':
      return '/agent/dashboard';
    default:
      return '/';
  }
};

export { AuthProvider } from '@/contexts/AuthContext';
