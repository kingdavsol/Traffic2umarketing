/**
 * Bulk Marketplace Signup Page
 * Allows users to connect individual marketplace accounts with their specific credentials
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Link,
  IconButton,
  Collapse,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  OpenInNew as OpenInNewIcon,
  Visibility,
  VisibilityOff,
  ConnectWithoutContact as ConnectIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../services/api';
import logger from '../config/logger';

interface MarketplaceOption {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: number;
  active: boolean;
  connected?: boolean;
  hasApi?: boolean;
  signupUrl?: string;
}

interface MarketplaceCredentials {
  [marketplaceId: string]: {
    email: string;
    password: string;
    showPassword: boolean;
  };
}

interface SignupResult {
  marketplace: string;
  status: 'success' | 'failed' | 'pending_oauth';
  message: string;
  error?: string;
}

// Marketplace signup URLs
const MARKETPLACE_SIGNUP_URLS: Record<string, string> = {
  'eBay': 'https://signup.ebay.com/pa/crte',
  'Facebook': 'https://www.facebook.com/marketplace',
  'Craigslist': 'https://accounts.craigslist.org/login',
  'Mercari': 'https://www.mercari.com/signup/',
  'Poshmark': 'https://poshmark.com/signup',
  'Etsy': 'https://www.etsy.com/join',
  'Depop': 'https://www.depop.com/signup/',
  'Vinted': 'https://www.vinted.com/signup',
  'OfferUp': 'https://offerup.com/signup',
};

export const BulkMarketplaceSignup: React.FC = () => {
  const auth = useSelector((state: any) => state.auth);
  const [availableMarketplaces, setAvailableMarketplaces] = useState<MarketplaceOption[]>([]);
  const [credentials, setCredentials] = useState<MarketplaceCredentials>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<SignupResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(true);

  useEffect(() => {
    loadMarketplaces();
  }, []);

  const loadMarketplaces = async () => {
    try {
      setLoading(true);
      const response = await api.getAvailableMarketplaces();
      if (response.data.success) {
        const marketplaces = response.data.data;
        setAvailableMarketplaces(marketplaces);

        // Initialize credentials state for each marketplace
        const initialCredentials: MarketplaceCredentials = {};
        marketplaces.forEach((m: MarketplaceOption) => {
          initialCredentials[m.id] = {
            email: '',
            password: '',
            showPassword: false,
          };
        });
        setCredentials(initialCredentials);
      }
    } catch (err) {
      logger.error('Failed to load marketplaces:', err);
      setError('Failed to load available marketplaces');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialChange = (
    marketplaceId: string,
    field: 'email' | 'password',
    value: string
  ) => {
    setCredentials((prev) => ({
      ...prev,
      [marketplaceId]: {
        ...prev[marketplaceId],
        [field]: value,
      },
    }));
  };

  const togglePasswordVisibility = (marketplaceId: string) => {
    setCredentials((prev) => ({
      ...prev,
      [marketplaceId]: {
        ...prev[marketplaceId],
        showPassword: !prev[marketplaceId].showPassword,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Filter marketplaces that have both email and password
    const marketplacesToConnect = Object.entries(credentials)
      .filter(([_, creds]) => creds.email && creds.password)
      .map(([marketplaceId, creds]) => ({
        marketplace: marketplaceId,
        email: creds.email,
        password: creds.password,
      }));

    if (marketplacesToConnect.length === 0) {
      setError('Please enter credentials for at least one marketplace');
      return;
    }

    // Validate emails
    for (const mp of marketplacesToConnect) {
      if (!mp.email.includes('@')) {
        setError(`Invalid email address for ${mp.marketplace}`);
        return;
      }
      if (mp.password.length < 6) {
        setError(`Password for ${mp.marketplace} must be at least 6 characters`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await api.post('/marketplaces/bulk-connect', {
        marketplaces: marketplacesToConnect,
      });

      if (response.data.success) {
        setResults(response.data.data.results);
        setShowResults(true);
        setSuccessMessage(
          `Successfully connected ${response.data.data.successCount} marketplace(s)`
        );

        // Clear credentials for successfully connected marketplaces
        const newCredentials = { ...credentials };
        response.data.data.results.forEach((result: SignupResult) => {
          if (result.status === 'success') {
            newCredentials[result.marketplace] = {
              email: '',
              password: '',
              showPassword: false,
            };
          }
        });
        setCredentials(newCredentials);

        // Reload marketplace list to show updated connection status
        loadMarketplaces();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to connect to marketplaces';
      setError(errorMessage);
      logger.error('Bulk connect error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getFilledCount = () => {
    return Object.values(credentials).filter((c) => c.email && c.password).length;
  };

  const getResultIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onClose={() => setShowInfoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          How This Works
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            <strong>Important:</strong> You need to have existing accounts on the marketplaces you want to connect.
          </Typography>
          <Typography variant="body2" paragraph>
            Enter your login credentials for each marketplace below. We'll securely store them (encrypted) so Quicksell can post listings to those marketplaces on your behalf.
          </Typography>
          <Typography variant="body2" paragraph>
            Don't have an account on a marketplace? Click the "Sign Up" link next to it to create one first.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your credentials are encrypted with AES-256 encryption and never shared with third parties.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInfoDialog(false)} variant="contained">
            Got It
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ConnectIcon /> Connect Marketplace Accounts
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Enter your existing marketplace login credentials below. Each marketplace requires its own account.
          <Button
            size="small"
            startIcon={<InfoIcon />}
            onClick={() => setShowInfoDialog(true)}
            sx={{ ml: 1 }}
          >
            How this works
          </Button>
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Marketplace</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Password</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableMarketplaces.map((marketplace) => (
                <TableRow
                  key={marketplace.id}
                  sx={{
                    '&:hover': { backgroundColor: 'action.hover' },
                    backgroundColor: marketplace.connected ? 'success.light' : 'inherit',
                    opacity: marketplace.connected ? 0.7 : 1,
                  }}
                >
                  {/* Marketplace Name */}
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {marketplace.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {marketplace.description}
                      </Typography>
                      {MARKETPLACE_SIGNUP_URLS[marketplace.id] && (
                        <Box sx={{ mt: 0.5 }}>
                          <Link
                            href={MARKETPLACE_SIGNUP_URLS[marketplace.id]}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            Don't have an account? Sign up
                            <OpenInNewIcon sx={{ fontSize: 12 }} />
                          </Link>
                        </Box>
                      )}
                    </Box>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <Chip
                      label={marketplace.hasApi ? 'Auto-publish' : 'Copy/Paste'}
                      size="small"
                      color={marketplace.hasApi ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>

                  {/* Email Field */}
                  <TableCell>
                    <TextField
                      size="small"
                      type="email"
                      placeholder="your@email.com"
                      value={credentials[marketplace.id]?.email || ''}
                      onChange={(e) =>
                        handleCredentialChange(marketplace.id, 'email', e.target.value)
                      }
                      disabled={submitting || marketplace.connected}
                      fullWidth
                      sx={{ minWidth: 200 }}
                    />
                  </TableCell>

                  {/* Password Field */}
                  <TableCell>
                    <TextField
                      size="small"
                      type={credentials[marketplace.id]?.showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={credentials[marketplace.id]?.password || ''}
                      onChange={(e) =>
                        handleCredentialChange(marketplace.id, 'password', e.target.value)
                      }
                      disabled={submitting || marketplace.connected}
                      fullWidth
                      sx={{ minWidth: 180 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => togglePasswordVisibility(marketplace.id)}
                              edge="end"
                            >
                              {credentials[marketplace.id]?.showPassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {marketplace.connected ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Connected"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip label="Not Connected" size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Submit Button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {getFilledCount()} marketplace{getFilledCount() !== 1 ? 's' : ''} ready to connect
          </Typography>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={submitting || getFilledCount() === 0}
            sx={{ minWidth: 200 }}
          >
            {submitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Connecting...
              </>
            ) : (
              `Connect ${getFilledCount()} Marketplace${getFilledCount() !== 1 ? 's' : ''}`
            )}
          </Button>
        </Box>
      </form>

      {/* Results Dialog */}
      <Dialog open={showResults} onClose={() => setShowResults(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Connection Results</DialogTitle>
        <DialogContent>
          {results.map((result) => (
            <Card key={result.marketplace} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {getResultIcon(result.status)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {result.marketplace}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {result.message}
                    </Typography>
                    {result.status === 'failed' && result.error && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        Error: {result.error}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResults(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BulkMarketplaceSignup;
