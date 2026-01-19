import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface Subscription {
  plan: string;
  status: string;
  billingCycle: string;
  nextBillingDate: string;
  amount: number;
}

interface Invoice {
  id: number;
  date: string;
  amount: number;
  status: string;
  downloadUrl: string;
}

interface PaymentMethod {
  id: number;
  type: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

const BillingSettings: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription>({
    plan: 'Free',
    status: 'active',
    billingCycle: 'monthly',
    nextBillingDate: '',
    amount: 0,
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const [subscriptionRes, invoicesRes, paymentMethodsRes] = await Promise.all([
        api.getSubscription(),
        api.getInvoices(),
        api.getPaymentMethods(),
      ]);
      setSubscription(subscriptionRes.data.data);
      setInvoices(invoicesRes.data.data);
      setPaymentMethods(paymentMethodsRes.data.data);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to load billing data' });
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    setLoading(true);
    try {
      const response = await api.createCheckoutSession(planId);
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setMessage({ type: 'error', text: 'Failed to create checkout session' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to start checkout' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      await api.cancelSubscription();
      setMessage({ type: 'success', text: 'Subscription cancelled. You can use the service until the end of your billing period.' });
      setShowCancelDialog(false);
      await loadBillingData();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to cancel subscription' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      const response = await api.downloadInvoice(invoiceId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to download invoice' });
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['3 free listings total', 'eBay marketplace only', 'Basic support'],
      current: subscription.plan === 'free' || subscription.plan === 'Free',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 4.99,
      features: ['Unlimited listings', '10+ marketplaces', 'Priority support', 'Sales analytics'],
      current: subscription.plan === 'premium' || subscription.plan === 'Premium',
    },
    {
      id: 'premium_plus',
      name: 'Premium Plus',
      price: 9.99,
      features: ['Everything in Premium', 'AI image classification', 'Inventory management', 'Advanced insights'],
      current: subscription.plan === 'premium_plus' || subscription.plan === 'Premium Plus',
    },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Billing & Subscription
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your subscription plan and payment methods.
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Current Subscription */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Current Subscription
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Plan:</Typography>
            <Typography variant="h6">{subscription.plan}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Status:</Typography>
            <Chip
              label={subscription.status}
              color={subscription.status === 'active' ? 'success' : 'default'}
              size="small"
            />
          </Grid>
          {subscription.plan !== 'Free' && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Billing Cycle:</Typography>
                <Typography variant="body1">{subscription.billingCycle}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Next Billing Date:</Typography>
                <Typography variant="body1">{subscription.nextBillingDate}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Amount:</Typography>
                <Typography variant="body1">${subscription.amount}/month</Typography>
              </Grid>
            </>
          )}
        </Grid>
        {subscription.plan !== 'Free' && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => setShowCancelDialog(true)}
            sx={{ mt: 2 }}
          >
            Cancel Subscription
          </Button>
        )}
      </Paper>

      {/* Available Plans */}
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
        Available Plans
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.name}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {plan.name}
                  {plan.current && (
                    <Chip label="Current" size="small" color="primary" sx={{ ml: 1 }} />
                  )}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  ${plan.price}
                  <Typography component="span" variant="body2" color="text.secondary">
                    /month
                  </Typography>
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {plan.features.map((feature) => (
                    <Box key={feature} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                {!plan.current && (
                  <Button
                    fullWidth
                    variant={plan.price > 0 ? 'contained' : 'outlined'}
                    onClick={() => handleUpgradePlan(plan.id)}
                    disabled={loading}
                  >
                    {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Payment Methods */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Payment Methods
          </Typography>
          <Button
            variant="outlined"
            startIcon={<CreditCardIcon />}
            onClick={() => setShowAddCardDialog(true)}
          >
            Add Payment Method
          </Button>
        </Box>
        {paymentMethods.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No payment methods added yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {paymentMethods.map((method) => (
              <Grid item xs={12} sm={6} key={method.id}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: method.isDefault ? 'primary.main' : 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCardIcon sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        •••• {method.last4}
                      </Typography>
                    </Box>
                    {method.isDefault && (
                      <Chip label="Default" size="small" color="primary" />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Billing History */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Billing History
        </Typography>
        {invoices.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No invoices yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status}
                        color={invoice.status === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>Keep Subscription</Button>
          <Button onClick={handleCancelSubscription} color="error" disabled={loading}>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={showAddCardDialog} onClose={() => setShowAddCardDialog(false)}>
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Payment method integration coming soon. For now, please contact support to add a payment method.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddCardDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingSettings;
