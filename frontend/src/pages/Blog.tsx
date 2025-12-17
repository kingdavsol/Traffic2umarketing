import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Article, Schedule, TrendingUp } from '@mui/icons-material';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How to Sell on eBay Fast: Complete Guide for 2025',
    slug: 'how-to-sell-on-ebay-fast-guide',
    excerpt: 'Master the art of selling on eBay with our comprehensive guide. Learn how to create winning listings, price competitively, and close sales faster.',
    category: 'eBay',
    readTime: '8 min',
    date: 'Dec 15, 2025',
    image: '/blog/ebay-selling-guide.jpg',
  },
  {
    id: '2',
    title: 'Facebook Marketplace Tips: Sell Items Faster in 2025',
    slug: 'facebook-marketplace-tips-sell-faster',
    excerpt: 'Discover proven strategies to sell on Facebook Marketplace. From photography tips to pricing strategies, learn how to stand out from competitors.',
    category: 'Facebook Marketplace',
    readTime: '6 min',
    date: 'Dec 14, 2025',
    image: '/blog/facebook-marketplace.jpg',
  },
  {
    id: '3',
    title: 'Craigslist Selling Guide: Safety Tips & Best Practices',
    slug: 'craigslist-selling-guide-safety-tips',
    excerpt: 'Learn how to sell safely on Craigslist. Essential safety tips, best practices, and strategies to maximize your sales while staying secure.',
    category: 'Craigslist',
    readTime: '7 min',
    date: 'Dec 13, 2025',
    image: '/blog/craigslist-guide.jpg',
  },
  {
    id: '4',
    title: 'AI-Powered Listing Generation: The Future of Online Selling',
    slug: 'ai-powered-listing-generation-future',
    excerpt: 'Discover how AI is revolutionizing online selling. Learn how automated listing generation can save hours and increase your sales.',
    category: 'Technology',
    readTime: '5 min',
    date: 'Dec 12, 2025',
    image: '/blog/ai-listings.jpg',
  },
  {
    id: '5',
    title: 'Cross-Posting to Multiple Marketplaces: Ultimate Strategy',
    slug: 'cross-posting-multiple-marketplaces-strategy',
    excerpt: 'Maximize your reach by selling on multiple platforms simultaneously. Learn the best strategies for cross-posting without getting overwhelmed.',
    category: 'Strategy',
    readTime: '9 min',
    date: 'Dec 11, 2025',
    image: '/blog/cross-posting.jpg',
  },
  {
    id: '6',
    title: 'Pricing Strategy for Online Marketplaces: What Works in 2025',
    slug: 'pricing-strategy-online-marketplaces',
    excerpt: 'Get your pricing right with data-driven strategies. Learn how to price competitively while maximizing profit across all major marketplaces.',
    category: 'Pricing',
    readTime: '6 min',
    date: 'Dec 10, 2025',
    image: '/blog/pricing-strategy.jpg',
  },
];

const Blog: React.FC = () => {
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
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{ color: 'white', mb: 2, '& .MuiBreadcrumbs-separator': { color: 'white' } }}
          >
            <MuiLink component={Link} to="/" sx={{ color: 'white', textDecoration: 'none' }}>
              Home
            </MuiLink>
            <Typography color="white">Blog</Typography>
          </Breadcrumbs>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            <Article sx={{ fontSize: 48, verticalAlign: 'middle', mr: 2 }} />
            QuickSell Blog
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: 800 }}>
            Expert tips, guides, and strategies for selling on eBay, Facebook Marketplace, Craigslist, and 20+ other platforms. Learn how to maximize your sales with AI-powered tools.
          </Typography>
        </Container>
      </Box>

      {/* Blog Posts Grid */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {blogPosts.map((post) => (
            <Grid item xs={12} md={6} lg={4} key={post.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea component={Link} to={`/blog/${post.slug}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Article sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={post.category} size="small" color="primary" />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <Schedule sx={{ fontSize: 16 }} />
                        <Typography variant="caption">{post.readTime}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {post.date}
                      </Typography>
                    </Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 1 }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.excerpt}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* SEO Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom fontWeight="bold" align="center" sx={{ mb: 4 }}>
            <TrendingUp sx={{ verticalAlign: 'middle', mr: 1 }} />
            Start Selling Smarter Today
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
            Whether you're selling on eBay, Facebook Marketplace, Craigslist, OfferUp, Mercari, or any other platform, QuickSell's AI-powered listing generator helps you create professional listings in seconds. Take a photo, get instant descriptions and pricing, and start selling faster than ever.
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={Link} to="/auth/register" sx={{ textDecoration: 'none' }}>
              <Typography
                component="span"
                sx={{
                  display: 'inline-block',
                  px: 4,
                  py: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 2,
                  fontWeight: 'bold',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              >
                Get Started Free
              </Typography>
            </MuiLink>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Blog;
