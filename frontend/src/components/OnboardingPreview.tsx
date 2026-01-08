import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Fade,
  Zoom,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Rocket as RocketIcon,
  EmojiEvents as TrophyIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface OnboardingPreviewProps {
  open: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

const OnboardingPreview: React.FC<OnboardingPreviewProps> = ({ open, onClose, onStartTour }) => {
  const navigate = useNavigate();

  const handleSkipAndStart = () => {
    onClose();
    navigate('/create-listing');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Zoom in timeout={500}>
            <Box sx={{ fontSize: '80px', mb: 2 }}>🚀</Box>
          </Zoom>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Welcome to QuickSell!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95 }}>
            Sell anything in 3 minutes instead of 80 minutes
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom textAlign="center" sx={{ mb: 3 }}>
            Here's how it works in 3 simple steps:
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Fade in timeout={800}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-8px)' },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '24px',
                        fontWeight: 'bold',
                      }}
                    >
                      1
                    </Box>
                    <AutoAwesomeIcon sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      📸 Take a Photo
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Snap a picture and AI creates a professional listing in 10 seconds
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            <Grid item xs={12} md={4}>
              <Fade in timeout={1000}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    border: '2px solid',
                    borderColor: 'success.main',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-8px)' },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '24px',
                        fontWeight: 'bold',
                      }}
                    >
                      2
                    </Box>
                    <RocketIcon sx={{ fontSize: 50, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      🎯 Select Marketplaces
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose Craigslist, Facebook, Mercari & OfferUp - post to all at once
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            <Grid item xs={12} md={4}>
              <Fade in timeout={1200}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    border: '2px solid',
                    borderColor: 'warning.main',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-8px)' },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: 'warning.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '24px',
                        fontWeight: 'bold',
                      }}
                    >
                      3
                    </Box>
                    <TrophyIcon sx={{ fontSize: 50, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      🎉 Publish & Earn
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hit publish and earn points! Compete on the leaderboard
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>

          <Box
            sx={{
              p: 3,
              bgcolor: 'grey.100',
              borderRadius: 2,
              textAlign: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h6" gutterBottom>
              ⏱️ Time Savings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Traditional: <strong style={{ color: '#d32f2f' }}>80 minutes</strong> → QuickSell:{' '}
              <strong style={{ color: '#2e7d32' }}>3 minutes</strong>
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, color: 'primary.main', fontWeight: 'bold' }}>
              26x Faster! 🚀
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={handleSkipAndStart}
                startIcon={<CloseIcon />}
                sx={{ py: 1.5 }}
              >
                Skip Tour - Start Selling
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={onStartTour}
                startIcon={<PlayArrowIcon />}
                sx={{ py: 1.5 }}
              >
                Take the Quick Tour (2 min)
              </Button>
            </Grid>
          </Grid>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="center"
            sx={{ mt: 2 }}
          >
            You can replay this tour anytime from Settings → Help
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingPreview;
