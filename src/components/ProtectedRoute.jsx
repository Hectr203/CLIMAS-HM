import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasPermission, getCurrentUser, getDefaultPath } from '../utils/auth';

const ProtectedRoute = ({ children, requiredPath }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login', { 
        replace: true,
        state: { from: location?.pathname }
      });
      return;
    }

    const currentUser = getCurrentUser();
    
    // Check if user has permission to access this specific path
    if (requiredPath && !hasPermission(requiredPath, currentUser?.role)) {
      // Redirect to user's default path if they don't have permission
      const defaultPath = getDefaultPath(currentUser?.role);
      navigate(defaultPath, { replace: true });
      return;
    }
  }, [navigate, location?.pathname, requiredPath]);

  // Show nothing while checking authentication/authorization
  if (!isAuthenticated()) {
    return null;
  }

  const currentUser = getCurrentUser();
  if (requiredPath && !hasPermission(requiredPath, currentUser?.role)) {
    return null;
  }

  return children;
};

export default ProtectedRoute;