// Design System - Component Styling Guide
// This file contains all reusable styles for the app

import { StyleSheet } from 'react-native';

export const designSystem = {
  // Typography
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      lineHeight: 18,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // Common Styles
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
};

export default designSystem;
