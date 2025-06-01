import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';

const PrivateRoute: React.FC = () => {
  const { authState } = useAuth();

  if (authState.loading) {
    return <Spinner />;
  }

  return authState.isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;