import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  LinearProgress,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as SalesIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  ShowChart as ChartIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface Sale {
  id: number;
  listing_id: number;
  listing_title: string;
  marketplace: string;
  sale_price: number;
  sale_date: string;
  buyer_name?: string;
  status: string;
  category?: string;
}

interface SalesStats {
  totalEarnings: number;
  totalSales: number;
  activeListings: number;
  averageSalePrice: number;
}

interface MarketplaceBreakdown {
  marketplace: string;
  sales: number;
  earnings: number;
}

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStats>({
    totalEarnings: 0,
    totalSales: 0,
    activeListings: 0,
    averageSalePrice: 0,
  });
  const [marketplaceBreakdown, setMarketplaceBreakdown] = useState<MarketplaceBreakdown[]>([]);
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state for manual entry
  const [newSale, setNewSale] = useState({
    listing_title: '',
    marketplace: '',
    sale_price: '',
    sale_date: new Date().toISOString().split('T')[0],
    buyer_name: '',
    category: '',
  });

  useEffect(() => {
    loadSales();
  }, [timeRange]);

  const loadSales = async () => {
    setLoading(true);
    try {
      // Load sales from API
      const salesResponse = await api.getSales();
      const allSales = salesResponse.data?.data?.sales || salesResponse.data || [];

      // Filter by time range
      const filteredSales = filterSalesByTimeRange(allSales, timeRange);
      setSales(filteredSales);

      // Calculate stats
      const earnings = filteredSales.reduce((sum: number, sale: Sale) => sum + sale.sale_price, 0);
      const avgPrice = filteredSales.length > 0 ? earnings / filteredSales.length : 0;

      // Get active listings count
      let activeCount = 0;
      try {
        const listingsResponse = await api.getListings(1, 100);
        const listings = listingsResponse.data?.data?.listings || [];
        activeCount = listings.filter((l: any) => l.status === 'published').length;
      } catch (err) {
        console.error('Failed to load listings:', err);
      }

      setStats({
        totalEarnings: earnings,
        totalSales: filteredSales.length,
        activeListings: activeCount,
        averageSalePrice: avgPrice,
      });

      // Calculate marketplace breakdown
      const breakdown = calculateMarketplaceBreakdown(filteredSales);
      setMarketplaceBreakdown(breakdown);
    } catch (err) {
      console.error('Failed to load sales:', err);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSalesByTimeRange = (allSales: Sale[], range: string): Sale[] => {
    if (range === 'all') return allSales;

    const days = parseInt(range);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return allSales.filter((sale) => new Date(sale.sale_date) >= cutoffDate);
  };

  const calculateMarketplaceBreakdown = (salesData: Sale[]): MarketplaceBreakdown[] => {
    const breakdown: { [key: string]: MarketplaceBreakdown } = {};

    salesData.forEach((sale) => {
      const marketplace = sale.marketplace || 'Other';
      if (!breakdown[marketplace]) {
        breakdown[marketplace] = {
          marketplace,
          sales: 0,
          earnings: 0,
        };
      }
      breakdown[marketplace].sales += 1;
      breakdown[marketplace].earnings += sale.sale_price;
    });

    return Object.values(breakdown).sort((a, b) => b.earnings - a.earnings);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSale({
      ...newSale,
      [e.target.name]: e.target.value,
    });
  };

  const handleMarketplaceChange = (value: string) => {
    setNewSale({
      ...newSale,
      marketplace: value,
    });
  };

  const handleSubmit = async () => {
    if (!newSale.listing_title || !newSale.marketplace || !newSale.sale_price) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Submit manual sale entry
      await api.post('/sales/manual', {
        listing_title: newSale.listing_title,
        marketplace: newSale.marketplace,
        sale_price: parseFloat(newSale.sale_price),
        sale_date: newSale.sale_date,
        buyer_name: newSale.buyer_name,
        category: newSale.category,
        status: 'completed',
      });

      setSuccess(true);
      setOpenDialog(false);

      // Reset form
      setNewSale({
        listing_title: '',
        marketplace: '',
        sale_price: '',
        sale_date: new Date().toISOString().split('T')[0],
        buyer_name: '',
        category: '',
      });

      // Reload sales
      await loadSales();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add sale');
    }
  };

  const handleExportCSV = () => {
    if (sales.length === 0) {
      setError('No sales data to export');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const headers = ['Date', 'Item', 'Marketplace', 'Buyer', 'Amount', 'Status'];
    const rows = sales.map((sale) => [
      formatDate(sale.sale_date),
      sale.listing_title,
      sale.marketplace,
      sale.buyer_name || 'N/A',
      sale.sale_price.toFixed(2),
      sale.status,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-${timeRange}days-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Sales Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Track your earnings and sales performance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            Add Manual Sale
          </Button>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          Sale added successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Time Range Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(e, newValue) => newValue && setTimeRange(newValue)}
          aria-label="time range"
        >
          <ToggleButton value="7">Last 7 Days</ToggleButton>
          <ToggleButton value="30">Last 30 Days</ToggleButton>
          <ToggleButton value="90">Last 90 Days</ToggleButton>
          <ToggleButton value="all">All Time</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Total Earnings
                      </Typography>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                        {formatCurrency(stats.totalEarnings)}
                      </Typography>
                    </Box>
                    <MoneyIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.2 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Items Sold
                      </Typography>
                      <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                        {stats.totalSales}
                      </Typography>
                    </Box>
                    <SalesIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.2 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Average Sale
                      </Typography>
                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                        {formatCurrency(stats.averageSalePrice)}
                      </Typography>
                    </Box>
                    <ChartIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.2 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Active Listings
                      </Typography>
                      <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                        {stats.activeListings}
                      </Typography>
                    </Box>
                    <TrendingIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.2 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Marketplace Breakdown */}
          {marketplaceBreakdown.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TagIcon /> Marketplace Performance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {marketplaceBreakdown.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {item.marketplace}
                          </Typography>
                          <Typography variant="body2" color="success.main" fontWeight={600}>
                            {formatCurrency(item.earnings)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(item.earnings / stats.totalEarnings) * 100}
                          sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="textSecondary">
                            {item.sales} sales
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {((item.earnings / stats.totalEarnings) * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Sales Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Sales
              </Typography>

              {sales.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    bgcolor: '#f9fafb',
                    border: '2px dashed #e0e0e0',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No sales yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Add your first sale using the button above
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    Add First Sale
                  </Button>
                </Paper>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Item</TableCell>
                        <TableCell>Marketplace</TableCell>
                        <TableCell>Buyer</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale.id} hover>
                          <TableCell>{formatDate(sale.sale_date)}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{sale.listing_title}</TableCell>
                          <TableCell>
                            <Chip label={sale.marketplace} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>{sale.buyer_name || 'N/A'}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {formatCurrency(sale.sale_price)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={sale.status.toUpperCase()}
                              size="small"
                              color={sale.status === 'completed' ? 'success' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Manual Sale Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Manual Sale</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Manually record a sale that happened outside the app or on a marketplace without API integration.
          </Typography>

          <TextField
            fullWidth
            label="Item Title *"
            name="listing_title"
            value={newSale.listing_title}
            onChange={handleInputChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Marketplace *</InputLabel>
            <Select
              value={newSale.marketplace}
              label="Marketplace *"
              onChange={(e: SelectChangeEvent) => handleMarketplaceChange(e.target.value)}
            >
              <MenuItem value="eBay">eBay</MenuItem>
              <MenuItem value="Etsy">Etsy</MenuItem>
              <MenuItem value="Facebook">Facebook Marketplace</MenuItem>
              <MenuItem value="Craigslist">Craigslist</MenuItem>
              <MenuItem value="OfferUp">OfferUp</MenuItem>
              <MenuItem value="Mercari">Mercari</MenuItem>
              <MenuItem value="Poshmark">Poshmark</MenuItem>
              <MenuItem value="Depop">Depop</MenuItem>
              <MenuItem value="Amazon">Amazon</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Sale Price *"
            name="sale_price"
            type="number"
            value={newSale.sale_price}
            onChange={handleInputChange}
            required
            InputProps={{ startAdornment: <Box sx={{ mr: 1 }}>$</Box> }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Sale Date"
            name="sale_date"
            type="date"
            value={newSale.sale_date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Category (Optional)"
            name="category"
            value={newSale.category}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Buyer Name (Optional)"
            name="buyer_name"
            value={newSale.buyer_name}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Add Sale
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Sales;
