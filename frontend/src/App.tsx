import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth provider
import { AuthProvider } from "./contexts/AuthContext";

// Layout component
import Layout from "./components/layout/Layout";
import PrivateRoute from "./components/routing/PrivateRoute";
import AdminRoute from "./components/routing/AdminRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountsPage from "./pages/AccountsPage";
import AccountDetailsPage from "./pages/AccountDetailsPage";
import TransfersPage from "./pages/TransfersPage";
import LoansPage from "./pages/LoansPage";
import LoanApplication from "./pages/LoanApplication";
import InvestmentsPage from "./pages/InvestmentsPage";
import BudgetPage from "./pages/BudgetPage";
import SupportPage from "./pages/SupportPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route
                path="/accounts/:accountId"
                element={<AccountDetailsPage />}
              />
              <Route path="/transfers" element={<TransfersPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/loans/apply" element={<LoanApplication />} />
              <Route path="/investments" element={<InvestmentsPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          {/* Redirect from root to dashboard or login based on authentication */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
