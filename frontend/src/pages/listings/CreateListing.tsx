import React, { useState, useCallback } from 'react';
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
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../services/api';
import { createListingSuccess } from '../../store/slices/listingsSlice';
import MarketplaceSelector from '../../components/MarketplaceSelector';

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

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const steps = ['Upload Photos', 'AI Analysis', 'Review & Edit', 'Publish'];

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
      const result = response.data;

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

      setActiveStep(2); // Move to review step
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
      const response = await api.analyzePhoto(photos[0]);
      const result = response.data;

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

  // Submit listing
  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create listing
      const listingResponse = await api.createListing({
        ...formData,
        photos: photoUrls,
        status: 'draft',
        ai_generated: true,
      });

      const listing = listingResponse.data.data;
      dispatch(createListingSuccess(listing));

      // If marketplaces selected, publish immediately
      if (selectedMarketplaces.length > 0) {
        const publishResponse = await api.publishListing(listing.id, selectedMarketplaces);
        setPublishResults(publishResponse.data.data);
        setActiveStep(3); // Move to publish results step
      } else {
        // No marketplaces selected, just navigate to listings
        navigate('/listings');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create listing');
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
            <Paper
              {...getRootProps()}
              sx={{
                p: 4,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <input {...getInputProps()} />
              <UploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop photos here' : 'Drag & drop photos, or click to select'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload up to 12 photos (JPEG, PNG, WebP)
              </Typography>
            </Paper>

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

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => navigate('/listings')}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (photos.length === 0) {
                    setError('Please upload at least one photo');
                    return;
                  }
                  setActiveStep(1);
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        );

      case 1: // AI Analysis
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom>
              Ready to analyze your photos?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Our AI will generate a title, description, category, and suggested price for your listing.
            </Typography>

            {analyzing ? (
              <Box>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="body1">Analyzing photos...</Typography>
              </Box>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={analyzePhotos}
                startIcon={<SendIcon />}
              >
                Analyze with AI
              </Button>
            )}

            <Box sx={{ mt: 3 }}>
              <Button onClick={() => setActiveStep(0)}>Back</Button>
            </Box>
          </Box>
        );

      case 2: // Review & Edit
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
              <Button onClick={() => setActiveStep(1)}>Back</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Listing'}
              </Button>
            </Box>
          </Box>
        );

      case 3: // Publish Results
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

                {publishResults.copyPastePosts?.length > 0 && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="info.main" gutterBottom>
                        Copy & Paste Instructions
                      </Typography>
                      {publishResults.copyPastePosts.map((post: any, index: number) => (
                        <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {post.marketplace}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Title:</strong> {post.copyPasteData.title}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Description:</strong> {post.copyPasteData.description}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Price:</strong> ${post.copyPasteData.price}
                          </Typography>
                          <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                            {post.copyPasteData.instructions.map((instruction: string, i: number) => (
                              <div key={i}>{instruction}</div>
                            ))}
                          </Typography>
                        </Box>
                      ))}
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create New Listing
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
    </Container>
  );
};

export default CreateListingPage;
