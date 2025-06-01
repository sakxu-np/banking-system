import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RegisterForm from "../components/auth/RegisterForm";
import AlertMessage from "../components/ui/AlertMessage";

const RegisterPage: React.FC = () => {
  const { authState, clearError } = useAuth();
  const { isAuthenticated, error } = authState;

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">AI Banking</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {error && (
          <AlertMessage type="error" message={error} onClose={clearError} />
        )}

        <RegisterForm />

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
