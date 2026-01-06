import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Link as LinkIcon,
  LinkOff as UnlinkIcon,
  CheckCircle as ConnectedIcon,
  Facebook as FacebookIcon,
  ShoppingCart as EbayIcon,
  Palette as EtsyIcon,
  Store as StoreIcon,
  Storefront as StorefrontIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface ConnectedMarketplace {
  marketplace: string;
  accountName: string;
  isActive: boolean;
  autoSyncEnabled: boolean;
  lastSync?: string;
}

interface Marketplace {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiresAuth: boolean;
  hasAPI: boolean;
  connected: boolean;
  accountName?: string;
}

const MarketplaceSettings: React.FC = () => {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disconnectDialog, setDisconnectDialog] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connectDialog, setConnectDialog] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultMarketplaces: Marketplace[] = [
    {
      id: 'ebay',
      name: 'eBay',
      description: 'Auto-publish listings to eBay',
      icon: <EbayIcon />,
      requiresAuth: true,
      hasAPI: true,
      connected: false,
    },
    {
      id: 'etsy',
      name: 'Etsy',
      description: 'Auto-publish listings to your Etsy shop',
      icon: <EtsyIcon />,
      requiresAuth: true,
      hasAPI: true,
      connected: false,
    },
    {
      id: 'facebook',
      name: 'Facebook Marketplace',
      description: 'Copy & paste listings manually',
      icon: <FacebookIcon />,
      requiresAuth: false,
      hasAPI: false,
      connected: false,
    },
    {
      id: 'craigslist',
      name: 'Craigslist',
      description: 'Copy & paste listings manually',
      icon: <StoreIcon />,
      requiresAuth: false,
      hasAPI: false,
      connected: false,
    },
    {
      id: 'offerup',
      name: 'OfferUp',
      description: 'Copy & paste listings manually',
      icon: <ShippingIcon />,
      requiresAuth: false,
      hasAPI: false,
      connected: false,
    },
    {
      id: 'mercari',
      name: 'Mercari',
      description: 'Copy & paste listings manually',
      icon: <StorefrontIcon />,
      requiresAuth: false,
      hasAPI: false,
      connected: false,
    },
  ];

  useEffect(() => {
    loadConnectedMarketplaces();
  }, []);

  const loadConnectedMarketplaces = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getConnectedMarketplaces();
      const connectedMarketplaces: ConnectedMarketplace[] = response.data;

      // Update marketplace list with connection status
      const updatedMarketplaces = defaultMarketplaces.map((marketplace) => {
        const connected = connectedMarketplaces.find(
          (cm) => cm.marketplace.toLowerCase() === marketplace.id
        );

        return {
          ...marketplace,
          connected: !!connected,
          accountName: connected?.accountName,
        };
      });

      setMarketplaces(updatedMarketplaces);
    } catch (err: any) {
      console.error('Failed to load connected marketplaces:', err);
      // If endpoint doesn't exist, just show default list
      setMarketplaces(defaultMarketplaces);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (marketplaceId: string, requiresAuth: boolean) => {
    if (requiresAuth) {
      // Redirect to OAuth flow for eBay, Etsy
      window.location.href = `/api/v1/marketplaces/${marketplaceId}/connect`;
    } else {
      // Open dialog for manual credentials (Craigslist, Facebook, OfferUp, Mercari)
      setConnectDialog(marketplaceId);
      setCredentials({ email: '', password: '' });
    }
  };

  const handleManualConnect = async () => {
    if (!connectDialog) return;

    if (!credentials.email || !credentials.password) {
      setError('Please enter both email/username and password');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      await api.post(`/api/v1/marketplaces/${connectDialog}/connect`, {
        email: credentials.email,
        password: credentials.password,
      });

      // Reload connected marketplaces
      await loadConnectedMarketplaces();
      setConnectDialog(null);
      setCredentials({ email: '', password: '' });
      setSuccessMessage(`Successfully connected to ${connectDialog}!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Marketplace connection error:', err);

      // Handle different error cases
      if (err.response?.status === 401) {
        setError('You must be logged in to connect marketplaces. Please log in and try again.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || 'Invalid credentials. Please check your email and password.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later or contact support.');
      } else {
        setError(err.response?.data?.error || 'Failed to connect marketplace. Please check your internet connection and try again.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (marketplaceId: string) => {
    setDisconnecting(true);
    setError(null);

    try {
      await api.post(`/api/v1/marketplaces/${marketplaceId}/disconnect`, {});

      // Reload connected marketplaces
      await loadConnectedMarketplaces();
      setDisconnectDialog(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to disconnect marketplace');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* SUPER OBVIOUS DEPLOYMENT BANNER */}
      <Alert
        severity="error"
        sx={{
          mb: 3,
          fontSize: '1.5rem',
          fontWeight: 'bold',
          bgcolor: '#ff0000',
          color: 'white',
          border: '5px solid #ffff00',
          animation: 'pulse 1s infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.02)' }
          }
        }}
      >
        ✅ NEW VERSION ACTIVE - JAN 6 2026 6:45PM - ALL ADMIN FEATURES ADDED!
      </Alert>

      <Typography variant="h5" gutterBottom>
        Connected Marketplaces
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Connect your marketplace accounts to save credentials securely and streamline your listing process.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>How to connect:</strong> Click the <strong>"Connect"</strong> button on any marketplace card below.
          For manual marketplaces (Craigslist, Facebook, OfferUp, Mercari), you'll enter your credentials which will be encrypted with AES-256.
          For OAuth marketplaces (eBay, Etsy), you'll be redirected to authenticate securely.
        </Typography>
      </Alert>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {marketplaces.map((marketplace) => (
          <Grid item xs={12} md={6} key={marketplace.id}>
            <Card
              sx={{
                height: '100%',
                border: marketplace.connected ? '2px solid #4caf50' : '1px solid #e0e0e0',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ color: 'primary.main', fontSize: 40 }}>
                      {marketplace.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {marketplace.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {marketplace.description}
                      </Typography>
                      {marketplace.connected && marketplace.accountName && (
                        <Typography variant="caption" color="success.main">
                          Connected: {marketplace.accountName}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {marketplace.connected ? (
                    <Chip
                      icon={<ConnectedIcon />}
                      label="Connected"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="Not Connected"
                      size="small"
                      variant="outlined"
                    />
                  )}

                  {marketplace.hasAPI ? (
                    <Chip
                      label="Auto-publish"
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label="Copy/Paste"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box sx={{ mt: 2 }}>
                  {!marketplace.connected && (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<LinkIcon />}
                      onClick={() => handleConnect(marketplace.id, marketplace.requiresAuth)}
                      fullWidth
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                    >
                      Connect {marketplace.name}
                    </Button>
                  )}

                  {marketplace.connected && (
                    <Button
                      variant="outlined"
                      size="large"
                      color="error"
                      startIcon={<UnlinkIcon />}
                      onClick={() => setDisconnectDialog(marketplace.id)}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Disconnect
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        open={disconnectDialog !== null}
        onClose={() => !disconnecting && setDisconnectDialog(null)}
      >
        <DialogTitle>Disconnect Marketplace?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to disconnect this marketplace? You won't be able to auto-publish listings until you reconnect.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisconnectDialog(null)} disabled={disconnecting}>
            Cancel
          </Button>
          <Button
            onClick={() => disconnectDialog && handleDisconnect(disconnectDialog)}
            color="error"
            variant="contained"
            disabled={disconnecting}
          >
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Connect Manual Marketplace Dialog */}
      <Dialog
        open={connectDialog !== null}
        onClose={() => !connecting && setConnectDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Connect to {connectDialog && marketplaces.find(m => m.id === connectDialog)?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your {connectDialog} account credentials. Your password will be encrypted and stored securely.
          </Typography>
          <TextField
            label="Email or Username"
            fullWidth
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            sx={{ mb: 2 }}
            disabled={connecting}
            autoComplete="username"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            disabled={connecting}
            autoComplete="current-password"
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              Your credentials are encrypted using AES-256 encryption and stored securely.
              They are only used to help you manage your listings.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectDialog(null)} disabled={connecting}>
            Cancel
          </Button>
          <Button
            onClick={handleManualConnect}
            variant="contained"
            disabled={connecting || !credentials.email || !credentials.password}
            startIcon={connecting ? <CircularProgress size={20} /> : <LinkIcon />}
          >
            {connecting ? 'Connecting...' : 'Connect'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarketplaceSettings;
