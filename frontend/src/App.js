import './App.css';
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFirebase } from './Context/Firebase';

import Loader from './Components/Loader/Loader';

// Importing Layouts
import AuthLayout from './Layouts/AuthLayout/AuthLayout';
import AdminLayout from './Layouts/AdminLayout/AdminLayout';

import ProtectedRoute from './Components/Protected/Protected';

function App() {
  const { isAuth, loading, refreshAuth } = useFirebase();

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <ToastContainer />
      <Routes>
        {!isAuth ? (
          <>
            <Route path="/auth/log-in" element={<AuthLayout />} />
            <Route path="*" element={<AuthLayout />} />
          </>
        ) : (
          <>
            <Route path="/admin" element={<ProtectedRoute ><AdminLayout /></ProtectedRoute>} />
            <Route path="*" element={<ProtectedRoute ><AdminLayout /></ProtectedRoute>} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;
