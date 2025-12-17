import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  TrendingUp,
  Speed,
  AttachMoney,
  Person,
  BusinessCenter,
  Home,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface CaseStudy {
  id: number;
  name: string;
  avatar: string;
  role: string;
  scenario: string;
  icon: JSX.Element;
  color: string;
  challenge: string;
  solution: string;
  results: {
    label: string;
    value: string;
    icon: JSX.Element;
  }[];
  testimonial: string;
  details: string[];
}

const caseStudies: CaseStudy[] = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    avatar: 'SM',
    role: 'Weekend Seller',
    scenario: 'Decluttering & Extra Income',
    icon: <Person sx={{ fontSize: 40 }} />,
    color: '#667eea',
    challenge: 'Sarah is a busy marketing manager who wanted to declutter her home and make some extra money on weekends. She tried listing items on Facebook Marketplace but found it time-consuming to photograph, describe, and price each item. She gave up after listing only 3 items over two months.',
    solution: 'Sarah discovered QuickSell while searching for "faster way to sell on Facebook Marketplace." She was skeptical but tried the free 3 listings. Within 10 minutes, she had professional listings for a designer handbag, vintage lamp, and kitchen mixer - complete with optimized descriptions and competitive pricing.',
    results: [
      {
        label: 'Items Listed',
        value: '47 items',
        icon: <CheckCircle />,
      },
      {
        label: 'Time Saved',
        value: '8+ hours',
        icon: <Speed />,
      },
      {
        label: 'Revenue Generated',
        value: '$2,340',
        icon: <AttachMoney />,
      },
      {
        label: 'Average Sale Time',
        value: '3.2 days',
        icon: <TrendingUp />,
      },
    ],
    testimonial: 'QuickSell turned my weekend decluttering project into a profitable side hustle. I listed 47 items in the time it used to take me to list 5. The AI descriptions are better than what I would write myself!',
    details: [
      'Started with free tier, upgraded to 50-listing package after first weekend',
      'Cross-posted to eBay, Facebook Marketplace, and OfferUp simultaneously',
      'Used AI pricing suggestions and sold items 40% faster than manually priced listings',
      'Earned $2,340 in 6 weeks while spending less than 2 hours per week',
      'Most popular items: designer clothing, home decor, kitchen appliances',
      'Now recommends QuickSell to friends (earned 25 referral credits)',
    ],
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    avatar: 'MJ',
    role: 'Urgent Seller',
    scenario: 'Moving Cross-Country Fast',
    icon: <Home sx={{ fontSize: 40 }} />,
    color: '#FF6B6B',
    challenge: 'Marcus accepted a dream job in Seattle but had only 3 weeks to sell his furniture and possessions before moving from Atlanta. He needed to liquidate almost everything - furniture, electronics, tools, sporting equipment. Traditional methods would take months, but he had less than a month.',
    solution: 'After spending an entire evening manually listing just 8 items on Craigslist, Marcus found QuickSell through a Google search for "sell everything fast before moving." He photographed his entire apartment in one afternoon, uploaded everything to QuickSell, and had professional listings on 5 platforms within 2 hours.',
    results: [
      {
        label: 'Items Listed',
        value: '132 items',
        icon: <CheckCircle />,
      },
      {
        label: 'Items Sold',
        value: '118 (89%)',
        icon: <TrendingUp />,
      },
      {
        label: 'Total Revenue',
        value: '$8,650',
        icon: <AttachMoney />,
      },
      {
        label: 'Time to Clear',
        value: '18 days',
        icon: <Speed />,
      },
    ],
    testimonial: 'I was stressed about the move until I found QuickSell. In 2 hours, I had everything listed on multiple platforms. The bulk upload feature saved my sanity. Made $8,650 and traveled light to Seattle!',
    details: [
      'Used 100-listing package + purchased additional credits',
      'Photographed entire apartment room-by-room in one afternoon',
      'Listed furniture on Facebook Marketplace (local pickup)',
      'Listed electronics on eBay (shipping nationwide)',
      'Listed tools and equipment on Craigslist and OfferUp',
      'Sold 89% of items within 18 days - much faster than expected',
      'Large items (furniture) sold in 2-5 days on average',
      'QuickSell paid for itself with the first 4 sales',
      'Donated remaining items to charity with peace of mind',
    ],
  },
  {
    id: 3,
    name: 'Jennifer Chen',
    avatar: 'JC',
    role: 'Professional Reseller',
    scenario: 'Scaling a Resale Business',
    icon: <BusinessCenter sx={{ fontSize: 40 }} />,
    color: '#FFD700',
    challenge: 'Jennifer runs a part-time resale business buying liquidation pallets and estate sale items. She was spending 15-20 hours per week just creating listings. As a single mom, she needed to scale her business without sacrificing time with her kids. Manual listing creation was the bottleneck preventing growth.',
    solution: 'Jennifer tried QuickSell after seeing it recommended in a reseller Facebook group. She tested it on a pallet of mixed electronics. What would have taken her 6 hours took 45 minutes with QuickSell. She immediately upgraded to the unlimited plan and restructured her entire workflow around batch photography and AI listing generation.',
    results: [
      {
        label: 'Monthly Listings',
        value: '450-600',
        icon: <CheckCircle />,
      },
      {
        label: 'Time Saved Monthly',
        value: '60+ hours',
        icon: <Speed />,
      },
      {
        label: 'Monthly Revenue',
        value: '$12,000-15,000',
        icon: <AttachMoney />,
      },
      {
        label: 'Business Growth',
        value: '340% increase',
        icon: <TrendingUp />,
      },
    ],
    testimonial: 'QuickSell transformed my side hustle into a real business. I went from listing 80 items per month to 500+. The time savings let me focus on sourcing better inventory and spending evenings with my kids instead of writing descriptions.',
    details: [
      'Creates 500+ listings monthly (previously 80-120)',
      'Dedicated photo station: white backdrop, consistent lighting, batch shooting',
      'Photographs 50-100 items per session, uploads in bulk',
      'Cross-posts to 8 platforms simultaneously',
      'AI pricing suggestions improved sell-through rate by 35%',
      'Reduced listing time from 15 minutes per item to 90 seconds',
      'Revenue increased from $3,500/month to $12,000-15,000/month',
      'QuickSell subscription cost: $29.99/month for 100 listings + additional credits',
      'ROI: Every $1 spent on QuickSell generates ~$400 in revenue',
      'Hired her first part-time assistant to handle shipping and customer service',
      'Plans to transition to full-time reselling within 6 months',
    ],
  },
];

