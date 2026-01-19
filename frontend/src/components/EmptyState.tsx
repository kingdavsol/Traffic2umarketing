import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Inbox as InboxIcon,
  ShoppingCart as CartIcon,
  EmojiEvents as TrophyIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
} from '@mui/icons-material';

type EmptyStateType = 'listings' | 'sales' | 'achievements' | 'search' | 'marketplaces' | 'generic';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const defaultContent: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string; actionLabel: string }> = {
  listings: {
    icon: <CartIcon sx={{ fontSize: 80, color: '#ccc' }} />,
    title: 'No listings yet',
    description: 'Create your first listing by uploading a photo. Our AI will do the rest!',
    actionLabel: 'Create Listing',
  },
  sales: {
    icon: <ShippingIcon sx={{ fontSize: 80, color: '#ccc' }} />,
    title: 'No sales yet',
    description: 'Once you make a sale, it will appear here. Keep listing to increase your chances!',
    actionLabel: 'View Listings',
  },
  achievements: {
    icon: <TrophyIcon sx={{ fontSize: 80, color: '#ccc' }} />,
    title: 'No achievements yet',
    description: 'Complete tasks and make sales to earn badges and climb the leaderboard!',
    actionLabel: 'View Challenges',
  },
  search: {
    icon: <SearchIcon sx={{ fontSize: 80, color: '#ccc' }} />,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters.',
    actionLabel: 'Clear Search',
  },
  marketplaces: {
    icon: <StoreIcon sx={{ fontSize: 80, color: '#ccc' }} />,
    title: 'No marketplaces connected',
    description: 'Connect your marketplace accounts to start posting listings automatically.',
    actionLabel: 'Connect Marketplace',
  },
  generic: {
    icon: <InboxIcon sx={{ fontSize: 80, color: '#ccc' }} />,
    title: 'Nothing here yet',
    description: 'This section is empty. Check back later!',
    actionLabel: 'Go Home',
  },
};

/**
 * Reusable Empty State Component
 * Use this when a page or section has no content to display
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  const content = defaultContent[type];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        bgcolor: 'transparent',
        border: '2px dashed #e0e0e0',
        borderRadius: 2,
      }}
    >
      <Box sx={{ mb: 3 }}>
        {icon || content.icon}
      </Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {title || content.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
        {description || content.description}
      </Typography>
      {onAction && (
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={onAction}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            px: 4,
            py: 1.5,
          }}
        >
          {actionLabel || content.actionLabel}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
