import React, { useEffect, useState } from 'react';
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ShoppingCart as EbayIcon,
  Facebook as FacebookIcon,
  Store as StoreIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Link as LinkIcon,
  Storefront as StorefrontIcon,
  Palette as EtsyIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface MarketplaceSelectorProps {
  selectedMarketplaces: string[];
  onSelectionChange: (marketplaces: string[]) => void;
}

interface Marketplace {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  autoPublish: boolean;
  connected: boolean;
  requiresAuth: boolean;
}

const MarketplaceSelector: React.FC<MarketplaceSelectorProps> = ({
  selectedMarketplaces,
  onSelectionChange,
}) => {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([
    {
      id: 'ebay',
      name: 'eBay',
      description: 'Auto-publish if connected, copy/paste if not',
      icon: <EbayIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: true,
    },
    {
      id: 'facebook',
      name: 'Facebook Marketplace',
      description: 'Copy & paste instructions provided',
      icon: <FacebookIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: false,
    },
    {
      id: 'craigslist',
      name: 'Craigslist',
      description: 'Copy & paste instructions provided',
      icon: <StoreIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: false,
    },
    {
      id: 'offerup',
      name: 'OfferUp',
      description: 'Copy & paste instructions provided',
      icon: <ShippingIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: false,
    },
    {
      id: 'mercari',
      name: 'Mercari',
      description: 'Copy & paste instructions provided',
      icon: <StorefrontIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: false,
    },
    {
      id: 'etsy',
      name: 'Etsy',
      description: 'Auto-publish if connected, copy/paste if not',
      icon: <EtsyIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: true,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConnectedMarketplaces();
  }, []);

  const loadConnectedMarketplaces = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getConnectedMarketplaces();
      const connectedMarketplaces = response.data.data || response.data;

      setMarketplaces((prev) =>
        prev.map((marketplace) => {
          const connected = connectedMarketplaces.find(
            (cm: any) => cm.marketplace.toLowerCase() === marketplace.id
          );

          return {
            ...marketplace,
            connected: !!connected,
            autoPublish: !!connected && marketplace.requiresAuth,
          };
        })
      );
    } catch (err: any) {
      // If endpoint doesn't exist or no marketplaces connected, that's okay
      console.log('No connected marketplaces or endpoint not available');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (marketplaceId: string) => {
    const newSelection = selectedMarketplaces.includes(marketplaceId)
      ? selectedMarketplaces.filter((id) => id !== marketplaceId)
      : [...selectedMarketplaces, marketplaceId];

    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange(marketplaces.map((m) => m.id));
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  const handleConnect = (marketplaceId: string) => {
    // Navigate to marketplace OAuth flow
    window.location.href = `/api/v1/marketplaces/${marketplaceId}/connect`;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Select which marketplaces to publish to
        </Typography>
        <Box>
          <Button size="small" onClick={handleSelectAll} sx={{ mr: 1 }}>
            Select All
          </Button>
          <Button size="small" onClick={handleDeselectAll}>
            Deselect All
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {marketplaces.map((marketplace) => (
          <Grid item xs={12} sm={6} key={marketplace.id}>
            <Paper
              sx={{
                p: 2,
                border: 2,
                borderColor: selectedMarketplaces.includes(marketplace.id)
                  ? 'primary.main'
                  : 'divider',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => handleToggle(marketplace.id)}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Checkbox
                  checked={selectedMarketplaces.includes(marketplace.id)}
                  onChange={() => handleToggle(marketplace.id)}
                  sx={{ p: 0, mr: 2 }}
                />

                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ mr: 1, color: 'primary.main' }}>{marketplace.icon}</Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {marketplace.name}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {marketplace.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {marketplace.connected && (
                      <Chip
                        size="small"
                        icon={<CheckIcon />}
                        label="Connected"
                        color="success"
                        variant="outlined"
                      />
                    )}

                    {marketplace.autoPublish && (
                      <Chip
                        size="small"
                        label="Auto-publish"
                        color="primary"
                        variant="outlined"
                      />
                    )}

                    {!marketplace.autoPublish && (
                      <Chip
                        size="small"
                        label="Copy/Paste"
                        color="default"
                        variant="outlined"
                      />
                    )}

                    {marketplace.requiresAuth && !marketplace.connected && (
                      <Button
                        size="small"
                        startIcon={<LinkIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(marketplace.id);
                        }}
                        sx={{ ml: 'auto' }}
                      >
                        Connect
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {selectedMarketplaces.length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Selected {selectedMarketplaces.length} marketplace{selectedMarketplaces.length !== 1 ? 's' : ''}
        </Alert>
      )}
    </Box>
  );
};

export default MarketplaceSelector;
