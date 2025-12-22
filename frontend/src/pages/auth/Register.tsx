import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  CircularProgress,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  registerStart,
  registerSuccess,
  registerFailure,
  clearError,
} from '../../store/slices/authSlice';
import api from '../../services/api';
import { RootState } from '../../store';

interface PasswordStrength {
  score: number;
  label: string;
  color: 'error' | 'warning' | 'info' | 'success';
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  // Get referral code from URL if present
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const calculatePasswordStrength = (pass: string): PasswordStrength => {
    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /\d/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    let score = 0;
    let label = '';
    let color: 'error' | 'warning' | 'info' | 'success' = 'error';

    if (passedChecks <= 1) {
      score = 20;
      label = 'Very Weak';
      color = 'error';
    } else if (passedChecks === 2) {
      score = 40;
      label = 'Weak';
      color = 'error';
    } else if (passedChecks === 3) {
      score = 60;
      label = 'Fair';
      color = 'warning';
    } else if (passedChecks === 4) {
      score = 80;
      label = 'Good';
      color = 'info';
    } else {
      score = 100;
      label = 'Strong';
      color = 'success';
    }

    return { score, label, color, checks };
  };

  const passwordStrength = password ? calculatePasswordStrength(password) : null;

  const validateForm = () => {
    const errors: {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      terms?: string;
    } = {};

    // Username validation
    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength && passwordStrength.score < 60) {
      errors.password = 'Password is too weak. Please make it stronger.';
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!acceptTerms) {
      errors.terms = 'You must accept the Terms of Service and Privacy Policy';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    dispatch(registerStart());

    try {
      const response = await api.register(
        username,
        email,
        password,
        referralCode || undefined
      );

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store auth data
        dispatch(registerSuccess({ user, token }));

        // Navigate to onboarding
        navigate('/onboarding', {
          state: { message: 'Account created successfully! Welcome to QuickSell.' },
        });
      } else {
        dispatch(registerFailure(response.data.error || 'Registration failed'));
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      dispatch(registerFailure(errorMessage));
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth
    dispatch(registerFailure('Google Sign-Up coming soon! Please use email/password for now.'));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Back to Home */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            Back to Home
          </Button>

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Start Selling Today
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Create your account and list your first item in 30 seconds
            </Typography>
          </Box>

          {/* Free Plan Badge */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Chip
              label="✨ Free Forever Plan - No Credit Card Required"
              color="success"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          {/* Referral Badge */}
          {referralCode && (
            <Alert severity="info" sx={{ mb: 2 }}>
              🎁 You're signing up with a referral code! You'll get 5 free credits.
            </Alert>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (validationErrors.username) {
                  setValidationErrors({ ...validationErrors, username: undefined });
                }
              }}
              error={!!validationErrors.username}
              helperText={validationErrors.username || 'This will be your display name'}
              margin="normal"
              autoComplete="username"
              autoFocus
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors({ ...validationErrors, email: undefined });
                }
              }}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              margin="normal"
              autoComplete="email"
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) {
                  setValidationErrors({ ...validationErrors, password: undefined });
                }
              }}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              margin="normal"
              autoComplete="new-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Strength Indicator */}
            {password && passwordStrength && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="textSecondary">
                    Password Strength:
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" color={`${passwordStrength.color}.main`}>
                    {passwordStrength.label}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength.score}
                  color={passwordStrength.color}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  <Chip
                    size="small"
                    icon={passwordStrength.checks.length ? <CheckIcon /> : <CancelIcon />}
                    label="8+ chars"
                    color={passwordStrength.checks.length ? 'success' : 'default'}
                    variant={passwordStrength.checks.length ? 'filled' : 'outlined'}
                  />
                  <Chip
                    size="small"
                    icon={passwordStrength.checks.uppercase ? <CheckIcon /> : <CancelIcon />}
                    label="Uppercase"
                    color={passwordStrength.checks.uppercase ? 'success' : 'default'}
                    variant={passwordStrength.checks.uppercase ? 'filled' : 'outlined'}
                  />
                  <Chip
                    size="small"
                    icon={passwordStrength.checks.number ? <CheckIcon /> : <CancelIcon />}
                    label="Number"
                    color={passwordStrength.checks.number ? 'success' : 'default'}
                    variant={passwordStrength.checks.number ? 'filled' : 'outlined'}
                  />
                  <Chip
                    size="small"
                    icon={passwordStrength.checks.special ? <CheckIcon /> : <CancelIcon />}
                    label="Special"
                    color={passwordStrength.checks.special ? 'success' : 'default'}
                    variant={passwordStrength.checks.special ? 'filled' : 'outlined'}
                  />
                </Box>
              </Box>
            )}

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (validationErrors.confirmPassword) {
                  setValidationErrors({ ...validationErrors, confirmPassword: undefined });
                }
              }}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              margin="normal"
              autoComplete="new-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Referral Code (Optional) */}
            <TextField
              fullWidth
              label="Referral Code (Optional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              margin="normal"
              disabled={loading || !!searchParams.get('ref')}
              helperText="Have a referral code? Enter it to get 5 free credits!"
            />

            {/* Terms Checkbox */}
            <Box sx={{ my: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      if (validationErrors.terms) {
                        setValidationErrors({ ...validationErrors, terms: undefined });
                      }
                    }}
                    disabled={loading}
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link to="/legal/terms" target="_blank" style={{ color: '#667eea' }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/legal/privacy" target="_blank" style={{ color: '#667eea' }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                }
              />
              {validationErrors.terms && (
                <Typography variant="caption" color="error" sx={{ ml: 4 }}>
                  {validationErrors.terms}
                </Typography>
              )}
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Free Account'}
            </Button>
          </form>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="textSecondary">
              OR
            </Typography>
          </Divider>

          {/* Google OAuth */}
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignup}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Sign Up with Google
          </Button>

          {/* Sign In Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default RegisterPage;
