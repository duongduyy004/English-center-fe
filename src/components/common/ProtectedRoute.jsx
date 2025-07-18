import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_PERMISSIONS } from '../../constants/userRoles';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({
  children,
  requiredPermissions = [],
  allowedRoles = [],
  requiredRole = null
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access (support both requiredRole and allowedRoles)
  const rolesToCheck = requiredRole ? [requiredRole] : allowedRoles;
  if (rolesToCheck.length > 0 && !rolesToCheck.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const userPermissions = ROLE_PERMISSIONS[user?.role] || [];
    const hasPermission = requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
