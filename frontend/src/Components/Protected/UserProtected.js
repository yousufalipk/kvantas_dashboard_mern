import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebase } from '../../Context/Firebase';

const UserProtected = ({ children }) => {
  const { userType } = useFirebase();
  if (userType !== 'admin') {
    console.log("User Type:", userType);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default UserProtected;
