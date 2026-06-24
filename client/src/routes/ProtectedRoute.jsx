import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RefreshCw } from 'lucide-react';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-beige-light dark:bg-darkgrey-dark">
        <RefreshCw className="animate-spin text-darkgrey dark:text-beige" size={32} />
        <span className="text-sm font-semibold mt-3 text-darkgrey/75 dark:text-beige-dark">
          Verifying session...
        </span>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
export { ProtectedRoute };