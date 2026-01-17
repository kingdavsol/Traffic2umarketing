import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Paper,
  Grid,
  Button,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface NotificationPreferences {
  emailNotifications: {
    newSale: boolean;
    newMessage: boolean;
    priceDropAlert: boolean;
    marketplaceUpdates: boolean;
    systemUpdates: boolean;
    weeklyReport: boolean;
  };
  pushNotifications: {
    newSale: boolean;
    newMessage: boolean;
    priceDropAlert: boolean;
  };
  smsNotifications: {
    newSale: boolean;
    criticalAlerts: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: {
      newSale: true,
      newMessage: true,
      priceDropAlert: true,
      marketplaceUpdates: true,
      systemUpdates: true,
      weeklyReport: false,
    },
    pushNotifications: {
      newSale: true,
      newMessage: true,
      priceDropAlert: false,
    },
    smsNotifications: {
      newSale: false,
      criticalAlerts: false,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await api.getNotificationPreferences();
      if (response.data.data) {
        setPreferences(response.data.data);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to load notification preferences' });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await api.updateNotificationPreferences(preferences);
      setMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      await api.sendTestNotification();
      setMessage({ type: 'success', text: 'Test notification sent! Check your email.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to send test notification' });
    } finally {
      setLoading(false);
    }
  };

  const updateEmailNotification = (key: keyof typeof preferences.emailNotifications, value: boolean) => {
    setPreferences({
      ...preferences,
      emailNotifications: {
        ...preferences.emailNotifications,
        [key]: value,
      },
    });
  };

  const updatePushNotification = (key: keyof typeof preferences.pushNotifications, value: boolean) => {
    setPreferences({
      ...preferences,
      pushNotifications: {
        ...preferences.pushNotifications,
        [key]: value,
      },
    });
  };

  const updateSmsNotification = (key: keyof typeof preferences.smsNotifications, value: boolean) => {
    setPreferences({
      ...preferences,
      smsNotifications: {
        ...preferences.smsNotifications,
        [key]: value,
      },
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Notification Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose what notifications you want to receive and how you want to receive them.
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Email Notifications */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Email Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Receive email notifications for important events
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications.newSale}
                  onChange={(e) => updateEmailNotification('newSale', e.target.checked)}
                  disabled={loading}
                />
              }
              label="New Sale"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              Get notified when someone purchases your item
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications.newMessage}
                  onChange={(e) => updateEmailNotification('newMessage', e.target.checked)}
                  disabled={loading}
                />
              }
              label="New Message"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              Get notified when buyers send you messages
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications.priceDropAlert}
                  onChange={(e) => updateEmailNotification('priceDropAlert', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Price Drop Alerts"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              Get notified about price changes on your watched items
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications.marketplaceUpdates}
                  onChange={(e) => updateEmailNotification('marketplaceUpdates', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Marketplace Updates"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              Updates about your connected marketplace accounts
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications.systemUpdates}
                  onChange={(e) => updateEmailNotification('systemUpdates', e.target.checked)}
                  disabled={loading}
                />
              }
              label="System Updates"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              Important system announcements and new features
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications.weeklyReport}
                  onChange={(e) => updateEmailNotification('weeklyReport', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Weekly Sales Report"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              Receive a weekly summary of your sales and performance
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Push Notifications */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Push Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Receive instant browser notifications for time-sensitive events
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.pushNotifications.newSale}
                  onChange={(e) => updatePushNotification('newSale', e.target.checked)}
                  disabled={loading}
                />
              }
              label="New Sale"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.pushNotifications.newMessage}
                  onChange={(e) => updatePushNotification('newMessage', e.target.checked)}
                  disabled={loading}
                />
              }
              label="New Message"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.pushNotifications.priceDropAlert}
                  onChange={(e) => updatePushNotification('priceDropAlert', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Price Drop Alerts"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* SMS Notifications */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          SMS Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Receive text messages for critical events (requires phone number)
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.smsNotifications.newSale}
                  onChange={(e) => updateSmsNotification('newSale', e.target.checked)}
                  disabled={loading}
                />
              }
              label="New Sale"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.smsNotifications.criticalAlerts}
                  onChange={(e) => updateSmsNotification('criticalAlerts', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Critical Alerts"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              Account security alerts and urgent marketplace issues
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Quiet Hours */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Quiet Hours
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Set times when you don't want to receive non-urgent notifications
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.quietHours.enabled}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      quietHours: { ...preferences.quietHours, enabled: e.target.checked },
                    })
                  }
                  disabled={loading}
                />
              }
              label="Enable Quiet Hours"
            />
          </Grid>
          {preferences.quietHours.enabled && (
            <>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Start Time</InputLabel>
                  <Select
                    value={preferences.quietHours.startTime}
                    label="Start Time"
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        quietHours: { ...preferences.quietHours, startTime: e.target.value },
                      })
                    }
                    disabled={loading}
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <MenuItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>End Time</InputLabel>
                  <Select
                    value={preferences.quietHours.endTime}
                    label="End Time"
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        quietHours: { ...preferences.quietHours, endTime: e.target.value },
                      })
                    }
                    disabled={loading}
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <MenuItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={loading}
        >
          Save Preferences
        </Button>
        <Button
          variant="outlined"
          startIcon={<NotificationsIcon />}
          onClick={handleTestNotification}
          disabled={loading}
        >
          Send Test Notification
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationSettings;
