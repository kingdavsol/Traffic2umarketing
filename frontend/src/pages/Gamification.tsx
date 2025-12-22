import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  LocalOffer as TagIcon,
  Whatshot as FireIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earned: boolean;
  earned_at?: string;
  progress?: number;
  requirement?: number;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  reward_points: number;
  progress: number;
  target: number;
  completed: boolean;
  expires_at?: string;
}

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  avatar?: string;
  points: number;
  sales_count: number;
  level: number;
}

interface UserStats {
  total_points: number;
  level: number;
  points_to_next_level: number;
  badges_earned: number;
  total_badges: number;
  sales_count: number;
  listings_count: number;
  streak_days: number;
}

const Gamification: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState('monthly');

  useEffect(() => {
    loadGamificationData();
  }, [leaderboardTimeframe]);

  const loadGamificationData = async () => {
    setLoading(true);
    try {
      // Load all gamification data in parallel
      const [statsRes, badgesRes, challengesRes, leaderboardRes] = await Promise.allSettled([
        api.getGamificationStats(),
        api.getBadges(),
        api.getChallenges(),
        api.getLeaderboard(leaderboardTimeframe, 'sales'),
      ]);

      // Handle stats
      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.data);
      } else {
        // Fallback mock data
        setStats({
          total_points: 1250,
          level: 5,
          points_to_next_level: 250,
          badges_earned: 8,
          total_badges: 20,
          sales_count: 23,
          listings_count: 45,
          streak_days: 7,
        });
      }

      // Handle badges
      if (badgesRes.status === 'fulfilled' && badgesRes.value.data?.success) {
        setBadges(badgesRes.value.data.data);
      } else {
        setBadges(getMockBadges());
      }

      // Handle challenges
      if (challengesRes.status === 'fulfilled' && challengesRes.value.data?.success) {
        setChallenges(challengesRes.value.data.data);
      } else {
        setChallenges(getMockChallenges());
      }

      // Handle leaderboard
      if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value.data?.success) {
        setLeaderboard(leaderboardRes.value.data.data);
      } else {
        setLeaderboard(getMockLeaderboard());
      }
    } catch (err) {
      console.error('Failed to load gamification data:', err);
      setError('Failed to load data. Using default values.');
    } finally {
      setLoading(false);
    }
  };

  const getMockBadges = (): Badge[] => [
    {
      id: 1,
      name: 'First Sale',
      description: 'Make your first sale',
      icon: '🎉',
      tier: 'bronze',
      earned: true,
      earned_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Quick Lister',
      description: 'Create 10 listings',
      icon: '📝',
      tier: 'bronze',
      earned: true,
      earned_at: new Date().toISOString(),
      progress: 10,
      requirement: 10,
    },
    {
      id: 3,
      name: 'Power Seller',
      description: 'Sell 50 items',
      icon: '⚡',
      tier: 'silver',
      earned: false,
      progress: 23,
      requirement: 50,
    },
    {
      id: 4,
      name: 'Marketplace Master',
      description: 'Connect 5 marketplaces',
      icon: '🌐',
      tier: 'silver',
      earned: false,
      progress: 3,
      requirement: 5,
    },
    {
      id: 5,
      name: 'Photo Pro',
      description: 'Upload 100 photos',
      icon: '📸',
      tier: 'gold',
      earned: false,
      progress: 67,
      requirement: 100,
    },
    {
      id: 6,
      name: 'Top Seller',
      description: 'Earn $10,000 in sales',
      icon: '💎',
      tier: 'platinum',
      earned: false,
      progress: 3420,
      requirement: 10000,
    },
  ];

  const getMockChallenges = (): Challenge[] => [
    {
      id: 1,
      title: 'Weekend Warrior',
      description: 'List 5 items this weekend',
      reward_points: 100,
      progress: 3,
      target: 5,
      completed: false,
      expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: 'Photo Perfectionist',
      description: 'Upload listings with 5+ photos each (10 listings)',
      reward_points: 150,
      progress: 7,
      target: 10,
      completed: false,
    },
    {
      id: 3,
      title: 'Speed Seller',
      description: 'Sell 3 items in one day',
      reward_points: 200,
      progress: 1,
      target: 3,
      completed: false,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const getMockLeaderboard = (): LeaderboardEntry[] => [
    { rank: 1, user_id: 1, username: 'SuperSeller', points: 5420, sales_count: 128, level: 12 },
    { rank: 2, user_id: 2, username: 'QuickFlip', points: 4890, sales_count: 115, level: 11 },
    { rank: 3, user_id: 3, username: 'MarketPro', points: 4320, sales_count: 98, level: 10 },
    { rank: 4, user_id: 4, username: 'You', points: 1250, sales_count: 23, level: 5 },
    { rank: 5, user_id: 5, username: 'FastSales', points: 980, sales_count: 19, level: 4 },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return '#999';
    }
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    const currentLevelPoints = stats.total_points % 500;
    return (currentLevelPoints / 500) * 100;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Achievements & Leaderboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Earn points, unlock badges, and compete with other sellers
        </Typography>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* User Stats Overview */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Level {stats.level}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stats.total_points.toLocaleString()} total points
                    </Typography>
                  </Box>
                  <Chip
                    icon={<FireIcon />}
                    label={`${stats.streak_days} day streak`}
                    color="error"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Progress to Level {stats.level + 1}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {stats.points_to_next_level} points to go
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getLevelProgress()}
                    sx={{ height: 10, borderRadius: 5 }}
                    color="primary"
                  />
                </Box>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main" fontWeight={700}>
                        {stats.badges_earned}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Badges Earned
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" fontWeight={700}>
                        {stats.sales_count}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Total Sales
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" fontWeight={700}>
                        {stats.listings_count}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Listings Created
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main" fontWeight={700}>
                        {stats.total_badges}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Total Badges
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrophyIcon /> Your Rank
                </Typography>
                <Typography variant="h2" fontWeight={700} sx={{ my: 2 }}>
                  #{leaderboard.find((entry) => entry.username === 'You')?.rank || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Out of {leaderboard.length} sellers this month
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Keep selling to climb the leaderboard!
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} variant="fullWidth">
          <Tab label="Badges" icon={<StarIcon />} iconPosition="start" />
          <Tab label="Challenges" icon={<FireIcon />} iconPosition="start" />
          <Tab label="Leaderboard" icon={<TrophyIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Badges Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {badges.map((badge) => (
            <Grid item xs={12} sm={6} md={4} key={badge.id}>
              <Card
                sx={{
                  height: '100%',
                  opacity: badge.earned ? 1 : 0.6,
                  border: badge.earned ? `2px solid ${getTierColor(badge.tier)}` : '2px solid transparent',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    transition: 'all 0.3s',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        fontSize: '2rem',
                        bgcolor: getTierColor(badge.tier),
                      }}
                    >
                      {badge.earned ? badge.icon : <LockIcon />}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {badge.name}
                      </Typography>
                      <Chip label={badge.tier} size="small" sx={{ bgcolor: getTierColor(badge.tier), color: 'white', mb: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        {badge.description}
                      </Typography>
                    </Box>
                  </Box>

                  {!badge.earned && badge.progress !== undefined && badge.requirement !== undefined && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="textSecondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {badge.progress} / {badge.requirement}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(badge.progress / badge.requirement) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  {badge.earned && badge.earned_at && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                      <CheckIcon fontSize="small" />
                      Earned {new Date(badge.earned_at).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Challenges Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {challenges.map((challenge) => (
            <Grid item xs={12} md={6} key={challenge.id}>
              <Card sx={{ height: '100%', opacity: challenge.completed ? 0.7 : 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {challenge.title}
                    </Typography>
                    <Chip
                      icon={<StarIcon />}
                      label={`${challenge.reward_points} pts`}
                      color="warning"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {challenge.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Progress
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {challenge.progress} / {challenge.target}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(challenge.progress / challenge.target) * 100}
                      color={challenge.completed ? 'success' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {challenge.expires_at && !challenge.completed && (
                    <Typography variant="caption" color="error.main">
                      Expires: {new Date(challenge.expires_at).toLocaleDateString()}
                    </Typography>
                  )}

                  {challenge.completed && (
                    <Chip icon={<CheckIcon />} label="Completed" color="success" size="small" />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 2 && (
        <Box>
          {/* Timeframe Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={leaderboardTimeframe}
              exclusive
              onChange={(e, newValue) => newValue && setLeaderboardTimeframe(newValue)}
            >
              <ToggleButton value="weekly">This Week</ToggleButton>
              <ToggleButton value="monthly">This Month</ToggleButton>
              <ToggleButton value="all_time">All Time</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Seller</TableCell>
                    <TableCell align="center">Level</TableCell>
                    <TableCell align="center">Sales</TableCell>
                    <TableCell align="right">Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((entry) => (
                    <TableRow
                      key={entry.rank}
                      sx={{
                        bgcolor: entry.username === 'You' ? 'action.selected' : 'transparent',
                        fontWeight: entry.username === 'You' ? 600 : 400,
                      }}
                      hover
                    >
                      <TableCell>
                        {entry.rank <= 3 ? (
                          <Chip
                            icon={<TrophyIcon />}
                            label={`#${entry.rank}`}
                            size="small"
                            sx={{
                              bgcolor: entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : '#CD7F32',
                              color: 'white',
                              fontWeight: 700,
                            }}
                          />
                        ) : (
                          `#${entry.rank}`
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>{entry.username[0]}</Avatar>
                          <Typography variant="body2" fontWeight={entry.username === 'You' ? 700 : 500}>
                            {entry.username}
                            {entry.username === 'You' && (
                              <Chip label="You" size="small" color="primary" sx={{ ml: 1 }} />
                            )}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={`Level ${entry.level}`} size="small" color="info" />
                      </TableCell>
                      <TableCell align="center">{entry.sales_count}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {entry.points.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default Gamification;
