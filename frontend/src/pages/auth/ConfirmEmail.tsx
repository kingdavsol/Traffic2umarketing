import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import api from '../../services/api';

const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check the link in your email.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.verifyEmail(token);
      setStatus('success');
      setMessage(response.data?.message || 'Email verified successfully!');
    } catch (err: any) {
      setStatus('error');
      setMessage(
        err.response?.data?.error ||
        'Failed to verify email. The token may be invalid or expired.'
      );
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
            textAlign: 'center',
          }}
        >
          <Box sx={{ mb: 3 }}>
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
              Email Verification
            </Typography>
          </Box>

          {status === 'loading' && (
            <Box sx={{ py: 4 }}>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Verifying your email address...
              </Typography>
            </Box>
          )}

          {status === 'success' && (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                {message}
              </Alert>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Your email has been verified. You can now access all features of QuickSell.
              </Typography>
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
            </>
          )}

          {status === 'error' && (
            <>
              <Alert severity="error" sx={{ mb: 3 }}>
                {message}
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  component={Link}
                  to="/auth/login"
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    },
                  }}
                >
                  Go to Login
                </Button>
                <Button
                  component={Link}
                  to="/dashboard"
                  variant="outlined"
                >
                  Go to Dashboard
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ConfirmEmail;
