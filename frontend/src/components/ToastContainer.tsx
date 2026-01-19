import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert, Stack } from '@mui/material';
import { RootState } from '../store';
import { removeToast } from '../store/slices/uiSlice';

/**
 * Global Toast Container
 * Renders toasts from Redux UI state
 * Include this once in App.tsx or Layout.tsx
 */
const ToastContainer: React.FC = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state: RootState) => state.ui.toasts);

  const handleClose = (id: string) => {
    dispatch(removeToast(id));
  };

  return (
    <Stack
      spacing={1}
      sx={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        maxWidth: '90vw',
      }}
    >
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration || 5000}
          onClose={() => handleClose(toast.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ position: 'relative', mb: 1 }}
        >
          <Alert
            severity={toast.type}
            variant="filled"
            onClose={() => handleClose(toast.id)}
            sx={{ width: '100%', minWidth: 280 }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default ToastContainer;

// Helper function to generate unique toast IDs
export const generateToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
