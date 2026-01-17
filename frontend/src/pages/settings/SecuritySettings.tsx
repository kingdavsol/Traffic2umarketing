import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  PhoneAndroid as PhoneIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface Session {
  id: number;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface LoginHistory {
  id: number;
  timestamp: string;
  device: string;
  location: string;
  ip: string;
  success: boolean;
}

const SecuritySettings: React.FC = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const [securityRes, sessionsRes, historyRes] = await Promise.all([
        api.getSecuritySettings(),
        api.getActiveSessions(),
        api.getLoginHistory(),
      ]);
      setTwoFactorEnabled(securityRes.data.data.twoFactorEnabled);
      setSessions(sessionsRes.data.data);
      setLoginHistory(historyRes.data.data);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to load security data' });
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const response = await api.enable2FA();
      setQrCodeUrl(response.data.data.qrCode);
      setShow2FADialog(true);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to enable 2FA' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    try {
      await api.verify2FA(twoFactorCode);
      setTwoFactorEnabled(true);
      setShow2FADialog(false);
      setMessage({ type: 'success', text: 'Two-factor authentication enabled successfully!' });
      setTwoFactorCode('');
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Invalid verification code' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    try {
      await api.disable2FA();
      setTwoFactorEnabled(false);
      setMessage({ type: 'success', text: 'Two-factor authentication disabled' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to disable 2FA' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = async (sessionId: number) => {
    setLoading(true);
    try {
      await api.logoutSession(sessionId);
      setMessage({ type: 'success', text: 'Session logged out successfully' });
      await loadSecurityData();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to logout session' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    setLoading(true);
    try {
      await api.logoutAllSessions();
      setMessage({ type: 'success', text: 'All other sessions logged out successfully' });
      await loadSecurityData();
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to logout sessions' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const response = await api.exportUserData();
      setMessage({
        type: 'success',
        text: 'Your data export has been requested. You will receive a download link via email within 24 hours.',
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to request data export' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your account security and privacy settings.
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Two-Factor Authentication */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SecurityIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Two-Factor Authentication (2FA)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add an extra layer of security to your account by requiring a verification code when logging in.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={twoFactorEnabled}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleEnable2FA();
                  } else {
                    handleDisable2FA();
                  }
                }}
                disabled={loading}
              />
            }
            label={twoFactorEnabled ? 'Enabled' : 'Disabled'}
          />
          {twoFactorEnabled && (
            <Chip label="Protected" color="success" size="small" icon={<SecurityIcon />} />
          )}
        </Box>
      </Paper>

      {/* Active Sessions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Active Sessions
          </Typography>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleLogoutAllSessions}
            disabled={loading}
          >
            Logout All Other Sessions
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These are the devices currently logged into your account.
        </Typography>
        {sessions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No active sessions.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <Box>
                        {session.device}
                        {session.isCurrent && (
                          <Chip label="Current" size="small" color="primary" sx={{ ml: 1 }} />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {session.ip}
                      </Typography>
                    </TableCell>
                    <TableCell>{session.location}</TableCell>
                    <TableCell>{session.lastActive}</TableCell>
                    <TableCell align="right">
                      {!session.isCurrent && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleLogoutSession(session.id)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Login History */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Login History
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Recent login attempts to your account (last 10).
        </Typography>
        {loginHistory.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No login history available.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Device</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loginHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.timestamp}</TableCell>
                    <TableCell>
                      <Box>
                        {entry.device}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {entry.ip}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{entry.location}</TableCell>
                    <TableCell>
                      <Chip
                        label={entry.success ? 'Success' : 'Failed'}
                        color={entry.success ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Privacy & Data */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Privacy & Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Download a copy of your data or manage your privacy settings.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportData}
          disabled={loading}
        >
          Export My Data
        </Button>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          You'll receive a download link via email within 24 hours.
        </Typography>
      </Paper>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onClose={() => !loading && setShow2FADialog(false)}>
        <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
          </Typography>
          {qrCodeUrl && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img src={qrCodeUrl} alt="2FA QR Code" style={{ maxWidth: '200px' }} />
            </Box>
          )}
          <Typography variant="body2" sx={{ mb: 2 }}>
            Then enter the 6-digit code from your app:
          </Typography>
          <TextField
            fullWidth
            label="Verification Code"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            placeholder="000000"
            inputProps={{ maxLength: 6 }}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow2FADialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleVerify2FA} variant="contained" disabled={loading || twoFactorCode.length !== 6}>
            Verify & Enable
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;