const CaseStudies: React.FC = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" fontWeight="bold" gutterBottom align="center">
            Real Stories, Real Results
          </Typography>
          <Typography variant="h6" align="center" sx={{ opacity: 0.95, maxWidth: 800, mx: 'auto' }}>
            See how QuickSell helped casual sellers, urgent movers, and professional resellers save time and increase sales
          </Typography>
        </Container>
      </Box>

      {/* Case Studies */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {caseStudies.map((study, index) => (
          <Paper
            key={study.id}
            elevation={3}
            sx={{
              mb: 6,
              overflow: 'hidden',
              '&:hover': {
                boxShadow: 6,
              },
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${study.color} 0%, ${study.color}dd 100%)`,
                color: 'white',
                p: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'white',
                  color: study.color,
                  fontSize: 28,
                  fontWeight: 'bold',
                }}
              >
                {study.avatar}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {study.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip
                    label={study.role}
                    sx={{ bgcolor: 'white', color: study.color, fontWeight: 'bold' }}
                  />
                  <Typography variant="body1">{study.scenario}</Typography>
                </Box>
              </Box>
              {study.icon}
            </Box>

            {/* Content */}
            <Box sx={{ p: 4 }}>
              <Grid container spacing={4}>
                {/* Challenge & Solution */}
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold" color="error">
                      The Challenge
                    </Typography>
                    <Typography paragraph color="text.secondary">
                      {study.challenge}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold" color="success.main">
                      The Solution
                    </Typography>
                    <Typography paragraph color="text.secondary">
                      {study.solution}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Key Details
                    </Typography>
                    <List dense>
                      {study.details.map((detail, idx) => (
                        <ListItem key={idx} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle color="primary" sx={{ fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={detail}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: 'grey.100',
                      borderLeft: 4,
                      borderColor: study.color,
                    }}
                  >
                    <Typography variant="body1" fontStyle="italic" color="text.secondary">
                      "{study.testimonial}"
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      — {study.name}, {study.role}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Results */}
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Results
                  </Typography>
                  <Grid container spacing={2}>
                    {study.results.map((result, idx) => (
                      <Grid item xs={12} key={idx}>
                        <Card
                          sx={{
                            bgcolor: `${study.color}15`,
                            border: 2,
                            borderColor: `${study.color}40`,
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Box sx={{ color: study.color }}>{result.icon}</Box>
                              <Typography variant="caption" color="text.secondary">
                                {result.label}
                              </Typography>
                            </Box>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: study.color }}>
                              {result.value}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        ))}
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
            Ready to Write Your Success Story?
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Whether you're decluttering, moving, or building a resale business, QuickSell helps you sell faster and earn more.
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              component={Link}
              to="/auth/register"
              sx={{
                display: 'inline-block',
                px: 6,
                py: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 2,
                fontWeight: 'bold',
                textDecoration: 'none',
                fontSize: '1.1rem',
                '&:hover': {
                  opacity: 0.9,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s',
                },
              }}
            >
              Start Free - 3 Listings
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
              No credit card required • Upgrade anytime
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default CaseStudies;
