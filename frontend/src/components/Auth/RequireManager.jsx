import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Wraps a route only managers may use. This is UX only - the backend
 * enforces the MANAGER role on every catalog-changing endpoint regardless.
 */
// eslint-disable-next-line react/prop-types -- project doesn't use prop-types elsewhere
const RequireManager = ({ children }) => {
  const { isLoggedIn, currentUser } = useSelector((state) => state.user);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (currentUser?.role !== 'MANAGER') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireManager;
