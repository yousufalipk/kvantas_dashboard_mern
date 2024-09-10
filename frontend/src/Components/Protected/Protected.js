import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebase } from '../../Context/Firebase';

const ProtectedRoute = ({ children }) => {
  const { isAuth } = useFirebase();
  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
