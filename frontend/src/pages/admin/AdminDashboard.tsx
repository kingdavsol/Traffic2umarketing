import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Article as ArticleIcon,
  AttachMoney as MoneyIcon,
  Psychology as AIIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface AdminStats {
  users: {
    total: number;
    byTier: Record<string, number>;
    newToday: number;
  };
  listings: {
    total: number;
    active: number;
    newToday: number;
  };
  aiAnalysis: {
    totalRuns: number;
    runsToday: number;
    runsThisMonth: number;
    totalCost: string;
    costThisMonth: string;
  };
  marketplaces: {
    totalConnections: number;
    breakdown: Record<string, number>;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  subscriptionTier: string;
  points: number;
  level: number;
  isAdmin: boolean;
  createdAt: string;
  listingCount: number;
  marketplaceCount: number;
  aiAnalysisCount: number;
  totalAICost: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(1);

  const { token } = useSelector((state: RootState) => state.auth);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://quicksell.monster/api/v1';

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/stats/enhanced`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setError(err.response?.data?.error || 'Failed to fetch statistics');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/users/enhanced?page=${page}&limit=50&search=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data.data.users);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.error || 'Failed to fetch users');
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStats(), fetchUsers()]);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, searchTerm]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'default';
      case 'premium':
        return 'primary';
      case 'premium_plus':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={loadData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4">{stats?.users.total || 0}</Typography>
                  <Typography variant="caption" color="success.main">
                    +{stats?.users.newToday || 0} today
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Listings
                  </Typography>
                  <Typography variant="h4">{stats?.listings.total || 0}</Typography>
                  <Typography variant="caption" color="success.main">
                    {stats?.listings.active || 0} active
                  </Typography>
                </Box>
                <ArticleIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    AI Analysis Runs
                  </Typography>
                  <Typography variant="h4">{stats?.aiAnalysis.totalRuns || 0}</Typography>
                  <Typography variant="caption" color="warning.main">
                    {stats?.aiAnalysis.runsToday || 0} today
                  </Typography>
                </Box>
                <AIIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    AI Cost (Month)
                  </Typography>
                  <Typography variant="h4">${stats?.aiAnalysis.costThisMonth || '0.00'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total: ${stats?.aiAnalysis.totalCost || '0.00'}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} centered>
          <Tab label="Users" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Marketplaces" icon={<StoreIcon />} iconPosition="start" />
          <Tab label="AI Analytics" icon={<TrendingUpIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Users Tab */}
      <TabPanel value={currentTab} index={0}>
        <Paper elevation={3}>
          <Box p={2}>
            <TextField
              fullWidth
              placeholder="Search users by email or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Tier</TableCell>
                    <TableCell align="right">Listings</TableCell>
                    <TableCell align="right">Markets</TableCell>
                    <TableCell align="right">AI Runs</TableCell>
                    <TableCell align="right">AI Cost</TableCell>
                    <TableCell>Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        {user.username}
                        {user.isAdmin && (
                          <Chip
                            label="Admin"
                            size="small"
                            color="error"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.subscriptionTier}
                          size="small"
                          color={getTierColor(user.subscriptionTier) as any}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={user.listingCount} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={user.marketplaceCount} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={user.aiAnalysisCount}
                          size="small"
                          variant="outlined"
                          color={user.aiAnalysisCount > 10 ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        ${user.totalAICost.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      </TabPanel>

      {/* Marketplaces Tab */}
      <TabPanel value={currentTab} index={1}>
        <Paper elevation={3}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Marketplace Connections
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Total Connections: {stats?.marketplaces.totalConnections || 0}
            </Typography>

            <Grid container spacing={2}>
              {stats?.marketplaces.breakdown &&
                Object.entries(stats.marketplaces.breakdown).map(([marketplace, count]) => (
                  <Grid item xs={12} sm={6} md={4} key={marketplace}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">{marketplace}</Typography>
                          <Chip label={count} color="primary" />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </Paper>
      </TabPanel>

      {/* AI Analytics Tab */}
      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  AI Usage Statistics
                </Typography>
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Total Runs: {stats?.aiAnalysis.totalRuns || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today: {stats?.aiAnalysis.runsToday || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This Month: {stats?.aiAnalysis.runsThisMonth || 0}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  AI Cost Tracking
                </Typography>
                <Box mt={2}>
                  <Typography variant="h4" color="primary.main">
                    ${stats?.aiAnalysis.costThisMonth || '0.00'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This Month
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    All-Time Total: ${stats?.aiAnalysis.totalCost || '0.00'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info">
              AI analysis costs are estimated at $0.01 per photo using GPT-4o Vision (high detail mode).
              Actual costs may vary based on token usage.
            </Alert>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default AdminDashboard;
