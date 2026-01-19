import React, { useState } from 'react';
import { Box } from '@mui/material';
import { BrokenImage as BrokenImageIcon } from '@mui/icons-material';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Image component with built-in fallback for broken images
 * Shows a placeholder icon when image fails to load
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = '',
  width = '100%',
  height = 'auto',
  style = {},
  className = '',
  objectFit = 'cover',
}) => {
  const [error, setError] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const handleError = () => {
    if (fallbackSrc && !usedFallback) {
      setUsedFallback(true);
    } else {
      setError(true);
    }
  };

  if (error) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          borderRadius: 1,
          ...style,
        }}
        className={className}
      >
        <BrokenImageIcon sx={{ fontSize: 48, color: '#ccc' }} />
      </Box>
    );
  }

  return (
    <img
      src={usedFallback ? fallbackSrc : src}
      alt={alt}
      onError={handleError}
      style={{
        width,
        height,
        objectFit,
        ...style,
      }}
      className={className}
    />
  );
};

export default ImageWithFallback;
