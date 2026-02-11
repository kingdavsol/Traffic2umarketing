import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import api from '../../services/api';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('No reset token found. Please check the link in your email.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!token) {
      setError('No reset token found. Please request a new password reset link.');
      setLoading(false);
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.resetPassword(token, newPassword);
      setSuccess(response.data?.message || 'Password reset successfully! You can now login with your new password.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        'Failed to reset password. The token may be invalid or expired.'
      );
    } finally {
      setLoading(false);
    }
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
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <svg
              width="60"
              height="60"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginBottom: '16px' }}
            >
              <rect width="64" height="64" fill="#007AFF" rx="8" />
              <circle cx="32" cy="22" r="11" fill="#FF6B6B" />
              <circle cx="27" cy="19" r="2.5" fill="#FFFFFF" />
              <circle cx="27" cy="19" r="1.2" fill="#000000" />
              <circle cx="37" cy="19" r="2.5" fill="#FFFFFF" />
              <circle cx="37" cy="19" r="1.2" fill="#000000" />
              <path
                d="M 26 26 Q 32 28 38 26"
                stroke="#000000"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
              />
              <ellipse cx="32" cy="38" rx="11" ry="13" fill="#FF6B6B" />
              <ellipse cx="32" cy="40" rx="6" ry="8" fill="#FFB3BA" opacity="0.8" />
            </svg>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Set New Password
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your new password below
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  component={Link}
                  to="/auth/login"
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    },
                  }}
                >
                  Go to Login
                </Button>
              </Box>
            </>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                autoFocus
                disabled={loading || !token}
                helperText="Must be at least 8 characters"
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                disabled={loading || !token}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !token}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  },
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link
                  to="/auth/login"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Back to Sign In
                </Link>
              </Box>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
