import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
  }>;
  modal: {
    isOpen: boolean;
    title: string;
    content: string;
    type: 'confirm' | 'alert' | 'custom';
  };
  loading: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
  modal: {
    isOpen: false,
    title: '',
    content: '',
    type: 'alert',
  },
  loading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    addNotification: (state, action: PayloadAction<UIState['notifications'][0]>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    openModal: (state, action: PayloadAction<Omit<UIState['modal'], 'isOpen'>>) => {
      state.modal = { ...action.payload, isOpen: true };
    },
    closeModal: (state) => {
      state.modal = { isOpen: false, title: '', content: '', type: 'alert' };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleTheme,
  addNotification,
  removeNotification,
  openModal,
  closeModal,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
