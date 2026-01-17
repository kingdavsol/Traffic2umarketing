import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Paper,
  Grid,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone: string;
  bio: string;
  avatar?: string;
}

const ProfileSettings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    email: '',
    name: '',
    phone: '',
    bio: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.getProfile();
      setProfile(response.data.data);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await api.updateProfile(profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    try {
      const response = await api.uploadAvatar(formData);
      setProfile({ ...profile, avatar: response.data.data.avatarUrl });
      setMessage({ type: 'success', text: 'Avatar updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.deleteAccount();
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to delete account' });
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Profile Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your profile information and account settings.
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Avatar Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Profile Photo
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={profile.avatar}
            alt={profile.name}
            sx={{ width: 80, height: 80 }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </Avatar>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleAvatarUpload}
          />
          <label htmlFor="avatar-upload">
            <IconButton color="primary" component="span" disabled={loading}>
              <PhotoCameraIcon />
            </IconButton>
          </label>
          <Typography variant="caption" color="text.secondary">
            Upload a new profile photo (JPG, PNG, max 5MB)
          </Typography>
        </Box>
      </Paper>

      {/* Profile Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Personal Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled={loading}
              helperText="Your email address for notifications and login"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone Number"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={loading}
              helperText="Optional: For account recovery and notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              disabled={loading}
              helperText="Tell us a bit about yourself"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleProfileUpdate}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Password Change */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Change Password
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              disabled={loading}
              helperText="Must be at least 8 characters"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handlePasswordChange}
              disabled={loading}
            >
              Change Password
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Danger Zone */}
      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'error.main' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="error" gutterBottom>
          Danger Zone
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Once you delete your account, there is no going back. All your listings, sales data, and
          settings will be permanently deleted.
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setShowDeleteDialog(true)}
          disabled={loading}
        >
          Delete Account
        </Button>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone. All your
            listings, sales data, marketplace connections, and personal information will be
            permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Yes, Delete My Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileSettings;
