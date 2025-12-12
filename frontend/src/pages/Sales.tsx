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
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as SalesIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
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
}

interface SalesStats {
  totalEarnings: number;
  totalSales: number;
  activeListings: number;
}

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStats>({
    totalEarnings: 0,
    totalSales: 0,
    activeListings: 0,
  });
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
  });

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      // Load sales from API
      const salesResponse = await api.getSales();
      setSales(salesResponse.data || []);

      // Calculate stats
      const earnings = (salesResponse.data || []).reduce((sum: number, sale: Sale) => sum + sale.sale_price, 0);
      setStats({
        totalEarnings: earnings,
        totalSales: salesResponse.data?.length || 0,
        activeListings: 0, // TODO: Get from listings endpoint
      });
    } catch (err) {
      console.error('Failed to load sales:', err);
      setSales([]);
    } finally {
      setLoading(false);
    }
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
      const response = await api.post('/sales/manual', {
        listing_title: newSale.listing_title,
        marketplace: newSale.marketplace,
        sale_price: parseFloat(newSale.sale_price),
        sale_date: newSale.sale_date,
        buyer_name: newSale.buyer_name,
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
      });

      // Reload sales
      await loadSales();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add sale');
    }
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
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Sales</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Manual Sale
          </Button>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
            Sale added successfully!
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Earnings
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(stats.totalEarnings)}
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Items Sold
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {stats.totalSales}
                    </Typography>
                  </Box>
                  <SalesIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Active Listings
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      {stats.activeListings}
                    </Typography>
                  </Box>
                  <TrendingIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Sales Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Sales
            </Typography>

            {sales.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No sales yet. Add your first sale using the button above!
                </Typography>
              </Box>
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
                      <TableRow key={sale.id}>
                        <TableCell>{formatDate(sale.sale_date)}</TableCell>
                        <TableCell>{sale.listing_title}</TableCell>
                        <TableCell>
                          <Chip label={sale.marketplace} size="small" />
                        </TableCell>
                        <TableCell>{sale.buyer_name || 'N/A'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {formatCurrency(sale.sale_price)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={sale.status}
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

        {/* Add Manual Sale Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Manual Sale</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manually record a sale that happened outside the app or on a marketplace without API integration.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Item Title"
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
                onChange={(e) => handleMarketplaceChange(e.target.value)}
              >
                <MenuItem value="eBay">eBay</MenuItem>
                <MenuItem value="Etsy">Etsy</MenuItem>
                <MenuItem value="Facebook">Facebook Marketplace</MenuItem>
                <MenuItem value="Craigslist">Craigslist</MenuItem>
                <MenuItem value="OfferUp">OfferUp</MenuItem>
                <MenuItem value="Mercari">Mercari</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Sale Price"
              name="sale_price"
              type="number"
              value={newSale.sale_price}
              onChange={handleInputChange}
              required
              InputProps={{ startAdornment: '$' }}
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
              label="Buyer Name (Optional)"
              name="buyer_name"
              value={newSale.buyer_name}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Add Sale
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Sales;
