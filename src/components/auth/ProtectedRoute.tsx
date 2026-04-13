/**
 * Protected Route Component
 * Guards routes based on authentication and role requirements
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AppRole, getDashboardRoute } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: (AppRole | string)[];
  requireAuth?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  requireAuth = true 
}: ProtectedRouteProps) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && role) {
    if (role === 'admin') {
      return <>{children}</>;
    }
    if (!allowedRoles.includes(role)) {
      return <Navigate to={getDashboardRoute(role)} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
