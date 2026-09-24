import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Wraps a route that needs a logged-in user. Anonymous visitors are sent to
 * /login, remembering where they were headed so Login can send them back.
 */
// eslint-disable-next-line react/prop-types -- project doesn't use prop-types elsewhere
const RequireAuth = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
