import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  CameraAlt as CameraIcon,
  PhotoCamera as PhotoCameraIcon,
  PhotoLibrary as PhotoLibraryIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../services/api';
import { createListingSuccess, updateListingSuccess } from '../store/slices/listingsSlice';
import MarketplaceSelector from '../components/MarketplaceSelector';

interface AnalysisResult {
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
}

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Check if we're in edit mode
  const editListingId = searchParams.get('edit');
  const isEditMode = !!editListingId;

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [photosApproved, setPhotosApproved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<AnalysisResult>({
    title: '',
    description: '',
    category: '',
    price: 0,
    condition: 'good',
    brand: '',
    model: '',
    color: '',
    size: '',
  });

  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
  const [publishResults, setPublishResults] = useState<any>(null);
  const [aiHints, setAiHints] = useState<string>('');
  const [copiedFields, setCopiedFields] = useState<{[key: string]: boolean}>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = ['Upload Photos', 'Review & Edit', 'Publish'];

  // Load listing data if in edit mode
  React.useEffect(() => {
    if (isEditMode && editListingId) {
      const loadListing = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await api.getListing(parseInt(editListingId));
          const listing = response.data.data || response.data;

          // Populate form data
          setFormData({
            title: listing.title || '',
            description: listing.description || '',
            category: listing.category || '',
            price: listing.price || 0,
            condition: listing.condition || 'good',
            brand: listing.brand || '',
            model: listing.model || '',
            color: listing.color || '',
            size: listing.size || '',
          });

          // Load photos if available
          if (listing.photos && Array.isArray(listing.photos)) {
            setPhotoUrls(listing.photos);
            // Skip to review step since photos are already loaded
            setActiveStep(1);
          }
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to load listing');
          console.error('Failed to load listing:', err);
        } finally {
          setLoading(false);
        }
      };

      loadListing();
    }
  }, [isEditMode, editListingId]);

  // Photo upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setPhotos((prev) => [...prev, ...acceptedFiles]);

    // Create preview URLs
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 12,
  });

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Camera functions
  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      setStream(mediaStream);
      setCameraOpen(true);

      // Set video stream once the dialog opens
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions or use file selection instead.');
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob then to File
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

            // Add to photos
            setPhotos((prev) => [...prev, file]);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = () => {
              setPhotoUrls((prev) => [...prev, reader.result as string]);

              // Scroll to photo preview after a brief delay to ensure render
              setTimeout(() => {
                window.scrollTo({ top: 200, behavior: 'smooth' });
              }, 300);
            };
            reader.readAsDataURL(file);

            // Close camera after capture
            closeCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  // Handle file input selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      onDrop(fileArray);
    }
  };

  // AI Analysis
  const analyzePhotos = async () => {
    if (photos.length === 0) {
      setError('Please upload at least one photo');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      // Analyze the first photo
      const response = await api.analyzePhoto(photos[0]);
      const result = response.data.data || response.data; // Handle both response formats

      setFormData({
        title: result.title || '',
        description: result.description || '',
        category: result.category || '',
        price: result.suggestedPrice || 0,
        condition: result.condition || 'good',
        brand: result.brand || '',
        model: result.model || '',
        color: result.color || '',
        size: result.size || '',
      });

      setActiveStep(1); // Move to review step
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze photos');
    } finally {
      setAnalyzing(false);
    }
  };

  // Re-analyze with AI
  const reAnalyze = async () => {
    if (photos.length === 0) {
      setError('No photos to re-analyze');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await api.analyzePhoto(photos[0], aiHints || undefined);
      const result = response.data.data || response.data; // Handle both response formats

      // Update form data with new analysis
      setFormData({
        ...formData,
        title: result.title || formData.title,
        description: result.description || formData.description,
        category: result.category || formData.category,
        price: result.suggestedPrice || formData.price,
        condition: result.condition || formData.condition,
        brand: result.brand || formData.brand,
        model: result.model || formData.model,
        color: result.color || formData.color,
        size: result.size || formData.size,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to re-analyze photos');
    } finally {
      setAnalyzing(false);
    }
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Copy to clipboard helper with feedback
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFields(prev => ({ ...prev, [fieldName]: true }));

      // Show success snackbar
      const isAllFields = fieldName.includes('-all');
      const marketplace = fieldName.split('-')[0];
      if (isAllFields) {
        setSnackbarMessage(`✓ All fields copied! Now open ${marketplace} and paste into the Title field.`);
      } else if (fieldName.includes('title')) {
        setSnackbarMessage('✓ Title copied! Paste it into the marketplace Title field.');
      } else if (fieldName.includes('description')) {
        setSnackbarMessage('✓ Description copied! Paste it into the Description field.');
      } else if (fieldName.includes('price')) {
        setSnackbarMessage('✓ Price copied! Paste it into the Price field.');
      } else {
        setSnackbarMessage('✓ Copied to clipboard!');
      }
      setSnackbarOpen(true);

      setTimeout(() => {
        setCopiedFields(prev => ({ ...prev, [fieldName]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setSnackbarMessage('❌ Failed to copy. Please try again.');
      setSnackbarOpen(true);
    }
  };

  // Get marketplace posting URL
  const getMarketplaceUrl = (marketplace: string) => {
    const urls: {[key: string]: string} = {
      facebook: 'https://www.facebook.com/marketplace/create/item',
      offerup: 'https://offerup.com/', // Mobile app required for posting
      mercari: 'https://www.mercari.com/sell/',
    };
    return urls[marketplace.toLowerCase()] || '#';
  };

  // Get marketplace-specific instructions
  const getMarketplaceInstructions = (marketplace: string) => {
    const instructions: {[key: string]: string} = {
      facebook: 'Click "Open Facebook" → Paste your listing details → Upload photos → Post',
      offerup: '⚠️ OfferUp requires the mobile app. Copy EACH field individually (Title, Description, Price) and paste into the app.',
      mercari: 'Click "Open Mercari" → Select "Sell" → Paste your listing details → Upload photos → List',
    };
    return instructions[marketplace.toLowerCase()] || 'Open marketplace and paste your listing details';
  };

  // Submit listing
  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let listing;

      if (isEditMode && editListingId) {
        // Update existing listing
        const listingResponse = await api.updateListing(parseInt(editListingId), {
          ...formData,
          photos: photoUrls,
        });

        listing = listingResponse.data.data;
        dispatch(updateListingSuccess(listing));
      } else {
        // Create new listing
        const listingResponse = await api.createListing({
          ...formData,
          photos: photoUrls,
          status: 'draft',
          ai_generated: true,
        });

        listing = listingResponse.data.data;
        dispatch(createListingSuccess(listing));
      }

      // If marketplaces selected, publish in background
      if (selectedMarketplaces.length > 0) {
        // Check if Craigslist is selected (requires automation)
        const hasCraigslist = selectedMarketplaces.some(m => m.toLowerCase() === 'craigslist');

        // Show success message with background publishing notice
        if (hasCraigslist) {
          setSnackbarMessage(
            isEditMode
              ? '✓ Listing updated! Publishing to marketplaces in background (Craigslist may take 1-2 minutes).'
              : '✓ Listing created! Publishing to marketplaces in background (Craigslist may take 1-2 minutes). You can continue creating more listings.'
          );
        } else {
          setSnackbarMessage(
            isEditMode
              ? '✓ Listing updated! Publishing to marketplaces in background.'
              : '✓ Listing created! Publishing to marketplaces in background. You can continue creating more listings.'
          );
        }
        setSnackbarOpen(true);

        // Show publishing status
        setTimeout(() => {
          setSnackbarMessage(`📤 Publishing to ${selectedMarketplaces.join(', ')}...`);
          setSnackbarOpen(true);
        }, 2000);

        // Start publishing in background with error notification
        api.publishListing(listing.id, selectedMarketplaces)
          .then((response) => {
            console.log('Publish response:', response.data);
            const results = response.data?.data?.results || [];
            const successful = results.filter((r: any) => r.success);
            const failed = response.data?.data?.failedPosts || [];

            // Show detailed results
            if (failed.length > 0 && successful.length > 0) {
              setSnackbarMessage(`⚠️ Partially published: ${successful.length} succeeded, ${failed.length} failed (${failed.map((f: any) => f.marketplace).join(', ')})`);
              setSnackbarOpen(true);
            } else if (failed.length > 0) {
              console.error('All marketplaces failed:', failed);
              setSnackbarMessage(`❌ Publishing failed: ${failed.map((f: any) => f.marketplace).join(', ')} - ${failed[0]?.error || 'Unknown error'}`);
              setSnackbarOpen(true);
            } else if (successful.length > 0) {
              setSnackbarMessage(`✅ Successfully published to ${successful.length} marketplace(s)!`);
              setSnackbarOpen(true);
            }
          })
          .catch((err) => {
            console.error('Background publish error:', err);
            setSnackbarMessage(`❌ Publishing failed: ${err.response?.data?.error || err.message || 'Unknown error'}`);
            setSnackbarOpen(true);
          });

        // Navigate to listings immediately so user can continue
        setTimeout(() => navigate('/listings'), 2000); // Brief delay to show success message
      } else {
        // No marketplaces selected
        setSnackbarMessage(isEditMode ? '✓ Listing updated successfully!' : '✓ Listing created successfully!');
        setSnackbarOpen(true);
        setTimeout(() => navigate('/listings'), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || (isEditMode ? 'Failed to update listing' : 'Failed to create listing'));
    } finally {
      setSubmitting(false);
    }
  };

  // Render steps
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Upload Photos
        return (
          <Box>
            <Typography variant="h6" gutterBottom textAlign="center" sx={{ mb: 3 }}>
              Add Product Photos
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={openCamera}
                >
                  <PhotoCameraIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Take Photo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use your camera to capture product photos
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PhotoCameraIcon />}
                    sx={{ mt: 2 }}
                    disabled={photos.length >= 12}
                  >
                    Open Camera
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'secondary.main',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PhotoLibraryIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Choose Files
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select photos from your device
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PhotoLibraryIcon />}
                    sx={{ mt: 2 }}
                    disabled={photos.length >= 12}
                  >
                    Select Photos
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
              You can add up to 12 photos (JPEG, PNG, WebP)
            </Typography>

            {/* Approve/Retake buttons - prominently displayed at top when photos captured */}
            {photoUrls.length > 0 && !analyzing && !photosApproved && (
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  '& .MuiAlert-message': { width: '100%' }
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    📸 Photo{photoUrls.length > 1 ? 's' : ''} Captured!
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Review your photo{photoUrls.length > 1 ? 's' : ''} below. Click "OK - Analyze with AI" to continue, or "Retake" to start over.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="large"
                      startIcon={<RefreshIcon />}
                      onClick={() => {
                        setPhotos([]);
                        setPhotoUrls([]);
                        setPhotoCaptured(false);
                        setPhotosApproved(false);
                      }}
                    >
                      Retake
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => {
                        setPhotosApproved(true);
                        setPhotoCaptured(true);
                        analyzePhotos();
                      }}
                    >
                      OK - Analyze with AI
                    </Button>
                  </Box>
                </Box>
              </Alert>
            )}

            {photoUrls.length > 0 && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {photoUrls.map((url, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          bgcolor: 'background.paper',
                        }}
                        onClick={() => removePhoto(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Analyzing message moved to floating snackbar at top */}

            {!analyzing && photos.length === 0 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => navigate('/listings')}>Cancel</Button>
                <Button variant="outlined" disabled>
                  Add photos to continue
                </Button>
              </Box>
            )}
          </Box>
        );

      case 1: // Review & Edit
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Review & Edit Listing</Typography>
              <Button
                startIcon={<RefreshIcon />}
                onClick={reAnalyze}
                disabled={analyzing}
              >
                {analyzing ? 'Re-analyzing...' : 'Re-analyze with AI'}
              </Button>
            </Box>

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Listing re-analyzed successfully!
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="AI Hints (Optional)"
                placeholder="e.g., This is a vintage item from the 1980s, focus on retro styling"
                value={aiHints}
                onChange={(e) => setAiHints(e.target.value)}
                multiline
                rows={2}
                helperText="Provide hints to help AI generate better descriptions when re-analyzing"
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => handleSelectChange('category', e.target.value)}
                  >
                    <MenuItem value="Electronics">Electronics</MenuItem>
                    <MenuItem value="Clothing">Clothing</MenuItem>
                    <MenuItem value="Home & Garden">Home & Garden</MenuItem>
                    <MenuItem value="Sports">Sports</MenuItem>
                    <MenuItem value="Toys">Toys</MenuItem>
                    <MenuItem value="Books">Books</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  InputProps={{ startAdornment: '$' }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={formData.condition}
                    label="Condition"
                    onChange={(e) => handleSelectChange('condition', e.target.value)}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="like_new">Like New</MenuItem>
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="fair">Fair</MenuItem>
                    <MenuItem value="poor">Poor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Brand (Optional)"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model (Optional)"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color (Optional)"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Marketplaces to Publish
                </Typography>
                <MarketplaceSelector
                  selectedMarketplaces={selectedMarketplaces}
                  onSelectionChange={setSelectedMarketplaces}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setActiveStep(0)}>Back</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? (isEditMode ? 'Updating...' : 'Creating...')
                  : (isEditMode ? 'Update Listing' : 'Create Listing')}
              </Button>
            </Box>
          </Box>
        );

      case 2: // Publish Results
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Publishing Results
            </Typography>

            {publishResults && (
              <Box sx={{ mt: 3 }}>
                {publishResults.automaticPosts?.length > 0 && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="success.main" gutterBottom>
                        ✓ Automatically Published
                      </Typography>
                      {publishResults.automaticPosts.map((post: any, index: number) => (
                        <Chip
                          key={index}
                          label={`${post.marketplace} - ${post.listingUrl}`}
                          color="success"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {publishResults.manualPosts?.length > 0 && (
                  <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ fontSize: '40px' }}>✋</Box>
                        <Box>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 0 }}>
                            Quick Copy & Paste
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Takes ~30 seconds per marketplace
                          </Typography>
                        </Box>
                      </Box>
                      <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          🚀 You're almost done! Just paste your listing details.
                        </Typography>
                        <Typography variant="body2">
                          We've prepared everything - you just copy, paste, and upload photos. Way faster than typing it all yourself!
                        </Typography>
                      </Alert>

                      {publishResults.manualPosts.map((post: any, index: number) => {
                        const marketplaceName = post.marketplace || 'Unknown';
                        const data = post.copyPasteData || {};
                        const allText = `Title: ${data.title}\n\nDescription:\n${data.description}\n\nPrice: $${data.price}`;
                        const isOfferUp = marketplaceName.toLowerCase() === 'offerup';

                        return (
                          <Card key={index} sx={{ mb: 2, border: '3px solid #fff', boxShadow: 3 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    fontWeight: 'bold'
                                  }}>
                                    {index + 1}
                                  </Box>
                                  <Box>
                                    <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                                      {marketplaceName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Est. Time: {isOfferUp ? '60 seconds' : '30 seconds'}
                                    </Typography>
                                  </Box>
                                </Box>
                                {!isOfferUp && (
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    startIcon={<OpenInNewIcon />}
                                    onClick={() => window.open(getMarketplaceUrl(marketplaceName), '_blank')}
                                    sx={{ minWidth: 200 }}
                                  >
                                    Open {marketplaceName}
                                  </Button>
                                )}
                                {isOfferUp && (
                                  <Chip
                                    label="📱 Mobile App Required"
                                    color="warning"
                                    sx={{ fontWeight: 'bold', fontSize: '14px', py: 2.5, px: 1 }}
                                  />
                                )}
                              </Box>

                              <Grid container spacing={2}>
                                {/* Title */}
                                <Grid item xs={12}>
                                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                        TITLE
                                      </Typography>
                                      <Button
                                        size="small"
                                        startIcon={copiedFields[`${marketplaceName}-title`] ? <CheckCircleIcon /> : <CopyIcon />}
                                        onClick={() => copyToClipboard(data.title || '', `${marketplaceName}-title`)}
                                        color={copiedFields[`${marketplaceName}-title`] ? 'success' : 'primary'}
                                      >
                                        {copiedFields[`${marketplaceName}-title`] ? 'Copied!' : 'Copy'}
                                      </Button>
                                    </Box>
                                    <Typography variant="body1">{data.title}</Typography>
                                  </Paper>
                                </Grid>

                                {/* Description */}
                                <Grid item xs={12}>
                                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                        DESCRIPTION
                                      </Typography>
                                      <Button
                                        size="small"
                                        startIcon={copiedFields[`${marketplaceName}-description`] ? <CheckCircleIcon /> : <CopyIcon />}
                                        onClick={() => copyToClipboard(data.description || '', `${marketplaceName}-description`)}
                                        color={copiedFields[`${marketplaceName}-description`] ? 'success' : 'primary'}
                                      >
                                        {copiedFields[`${marketplaceName}-description`] ? 'Copied!' : 'Copy'}
                                      </Button>
                                    </Box>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{data.description}</Typography>
                                  </Paper>
                                </Grid>

                                {/* Price */}
                                <Grid item xs={12} sm={6}>
                                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                        PRICE
                                      </Typography>
                                      <Button
                                        size="small"
                                        startIcon={copiedFields[`${marketplaceName}-price`] ? <CheckCircleIcon /> : <CopyIcon />}
                                        onClick={() => copyToClipboard(String(data.price || ''), `${marketplaceName}-price`)}
                                        color={copiedFields[`${marketplaceName}-price`] ? 'success' : 'primary'}
                                      >
                                        {copiedFields[`${marketplaceName}-price`] ? 'Copied!' : 'Copy'}
                                      </Button>
                                    </Box>
                                    <Typography variant="h6" color="primary">${data.price}</Typography>
                                  </Paper>
                                </Grid>

                                {/* Copy All Button - Only for web-based marketplaces */}
                                {marketplaceName.toLowerCase() !== 'offerup' && (
                                  <Grid item xs={12} sm={6}>
                                    <Paper sx={{ p: 2, bgcolor: 'primary.light', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        startIcon={copiedFields[`${marketplaceName}-all`] ? <CheckCircleIcon /> : <CopyIcon />}
                                        onClick={() => copyToClipboard(allText, `${marketplaceName}-all`)}
                                        color={copiedFields[`${marketplaceName}-all`] ? 'success' : 'primary'}
                                        sx={{ py: 2 }}
                                      >
                                        {copiedFields[`${marketplaceName}-all`] ? '✓ All Copied!' : 'Copy All Fields'}
                                      </Button>
                                    </Paper>
                                  </Grid>
                                )}
                              </Grid>

                              {/* Step-by-Step Visual Guide */}
                              <Paper sx={{ mt: 3, p: 2, bgcolor: 'success.50', border: '2px solid', borderColor: 'success.main' }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ fontSize: '20px' }}>✓</Box>
                                  Step-by-Step Guide
                                </Typography>
                                <Box component="ol" sx={{ pl: 2, m: 0 }}>
                                  {isOfferUp ? (
                                    <>
                                      <li>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                          <strong>Copy Title</strong> (click Copy button above) → Open OfferUp app on your phone
                                        </Typography>
                                      </li>
                                      <li>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                          Tap <strong>"Sell"</strong> button → Paste Title into Title field
                                        </Typography>
                                      </li>
                                      <li>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                          Return here → <strong>Copy Description</strong> → Paste into Description field
                                        </Typography>
                                      </li>
                                      <li>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                          Return here → <strong>Copy Price</strong> → Paste into Price field
                                        </Typography>
                                      </li>
                                      <li>
                                        <Typography variant="body2">
                                          Upload photos → Select category → Post! 🎉
                                        </Typography>
                                      </li>
                                    </>
                                  ) : (
                                    <>
                                      <li>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                          Click <strong>"Copy All Fields"</strong> button above (✓ You'll see "All Copied!")
                                        </Typography>
                                      </li>
                                      <li>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                          Click <strong>"Open {marketplaceName}"</strong> button → New tab opens
                                        </Typography>
                                      </li>
                                      <li>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                          Click in the <strong>Title field</strong> → Press <kbd>Ctrl+V</kbd> (or <kbd>Cmd+V</kbd>) to paste
                                        </Typography>
                                      </li>
                                      <li>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                          Your title, description, and price are ready! Just upload photos 📸
                                        </Typography>
                                      </li>
                                      <li>
                                        <Typography variant="body2">
                                          Click <strong>Post/Publish</strong> → Done! 🎉
                                        </Typography>
                                      </li>
                                    </>
                                  )}
                                </Box>
                              </Paper>

                              {/* Pro Tips */}
                              <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                  💡 Pro Tips for Faster Posting
                                </Typography>
                                <Typography variant="body2" component="div">
                                  • Keep this tab open while posting to other marketplaces<br />
                                  • {isOfferUp ? 'Take photos with your phone first to save time' : 'Have your product photos ready before clicking "Open"'}<br />
                                  • {marketplaceName} posts typically go live in seconds<br />
                                  • Come back to QuickSell to track all your listings in one place!
                                </Typography>
                              </Alert>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {publishResults.failedPosts?.length > 0 && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="error.main" gutterBottom>
                        ✗ Failed to Publish
                      </Typography>
                      {publishResults.failedPosts.map((post: any, index: number) => (
                        <Alert key={index} severity="error" sx={{ mb: 1 }}>
                          {post.marketplace}: {post.error}
                        </Alert>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" onClick={() => navigate('/listings')}>
                View My Listings
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  // Show loading indicator when loading listing in edit mode
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Loading listing...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Listing' : 'Create New Listing'}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Camera Dialog */}
      <Dialog open={cameraOpen} onClose={closeCamera} maxWidth="md" fullWidth>
        <DialogTitle>Take a Photo</DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative', width: '100%', bgcolor: 'black', borderRadius: 1 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                maxHeight: '60vh',
                display: 'block',
                borderRadius: 4,
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Position your product in the frame and click "Capture Photo"
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCamera} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={capturePhoto}
            variant="contained"
            color="primary"
            startIcon={<CameraIcon />}
          >
            Capture Photo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Captured Notification */}
      <Snackbar
        open={photoCaptured && analyzing}
        message="✓ Photo captured! Analyzing with AI..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          sx: {
            bgcolor: 'success.main',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.1rem',
          },
        }}
      />

      {/* AI Analyzing Status - Fixed position at top, always visible */}
      <Snackbar
        open={analyzing}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} sx={{ color: 'white' }} />
            <Typography sx={{ fontSize: '1rem' }}>🤖 AI Analyzing your photo...</Typography>
          </Box>
        }
        ContentProps={{
          sx: {
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: 6,
            minWidth: '350px',
          }
        }}
        sx={{
          position: 'fixed',
          top: '80px !important',
          zIndex: 9999,
        }}
      />

      {/* Success & Status Messages - Fixed position at top, always visible */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={snackbarMessage.includes('❌') ? 10000 : 6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        ContentProps={{
          sx: {
            bgcolor: snackbarMessage.includes('❌') ? 'error.main' : snackbarMessage.includes('⚠️') ? 'warning.main' : 'success.main',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: 6,
            minWidth: '350px',
          }
        }}
        sx={{
          position: 'fixed',
          top: analyzing ? '140px !important' : '80px !important',
          zIndex: 9999,
        }}
      />
    </Container>
  );
};

export default CreateListing;
