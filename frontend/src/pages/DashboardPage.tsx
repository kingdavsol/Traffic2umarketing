import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  TextField,
  Chip,
  Alert,
  Paper
} from '@mui/material';
import {
  PhotoCamera,
  CloudUpload,
  AccountCircle,
  Logout,
  AutoAwesome,
  AttachMoney,
  Public
} from '@mui/icons-material';
import api from '../services/api';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Display image
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Analyze with AI
    setAnalyzing(true);
    setError('');
    try {
      const response = await api.analyzePhoto(file);
      setAiData(response.data.data);
      setSuccess('Photo analyzed successfully! Review the details below.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze photo. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateListing = async () => {
    if (!aiData) return;

    try {
      const response = await api.createListing({
        title: aiData.title,
        description: aiData.description,
        price: aiData.suggestedPrice,
        category: aiData.category,
        condition: aiData.condition || 'used',
      });

      setSuccess('Listing created! You can now publish it to marketplaces.');
      setTimeout(() => {
        navigate('/listings');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing. Please try again.');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', background: '#f5f5f5' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            QuickSell Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleMenu}>
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">{user.email || 'User'}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Upload Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  <PhotoCamera sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Take or Upload Photo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Upload a photo of your item and let AI do the rest!
                </Typography>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />

                {!selectedImage ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CloudUpload />}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        py: 1.5,
                        px: 4,
                      }}
                    >
                      Choose Photo
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        background: '#f9f9f9',
                        borderRadius: 2,
                      }}
                    >
                      <img
                        src={selectedImage}
                        alt="Selected item"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          borderRadius: '8px',
                        }}
                      />
                    </Paper>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ mt: 2 }}
                      onClick={() => {
                        setSelectedImage(null);
                        setAiData(null);
                        setSuccess('');
                      }}
                    >
                      Choose Different Photo
                    </Button>
                  </Box>
                )}

                {analyzing && (
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Analyzing photo with AI...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* AI Results Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
                  AI-Generated Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {aiData ? 'Review and edit the AI-generated listing' : 'Upload a photo to see AI suggestions'}
                </Typography>

                {aiData ? (
                  <Box>
                    <TextField
                      fullWidth
                      label="Title"
                      value={aiData.title || ''}
                      onChange={(e) => setAiData({ ...aiData, title: e.target.value })}
                      margin="normal"
                      variant="outlined"
                    />

                    <TextField
                      fullWidth
                      label="Description"
                      value={aiData.description || ''}
                      onChange={(e) => setAiData({ ...aiData, description: e.target.value })}
                      margin="normal"
                      multiline
                      rows={4}
                      variant="outlined"
                    />

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <TextField
                        label="Suggested Price"
                        value={aiData.suggestedPrice || ''}
                        onChange={(e) => setAiData({ ...aiData, suggestedPrice: e.target.value })}
                        InputProps={{
                          startAdornment: <AttachMoney />,
                        }}
                        sx={{ flex: 1 }}
                      />

                      <TextField
                        label="Category"
                        value={aiData.category || ''}
                        onChange={(e) => setAiData({ ...aiData, category: e.target.value })}
                        sx={{ flex: 1 }}
                      />
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <Public sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                        Will be posted to 20+ marketplaces:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {['eBay', 'Facebook', 'Craigslist', 'OfferUp', 'Mercari', 'Poshmark'].map((marketplace) => (
                          <Chip key={marketplace} label={marketplace} color="primary" size="small" />
                        ))}
                        <Chip label="+14 more" size="small" />
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleCreateListing}
                      sx={{
                        mt: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        py: 1.5,
                      }}
                    >
                      Create Listing & Publish
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <AutoAwesome sx={{ fontSize: 64, color: '#ccc' }} />
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                      No photo analyzed yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight={700}>
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Listings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight={700}>
                      $0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Earnings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight={700}>
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Items Sold
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;
