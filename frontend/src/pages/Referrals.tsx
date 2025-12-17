import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ContentCopy,
  Share,
  PersonAdd,
  CardGiftcard,
  Facebook,
  Twitter,
  LinkedIn,
  Email,
} from '@mui/icons-material';
import api from '../services/api';

interface ReferralStats {
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_credits_earned: number;
  credits: number;
  totalCredits: number;
}

interface Referral {
  id: number;
  referred_email: string;
  status: string;
  credits_awarded: number;
  referred_at: string;
  completed_at: string | null;
}

const Referrals: React.FC = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      const [codeResponse, statsResponse, referralsResponse] = await Promise.all([
        api.getReferralCode(),
        api.getReferralStats(),
        api.getReferrals(10),
      ]);

      setReferralCode(codeResponse.data.data.referralCode);
      setReferralLink(codeResponse.data.data.referralLink);
      setStats(statsResponse.data.data);
      setReferrals(referralsResponse.data.data);
    } catch (error: any) {
      showSnackbar('Failed to load referral data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    showSnackbar('Referral link copied to clipboard!', 'success');
  };

  const handleShare = (platform: string) => {
    const text = `Join me on QuickSell and get 5 free credits! Create professional marketplace listings in 60 seconds with AI.`;
    const encodedText = encodeURIComponent(text);
    const encodedLink = encodeURIComponent(referralLink);

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedLink}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Join QuickSell - Get 5 Free Credits&body=${encodedText}%0A%0A${encodedLink}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join QuickSell',
          text: 'Join me on QuickSell and get 5 free credits! Create professional marketplace listings in 60 seconds with AI.',
          url: referralLink,
        });
        showSnackbar('Shared successfully!', 'success');
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          <CardGiftcard sx={{ verticalAlign: 'middle', mr: 1, fontSize: 40 }} />
          Referral Program
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share QuickSell with friends and earn 5 credits for each successful referral!
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {stats?.credits || 0}
              </Typography>
              <Typography variant="body2">Available Credits</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats?.completed_referrals || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Successful Referrals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats?.pending_referrals || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Referrals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats?.total_credits_earned || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Credits Earned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Referral Link */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Your Referral Link
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Share this link with friends. When they sign up, you both get 5 free credits!
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            value={referralLink}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={handleCopyLink}
            startIcon={<ContentCopy />}
            sx={{ minWidth: 120 }}
          >
            Copy
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleNativeShare}
            startIcon={<Share />}
            sx={{ minWidth: 120 }}
          >
            Share
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Your referral code: <strong>{referralCode}</strong>
        </Typography>
      </Paper>

      {/* Social Sharing */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Share on Social Media
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Facebook />}
            onClick={() => handleShare('facebook')}
            sx={{ color: '#1877F2', borderColor: '#1877F2' }}
          >
            Facebook
          </Button>
          <Button
            variant="outlined"
            startIcon={<Twitter />}
            onClick={() => handleShare('twitter')}
            sx={{ color: '#1DA1F2', borderColor: '#1DA1F2' }}
          >
            Twitter
          </Button>
          <Button
            variant="outlined"
            startIcon={<LinkedIn />}
            onClick={() => handleShare('linkedin')}
            sx={{ color: '#0A66C2', borderColor: '#0A66C2' }}
          >
            LinkedIn
          </Button>
          <Button
            variant="outlined"
            startIcon={<Email />}
            onClick={() => handleShare('email')}
          >
            Email
          </Button>
        </Box>
      </Paper>

      {/* Referral History */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Referral History
        </Typography>
        {referrals.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PersonAdd sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No referrals yet. Start sharing your link!
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Credits Earned</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.referred_email}</TableCell>
                    <TableCell>
                      <Chip
                        label={referral.status}
                        color={referral.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{referral.credits_awarded || 0} credits</TableCell>
                    <TableCell>
                      {new Date(referral.completed_at || referral.referred_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Referrals;
