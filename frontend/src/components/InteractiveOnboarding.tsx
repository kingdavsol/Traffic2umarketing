import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  AutoAwesome as AutoAwesomeIcon,
  Store as StoreIcon,
  Rocket as RocketIcon,
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Facebook as FacebookIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';

interface InteractiveOnboardingProps {
  open: boolean;
  onClose: () => void;
}

const InteractiveOnboarding: React.FC<InteractiveOnboardingProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const steps = [
    'Welcome',
    'Take a Photo',
    'AI Magic',
    'Select Marketplaces',
    'Publish & Earn',
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setShowConfetti(true);
      setTimeout(() => {
        onClose();
        navigate('/create-listing');
      }, 3000);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSkip = () => {
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Zoom in timeout={800}>
                <Box sx={{ fontSize: '120px', mb: 2 }}>🚀</Box>
              </Zoom>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Welcome to QuickSell!
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                Sell anything in <strong style={{ color: '#1976d2' }}>3 minutes</strong> instead of 80 minutes
              </Typography>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'white' }}>
                    <CardContent>
                      <AutoAwesomeIcon sx={{ fontSize: 50, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        AI-Powered
                      </Typography>
                      <Typography variant="body2">
                        Take a photo, AI writes your listing in 10 seconds
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ height: '100%', bgcolor: 'success.light', color: 'white' }}>
                    <CardContent>
                      <RocketIcon sx={{ fontSize: 50, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Multi-Marketplace
                      </Typography>
                      <Typography variant="body2">
                        Post to Craigslist, Facebook, Mercari & OfferUp at once
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ height: '100%', bgcolor: 'warning.light', color: 'white' }}>
                    <CardContent>
                      <TrophyIcon sx={{ fontSize: 50, mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Gamified
                      </Typography>
                      <Typography variant="body2">
                        Earn points, badges, and compete on the leaderboard
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  ⏱️ Time Comparison
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={5}>
                    <Typography variant="body2" color="text.secondary">Traditional</Typography>
                    <LinearProgress variant="determinate" value={100} sx={{ height: 10, borderRadius: 5, my: 1, bgcolor: 'error.light', '& .MuiLinearProgress-bar': { bgcolor: 'error.main' } }} />
                    <Typography variant="h6" color="error.main">80 minutes 😫</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="h4">→</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="body2" color="text.secondary">QuickSell</Typography>
                    <LinearProgress variant="determinate" value={4} sx={{ height: 10, borderRadius: 5, my: 1, bgcolor: 'success.light', '& .MuiLinearProgress-bar': { bgcolor: 'success.main' } }} />
                    <Typography variant="h6" color="success.main">3 minutes! 🎉</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ fontSize: '100px', mb: 2 }}>📸</Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Step 1: Take a Photo
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Just snap a picture of what you're selling
              </Typography>

              <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                <Card sx={{ mb: 3, border: '3px dashed', borderColor: 'primary.main', bgcolor: 'primary.50' }}>
                  <CardContent>
                    <PhotoCameraIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Use Your Camera or Upload
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click "Take Photo" or "Upload Photos"
                    </Typography>
                  </CardContent>
                </Card>

                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    📷 Pro Tips for Better Photos:
                  </Typography>
                  <Typography variant="body2" component="div">
                    ✓ Good lighting (natural light works best)<br />
                    ✓ Clean background<br />
                    ✓ Show the item clearly<br />
                    ✓ Multiple angles if possible
                  </Typography>
                </Alert>

                <Box sx={{ p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Try it with:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Chip label="📱 Electronics" size="small" />
                    </Grid>
                    <Grid item xs={6}>
                      <Chip label="👕 Clothing" size="small" />
                    </Grid>
                    <Grid item xs={6}>
                      <Chip label="🪑 Furniture" size="small" />
                    </Grid>
                    <Grid item xs={6}>
                      <Chip label="🎮 Toys/Games" size="small" />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ fontSize: '100px', mb: 2 }}>✨</Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Step 2: AI Creates Your Listing
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Watch the magic happen in 10 seconds!
              </Typography>

              <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <CardContent>
                    <AutoAwesomeIcon sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      AI Analyzes Your Photo
                    </Typography>
                    <Box sx={{ my: 3 }}>
                      <LinearProgress variant="indeterminate" sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} />
                      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        Analyzing item...
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent sx={{ textAlign: 'left' }}>
                        <Typography variant="caption" color="text.secondary">AI GENERATES:</Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip icon={<CheckCircleIcon />} label="Professional Title" color="success" sx={{ m: 0.5 }} />
                          <Chip icon={<CheckCircleIcon />} label="Detailed Description" color="success" sx={{ m: 0.5 }} />
                          <Chip icon={<CheckCircleIcon />} label="Category" color="success" sx={{ m: 0.5 }} />
                          <Chip icon={<CheckCircleIcon />} label="Price Suggestion" color="success" sx={{ m: 0.5 }} />
                          <Chip icon={<CheckCircleIcon />} label="Condition" color="success" sx={{ m: 0.5 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    💡 You're Always in Control
                  </Typography>
                  <Typography variant="body2">
                    Review and edit any field before publishing. The AI is 90%+ accurate, but you can make it perfect!
                  </Typography>
                </Alert>
              </Box>
            </Box>
          </Fade>
        );

      case 3:
        return (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ fontSize: '100px', mb: 2 }}>🎯</Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Step 3: Choose Your Marketplaces
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Post to multiple places at once!
              </Typography>

              <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ border: '2px solid', borderColor: 'success.main', bgcolor: 'success.50' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <StoreIcon sx={{ fontSize: 40, color: 'success.main', mr: 1 }} />
                          <Typography variant="h6">Craigslist</Typography>
                        </Box>
                        <Chip label="🤖 Automated" color="success" size="small" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Click "Create" and we post automatically!
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold', color: 'success.dark' }}>
                          ⏱️ 10 seconds
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card sx={{ border: '2px solid', borderColor: 'primary.main', bgcolor: 'primary.50' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <FacebookIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                          <Typography variant="h6">Facebook</Typography>
                        </Box>
                        <Chip label="✋ One-Click Copy" color="primary" size="small" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Copy all fields → Paste → Done!
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold', color: 'primary.dark' }}>
                          ⏱️ 30 seconds
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card sx={{ border: '2px solid', borderColor: 'primary.main', bgcolor: 'primary.50' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontSize: 30, mr: 1 }}>🛍️</Typography>
                          <Typography variant="h6">Mercari</Typography>
                        </Box>
                        <Chip label="✋ One-Click Copy" color="primary" size="small" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Copy all fields → Paste → Done!
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold', color: 'primary.dark' }}>
                          ⏱️ 30 seconds
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card sx={{ border: '2px solid', borderColor: 'warning.main', bgcolor: 'warning.50' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontSize: 30, mr: 1 }}>📱</Typography>
                          <Typography variant="h6">OfferUp</Typography>
                        </Box>
                        <Chip label="📱 Mobile App" color="warning" size="small" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Copy → Open app → Paste
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold', color: 'warning.dark' }}>
                          ⏱️ 60 seconds
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Alert severity="success">
                  <Typography variant="subtitle2" gutterBottom>
                    💰 Pro Tip: Select ALL 4 Marketplaces!
                  </Typography>
                  <Typography variant="body2">
                    More exposure = faster sales. Total time: ~3 minutes instead of 80 minutes
                  </Typography>
                </Alert>
              </Box>
            </Box>
          </Fade>
        );

      case 4:
        return (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ fontSize: '100px', mb: 2 }}>🎉</Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Step 4: Publish & Earn Points!
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Start selling and climb the leaderboard
              </Typography>

              <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  <CardContent>
                    <TrophyIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      Gamification Unlocked!
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={6}>
                        <Card sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                          <CardContent>
                            <Typography variant="h4" sx={{ color: 'white' }}>+10</Typography>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              Points per listing
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                          <CardContent>
                            <Typography variant="h4" sx={{ color: 'white' }}>+50</Typography>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              Points when sold
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5">🥉</Typography>
                        <Typography variant="caption">Bronze Seller</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5">🥈</Typography>
                        <Typography variant="caption">Silver Seller</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5">🥇</Typography>
                        <Typography variant="caption">Gold Seller</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    🏆 Compete on the Leaderboard
                  </Typography>
                  <Typography variant="body2">
                    See how you rank against other sellers and unlock exclusive badges!
                  </Typography>
                </Alert>

                <Box sx={{ p: 3, bgcolor: 'primary.light', color: 'white', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    🚀 Ready to Sell?
                  </Typography>
                  <Typography variant="body1">
                    Let's create your first listing and earn +10 points!
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
          },
        }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <IconButton onClick={handleSkip} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent()}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>

              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {activeStep + 1} of {steps.length}
                </Typography>
              </Box>

              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={activeStep === steps.length - 1 ? <RocketIcon /> : <ArrowForwardIcon />}
                size="large"
              >
                {activeStep === steps.length - 1 ? "Let's Go!" : 'Next'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InteractiveOnboarding;
