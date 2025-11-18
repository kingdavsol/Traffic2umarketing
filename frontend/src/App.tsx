import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/Landing';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import DashboardPage from './pages/Dashboard';
import CreateListingPage from './pages/listings/CreateListing';
import ListingsPage from './pages/listings/Listings';
import ListingDetailPage from './pages/listings/ListingDetail';
import SalesPage from './pages/sales/Sales';
import GamificationPage from './pages/gamification/Gamification';
import SettingsPage from './pages/settings/Settings';
import PricingPage from './pages/Pricing';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings"
          element={
            <ProtectedRoute>
              <ListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/create"
          element={
            <ProtectedRoute>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/:id"
          element={
            <ProtectedRoute>
              <ListingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gamification"
          element={
            <ProtectedRoute>
              <GamificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
