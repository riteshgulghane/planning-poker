import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VotingState, Vote, VotingStats, FIBONACCI_SCALE } from 'shared';

interface VoteState {
  currentVote: number | null;
  votingState: VotingState;
  votes: Vote[];
  votingStats: VotingStats | null;
  selectedCard: number | null;
  canVote: boolean;
}

const initialState: VoteState = {
  currentVote: null,
  votingState: VotingState.VOTING,
  votes: [],
  votingStats: null,
  selectedCard: null,
  canVote: true,
};

export const voteSlice = createSlice({
  name: 'vote',
  initialState,
  reducers: {
    setCurrentVote: (state, action: PayloadAction<number | null>) => {
      state.currentVote = action.payload;
      state.selectedCard = action.payload;
    },
    setVotingState: (state, action: PayloadAction<VotingState>) => {
      state.votingState = action.payload;
      state.canVote = action.payload === VotingState.VOTING;
    },
    setVotes: (state, action: PayloadAction<Vote[]>) => {
      state.votes = action.payload;
    },
    setVotingStats: (state, action: PayloadAction<VotingStats | null>) => {
      state.votingStats = action.payload;
    },
    setSelectedCard: (state, action: PayloadAction<number | null>) => {
      state.selectedCard = action.payload;
    },
    resetVoting: (state) => {
      state.currentVote = null;
      state.votingState = VotingState.VOTING;
      state.votes = [];
      state.votingStats = null;
      state.selectedCard = null;
      state.canVote = true;
    },
    setCanVote: (state, action: PayloadAction<boolean>) => {
      state.canVote = action.payload;
    },
  },
});

export const {
  setCurrentVote,
  setVotingState,
  setVotes,
  setVotingStats,
  setSelectedCard,
  resetVoting,
  setCanVote,
} = voteSlice.actions;

// Selectors
export const selectFibonacciScale = () => FIBONACCI_SCALE;
export const selectIsVotingRevealed = (state: { vote: VoteState }) => 
  state.vote.votingState === VotingState.REVEALED;
