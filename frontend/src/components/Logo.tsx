import React from 'react';
import { Box, Typography } from '@mui/material';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  variant?: 'default' | 'light' | 'dark';
  onClick?: () => void;
}

/**
 * QuickSell Logo Component
 * Single source of truth for the logo SVG across the application
 */
const Logo: React.FC<LogoProps> = ({
  size = 40,
  showText = false,
  textColor = '#007AFF',
  variant = 'default',
  onClick,
}) => {
  const bgColor = variant === 'light' ? '#FFFFFF' : '#007AFF';
  const monsterColor = '#FF6B6B';
  const eyeWhite = variant === 'light' ? '#007AFF' : '#FFFFFF';
  const eyeBlack = '#000000';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="64" height="64" fill={bgColor} rx="8" />
        {/* Monster Head */}
        <circle cx="32" cy="22" r="11" fill={monsterColor} />
        {/* Left Eye */}
        <circle cx="27" cy="19" r="2.5" fill={eyeWhite} />
        <circle cx="27" cy="19" r="1.2" fill={eyeBlack} />
        {/* Right Eye */}
        <circle cx="37" cy="19" r="2.5" fill={eyeWhite} />
        <circle cx="37" cy="19" r="1.2" fill={eyeBlack} />
        {/* Smile */}
        <path
          d="M 26 26 Q 32 28 38 26"
          stroke={eyeBlack}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        {/* Monster Body */}
        <ellipse cx="32" cy="38" rx="11" ry="13" fill={monsterColor} />
        {/* Body Highlight */}
        <ellipse cx="32" cy="40" rx="6" ry="8" fill="#FFB3BA" opacity="0.8" />
      </svg>
      {showText && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: textColor,
            letterSpacing: '-0.02em',
          }}
        >
          QuickSell
        </Typography>
      )}
    </Box>
  );
};

export default Logo;
