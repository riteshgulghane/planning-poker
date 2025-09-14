import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole } from 'shared';

interface UserState {
  currentUser: User | null;
  isConnected: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isConnected: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setUserError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    },
    updateUserRole: (state, action: PayloadAction<UserRole>) => {
      if (state.currentUser) {
        state.currentUser.role = action.payload;
      }
    },
    updateUserVote: (state, action: PayloadAction<{ vote: number | null; hasVoted: boolean }>) => {
      if (state.currentUser) {
        state.currentUser.vote = action.payload.vote;
        state.currentUser.hasVoted = action.payload.hasVoted;
      }
    },
  },
});

export const {
  setCurrentUser,
  clearCurrentUser,
  setConnected,
  setUserError,
  clearUserError,
  updateUserRole,
  updateUserVote,
} = userSlice.actions;
