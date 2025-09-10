import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    // Handle single role or array of roles
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user's actual role
      const redirectPath = getDashboardPath(user.role);
      return <Navigate to={redirectPath} replace />;
    }
  }

  // User is authenticated and has required role
  return children;
};

// Helper function to get dashboard path based on role
const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin';
    default:
      return '/profile';
  }
};

export default ProtectedRoute;