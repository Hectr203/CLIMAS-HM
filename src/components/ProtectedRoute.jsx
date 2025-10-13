import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { hasPermission, getDefaultPath } from '../utils/auth';

const ProtectedRoute = ({ children, requiredPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { from: location?.pathname }
      });
      return;
    }
    // Check permission with user role
    if (!isLoading && requiredPath && (!user || !hasPermission(requiredPath, user.rol))) {
      const defaultPath = getDefaultPath(user?.rol);
      navigate(defaultPath, { replace: true });
      return;
    }
  }, [isAuthenticated, isLoading, user, navigate, location?.pathname, requiredPath]);

  // Show nothing while checking authentication/authorization
  if (isLoading || !isAuthenticated) {
    return null;
  }
  if (requiredPath && (!user || !hasPermission(requiredPath, user.rol))) {
    return null;
  }
  return children;
};

export default ProtectedRoute;