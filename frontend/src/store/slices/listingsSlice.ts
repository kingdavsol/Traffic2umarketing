import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Listing {
  id: number;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  price: number;
  estimatedPrice?: number;
  status: 'draft' | 'published' | 'sold' | 'delisted' | 'archived';
  photos: string[];
  viewCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ListingsState {
  listings: Listing[];
  selectedListing: Listing | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
}

const initialState: ListingsState = {
  listings: [],
  selectedListing: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
};

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    fetchListingsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchListingsSuccess: (state, action: PayloadAction<{ listings: Listing[]; total: number }>) => {
      state.isLoading = false;
      state.listings = action.payload.listings;
      state.totalCount = action.payload.total;
    },
    fetchListingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createListingStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createListingSuccess: (state, action: PayloadAction<Listing>) => {
      state.isLoading = false;
      state.listings.unshift(action.payload);
      state.totalCount += 1;
    },
    createListingFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    selectListing: (state, action: PayloadAction<Listing>) => {
      state.selectedListing = action.payload;
    },
    updateListing: (state, action: PayloadAction<Listing>) => {
      const index = state.listings.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) {
        state.listings[index] = action.payload;
      }
      if (state.selectedListing?.id === action.payload.id) {
        state.selectedListing = action.payload;
      }
    },
    deleteListing: (state, action: PayloadAction<number>) => {
      state.listings = state.listings.filter((l) => l.id !== action.payload);
      state.totalCount -= 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
});

export const {
  fetchListingsStart,
  fetchListingsSuccess,
  fetchListingsFailure,
  createListingStart,
  createListingSuccess,
  createListingFailure,
  selectListing,
  updateListing,
  deleteListing,
  setCurrentPage,
} = listingsSlice.actions;

export default listingsSlice.reducer;
