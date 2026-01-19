import React, { useEffect, useMemo, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme, CircularProgress, Box } from '@mui/material';

// Non-lazy imports (needed immediately)
import { TermsOfService, PrivacyPolicy, CookiePolicy } from './pages/legal';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';

// Redux
import { RootState } from './store';
import { initializeAuth } from './store/slices/authSlice';

// Analytics
import { initializePostHog, identifyUser } from './lib/posthog';

// Styles
import './styles/App.css';

// Lazy-loaded Pages (code splitting for better performance)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const Dashboard = lazy(() => import('./pages/DashboardPage'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const ListingDetails = lazy(() => import('./pages/ListingDetails'));
const MyListings = lazy(() => import('./pages/MyListings'));
const Sales = lazy(() => import('./pages/Sales'));
const Gamification = lazy(() => import('./pages/Gamification'));
const Settings = lazy(() => import('./pages/Settings'));
const BulkMarketplaceSignup = lazy(() => import('./pages/BulkMarketplaceSignup'));
const Referrals = lazy(() => import('./pages/Referrals'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const GoogleCallback = lazy(() => import('./pages/auth/GoogleCallback'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Create theme function with QuickSell branding (supports dark mode)
const createAppTheme = (darkMode: boolean) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#007AFF', // QuickSell Blue
      light: '#4DA3FF',
      dark: '#0056D4',
    },
    secondary: {
      main: '#FF6B6B', // Monster Red
      light: '#FF8888',
      dark: '#E41A1A',
    },
    success: {
      main: darkMode ? '#4CAF50' : '#FFD700', // Use green in dark mode for better visibility
    },
    background: {
      default: darkMode ? '#121212' : '#F5F7FF',
      paper: darkMode ? '#1E1E1E' : '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Tahoma, Geneva, Verdana, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector(
    (state: RootState) => state.auth
  );
  const darkMode = useSelector((state: RootState) => state.ui.darkMode);

  // Memoize theme to prevent unnecessary re-renders
  const theme = useMemo(() => createAppTheme(darkMode), [darkMode]);

  useEffect(() => {
    // Initialize PostHog analytics
    initializePostHog();

    // Initialize auth state from localStorage on app mount
    dispatch(initializeAuth());
  }, [dispatch]);

  // Identify user in PostHog when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      identifyUser(user.id, {
        email: user.email,
        username: user.username,
      });
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader">
          <svg className="monster-loader" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="95" fill="#007AFF" opacity="0.1" stroke="#007AFF" strokeWidth="2" />
            <ellipse cx="100" cy="110" rx="45" ry="50" fill="#FF6B6B" className="bounce" />
            <circle cx="100" cy="60" r="40" fill="#FF6B6B" />
            <circle cx="85" cy="50" r="8" fill="#FFFFFF" />
            <circle cx="85" cy="50" r="5" fill="#000000" />
            <circle cx="115" cy="50" r="8" fill="#FFFFFF" />
            <circle cx="115" cy="50" r="5" fill="#000000" />
            <path d="M 85 70 Q 100 80 115 70" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
          <p>Loading QuickSell...</p>
        </div>
      </div>
    );
  }

  // Loading fallback for lazy-loaded components
  const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/auth/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/auth/callback" element={<GoogleCallback />} />
            <Route path="/auth/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
            <Route path="/auth/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
            <Route path="/login" element={<Navigate to="/auth/login" />} />
            <Route path="/register" element={<Navigate to="/auth/register" />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/create-listing" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
            <Route path="/listings" element={<PrivateRoute><MyListings /></PrivateRoute>} />
            <Route path="/listing/:id" element={<PrivateRoute><ListingDetails /></PrivateRoute>} />
            <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
            <Route path="/gamification" element={<PrivateRoute><Gamification /></PrivateRoute>} />
            <Route path="/referrals" element={<PrivateRoute><Referrals /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/connect-marketplaces" element={<Navigate to="/settings?tab=marketplaces" />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/legal/terms-of-service" element={<TermsOfService />} />
            <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          </Suspense>
          <ToastContainer />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
