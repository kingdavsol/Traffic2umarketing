import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
  Paper,
  Menu,
  ListItemIcon,
  ListItemText,
  SelectChangeEvent,
} from '@mui/material';
import {
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  AutoAwesome as ReanalyzeIcon,
  CheckCircle as MarkSoldIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import {
  fetchListingsStart,
  fetchListingsSuccess,
  fetchListingsFailure,
  deleteListingSuccess,
  updateListingSuccess,
  clearError,
} from '../store/slices/listingsSlice';
import { RootState } from '../store';
import api from '../services/api';

interface Listing {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  estimatedPrice?: number;
  status: 'draft' | 'published' | 'sold' | 'delisted';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  photos: string[];
  createdAt: string;
  publishedAt?: string;
  marketplaces?: string[];
}

const MyListings: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: listings, loading, error } = useSelector((state: RootState) => state.listings);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    dispatch(fetchListingsStart());
    try {
      const response = await api.getListings(1, 100);
      if (response.data.success) {
        dispatch(
          fetchListingsSuccess({
            items: response.data.data.listings,
            total: response.data.data.total,
          })
        );
      } else {
        dispatch(fetchListingsFailure(response.data.error || 'Failed to load listings'));
      }
    } catch (err: any) {
      dispatch(
        fetchListingsFailure(err.response?.data?.error || 'Failed to load listings. Please try again.')
      );
    }
  };

  const handleEdit = (listing: Listing) => {
    navigate(`/create-listing?edit=${listing.id}`);
  };

  const handleDelete = (listing: Listing) => {
    setSelectedListing(listing);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const confirmDelete = async () => {
    if (!selectedListing) return;

    try {
      const response = await api.deleteListing(selectedListing.id);
      if (response.data.success) {
        dispatch(deleteListingSuccess(selectedListing.id));
        setSnackbar({ open: true, message: 'Listing deleted successfully', severity: 'success' });
        setDeleteDialogOpen(false);
        setSelectedListing(null);
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to delete listing',
        severity: 'error',
      });
    }
  };

  const handleDuplicate = async (listing: Listing) => {
    try {
      const duplicateData = {
        title: `${listing.title} (Copy)`,
        description: listing.description,
        category: listing.category,
        price: listing.price,
        condition: listing.condition,
        photos: listing.photos,
        status: 'draft',
      };

      const response = await api.createListing(duplicateData);
      if (response.data.success) {
        setSnackbar({ open: true, message: 'Listing duplicated successfully', severity: 'success' });
        loadListings();
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to duplicate listing',
        severity: 'error',
      });
    }
    setAnchorEl(null);
  };

  const handleReanalyze = async (listing: Listing) => {
    setSnackbar({ open: true, message: 'Re-analyzing with AI...', severity: 'success' });
    // TODO: Implement AI re-analysis
    setAnchorEl(null);
  };

  const handleMarkSold = async (listing: Listing) => {
    try {
      const response = await api.updateListing(listing.id, { status: 'sold' });
      if (response.data.success) {
        dispatch(updateListingSuccess(response.data.data));
        setSnackbar({ open: true, message: 'Marked as sold', severity: 'success' });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to update listing',
        severity: 'error',
      });
    }
    setAnchorEl(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'published':
        return 'primary';
      case 'sold':
        return 'success';
      case 'delisted':
        return 'error';
      default:
        return 'default';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'New';
      case 'like_new':
        return 'Like New';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Poor';
      default:
        return condition;
    }
  };

  const filteredListings = listings
    .filter((listing) => {
      if (statusFilter !== 'all' && listing.status !== statusFilter) return false;
      if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_high':
          return b.price - a.price;
        case 'price_low':
          return a.price - b.price;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            My Listings
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your items across all marketplaces
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-listing')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            },
          }}
        >
          Create New Listing
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Filters & Controls */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="sold">Sold</MenuItem>
                <MenuItem value="delisted">Delisted</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort By */}
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
                <MenuItem value="title">Title (A-Z)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* View Toggle */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newView) => newView && setViewMode(newView)}
              size="small"
            >
              <ToggleButton value="grid">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list">
                <ListViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Showing {filteredListings.length} of {listings.length} listings
      </Typography>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loading && filteredListings.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: '#f9fafb',
            border: '2px dashed #e0e0e0',
            borderRadius: 2,
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="textSecondary">
              {searchQuery || statusFilter !== 'all' ? 'No listings found' : 'No listings yet'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Create your first listing to start selling'}
            </Typography>
          </Box>
          {!searchQuery && statusFilter === 'all' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-listing')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Create Your First Listing
            </Button>
          )}
        </Paper>
      )}

      {/* Listings Grid */}
      {!loading && viewMode === 'grid' && filteredListings.length > 0 && (
        <Grid container spacing={3}>
          {filteredListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={listing.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s',
                  },
                }}
              >
                {/* Photo */}
                <CardMedia
                  component="img"
                  height="200"
                  image={listing.photos[0] || '/placeholder-image.jpg'}
                  alt={listing.title}
                  sx={{ objectFit: 'cover', bgcolor: '#f5f5f5' }}
                />

                {/* Status Badge */}
                <Chip
                  label={listing.status.toUpperCase()}
                  color={getStatusColor(listing.status) as any}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    fontWeight: 600,
                  }}
                />

                {/* Content */}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }} noWrap>
                    {listing.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                    <Chip label={listing.category} size="small" variant="outlined" />
                    <Chip label={getConditionLabel(listing.condition)} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    ${listing.price.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Created {new Date(listing.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>

                {/* Actions */}
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(listing)}>
                    Edit
                  </Button>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setSelectedListing(listing);
                      setAnchorEl(e.currentTarget);
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Listings List */}
      {!loading && viewMode === 'list' && filteredListings.length > 0 && (
        <Box>
          {filteredListings.map((listing) => (
            <Card key={listing.id} sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
              <Box sx={{ display: 'flex', p: 2 }}>
                {/* Photo */}
                <CardMedia
                  component="img"
                  sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                  image={listing.photos[0] || '/placeholder-image.jpg'}
                  alt={listing.title}
                />

                {/* Content */}
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {listing.title}
                    </Typography>
                    <Chip label={listing.status.toUpperCase()} color={getStatusColor(listing.status) as any} size="small" />
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }} noWrap>
                    {listing.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip label={listing.category} size="small" variant="outlined" />
                    <Chip label={getConditionLabel(listing.condition)} size="small" variant="outlined" />
                    {listing.marketplaces && listing.marketplaces.length > 0 && (
                      <Chip
                        label={`${listing.marketplaces.length} marketplaces`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Created {new Date(listing.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                {/* Price & Actions */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
                    ${listing.price.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(listing)}>
                      Edit
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setSelectedListing(listing);
                        setAnchorEl(e.currentTarget);
                      }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => selectedListing && handleDuplicate(selectedListing)}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedListing && handleReanalyze(selectedListing)}>
          <ListItemIcon>
            <ReanalyzeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Re-analyze with AI</ListItemText>
        </MenuItem>
        {selectedListing?.status !== 'sold' && (
          <MenuItem onClick={() => selectedListing && handleMarkSold(selectedListing)}>
            <ListItemIcon>
              <MarkSoldIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Sold</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => selectedListing && handleDelete(selectedListing)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Listing?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedListing?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyListings;
