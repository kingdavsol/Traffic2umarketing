import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      await api.requestPasswordReset(email);
      setSuccess('If an account exists with this email, you will receive a password reset link shortly.');
      setEmail('');
    } catch (err: any) {
      // Don't reveal if email exists or not for security
      setSuccess('If an account exists with this email, you will receive a password reset link shortly.');
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
              Reset Password
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your email and we'll send you a reset link
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
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
              {loading ? 'Sending...' : 'Send Reset Link'}
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
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
