/**
 * Developer Page
 * Redirects to the Developer Dashboard
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Developer = () => {
  const { role, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Only developers and admins can access
  if (role !== 'developer' && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/developer/dashboard" replace />;
};

export default Developer;
