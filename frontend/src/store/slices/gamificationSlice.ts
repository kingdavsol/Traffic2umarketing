import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Badge {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: '1' | '2' | '3' | 'special';
  unlockedAt?: string;
}

export interface Challenge {
  id: number;
  key: string;
  name: string;
  description: string;
  type: 'weekly' | 'monthly' | 'seasonal';
  progress: number;
  progressPercentage: number;
  status: 'active' | 'completed' | 'expired';
  rewardPoints: number;
}

export interface GamificationState {
  points: number;
  currentLevel: number;
  nextLevelPoints: number;
  badges: Badge[];
  challenges: Challenge[];
  streakDays: number;
  bestStreak: number;
  stats: {
    totalListings: number;
    totalSales: number;
    totalRevenue: number;
    positiveRatings: number;
  };
}

const initialState: GamificationState = {
  points: 0,
  currentLevel: 1,
  nextLevelPoints: 500,
  badges: [],
  challenges: [],
  streakDays: 0,
  bestStreak: 0,
  stats: {
    totalListings: 0,
    totalSales: 0,
    totalRevenue: 0,
    positiveRatings: 0,
  },
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    addPoints: (state, action: PayloadAction<number>) => {
      state.points += action.payload;
      // Check for level up
      if (state.points >= state.nextLevelPoints) {
        state.currentLevel += 1;
        state.nextLevelPoints = state.currentLevel * 500;
      }
    },
    unlockBadge: (state, action: PayloadAction<Badge>) => {
      state.badges.push(action.payload);
    },
    updateChallenge: (state, action: PayloadAction<Challenge>) => {
      const index = state.challenges.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.challenges[index] = action.payload;
      } else {
        state.challenges.push(action.payload);
      }
    },
    updateStreak: (state, action: PayloadAction<number>) => {
      state.streakDays = action.payload;
      if (state.streakDays > state.bestStreak) {
        state.bestStreak = state.streakDays;
      }
    },
    resetStreak: (state) => {
      state.streakDays = 0;
    },
    updateStats: (state, action: PayloadAction<Partial<GamificationState['stats']>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    setGamificationData: (state, action: PayloadAction<GamificationState>) => {
      return action.payload;
    },
  },
});

export const {
  addPoints,
  unlockBadge,
  updateChallenge,
  updateStreak,
  resetStreak,
  updateStats,
  setGamificationData,
} = gamificationSlice.actions;

export default gamificationSlice.reducer;
