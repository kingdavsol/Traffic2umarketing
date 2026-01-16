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
  LocationCity as NextdoorIcon,
  MusicNote as TikTokIcon,
  Checkroom as PoshmarkIcon,
  Instagram as InstagramIcon,
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
  url?: string; // URL to open marketplace app/site
  urlLabel?: string; // Label for the link button
}

const MarketplaceSelector: React.FC<MarketplaceSelectorProps> = ({
  selectedMarketplaces,
  onSelectionChange,
}) => {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([
    {
      id: 'tiktok',
      name: 'TikTok Shop',
      description: '🤖 Automated posting via API (requires connection)',
      icon: <TikTokIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: true,
      url: 'https://seller-us.tiktok.com',
      urlLabel: 'Open TikTok Seller Center',
    },
    {
      id: 'instagram',
      name: 'Instagram Shopping',
      description: '✋ Manual posting - Click to open Instagram app/site',
      icon: <InstagramIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: false,
      url: 'https://www.instagram.com',
      urlLabel: 'Open Instagram',
    },
    {
      id: 'ebay',
      name: 'eBay',
      description: '🤖 Automated posting via API (requires connection)',
      icon: <EbayIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: true,
      url: 'https://www.ebay.com/sh/lst/active',
      urlLabel: 'Open eBay Listings',
    },
    {
      id: 'facebook',
      name: 'Facebook Marketplace',
      description: '✋ Manual posting - Click to open Facebook Marketplace',
      icon: <FacebookIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: false,
      url: 'https://www.facebook.com/marketplace/create/item',
      urlLabel: 'Open Facebook Marketplace',
    },
    {
      id: 'craigslist',
      name: 'Craigslist',
      description: '🤖 Browser automation - Check email for verification link',
      icon: <StoreIcon />,
      autoPublish: true,
      connected: false,
      requiresAuth: false,
      url: 'https://accounts.craigslist.org/login',
      urlLabel: 'Open Craigslist',
    },
    {
      id: 'offerup',
      name: 'OfferUp',
      description: '✋ Manual posting - Click to open OfferUp app/site',
      icon: <ShippingIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: false,
      url: 'https://offerup.com/sell/',
      urlLabel: 'Open OfferUp',
    },
    {
      id: 'poshmark',
      name: 'Poshmark',
      description: '🤖 Browser automation (posts automatically when connected)',
      icon: <PoshmarkIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: true,
      url: 'https://poshmark.com/create-listing',
      urlLabel: 'Open Poshmark',
    },
    {
      id: 'mercari',
      name: 'Mercari',
      description: '✋ Manual posting - Click to open Mercari app/site',
      icon: <StorefrontIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: false,
      url: 'https://www.mercari.com/sell/',
      urlLabel: 'Open Mercari',
    },
    {
      id: 'nextdoor',
      name: 'Nextdoor',
      description: '✋ Local neighborhood - Click to open Nextdoor',
      icon: <NextdoorIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: false,
      url: 'https://nextdoor.com/sell/',
      urlLabel: 'Open Nextdoor',
    },
    {
      id: 'etsy',
      name: 'Etsy',
      description: '🤖 Automated posting via API (requires connection)',
      icon: <EtsyIcon />,
      autoPublish: false,
      connected: false,
      requiresAuth: true,
      url: 'https://www.etsy.com/your/shops/me/tools/listings',
      urlLabel: 'Open Etsy Shop',
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
                        label="🤖 Automated"
                        color="success"
                        variant="filled"
                      />
                    )}

                    {!marketplace.autoPublish && marketplace.id !== 'craigslist' && (
                      <Chip
                        size="small"
                        label="✋ Manual"
                        color="warning"
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

                    {marketplace.url && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(marketplace.url, '_blank');
                        }}
                        sx={{ ml: marketplace.requiresAuth && !marketplace.connected ? 1 : 'auto' }}
                      >
                        {marketplace.urlLabel || 'Open Site'}
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
