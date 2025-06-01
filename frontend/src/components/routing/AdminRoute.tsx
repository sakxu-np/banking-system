import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../ui/Spinner";

/**
 * Route protection component that only allows access to users with admin role
 * Redirects non-admin users to the dashboard
 */
const AdminRoute: React.FC = () => {
  const { authState } = useAuth();

  if (authState.loading) {
    return <Spinner />;
  }

  // Check both authentication and admin role
  return authState.isAuthenticated && authState.user?.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" />
  );
};

export default AdminRoute;
