import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import listingsReducer from './slices/listingsSlice';
import uiReducer from './slices/uiSlice';
import gamificationReducer from './slices/gamificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    listings: listingsReducer,
    ui: uiReducer,
    gamification: gamificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
