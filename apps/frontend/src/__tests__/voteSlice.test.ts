import { voteSlice, setCurrentVote, setVotingState, resetVoting, setSelectedCard } from '../store/slices/voteSlice';
import { VotingState } from 'shared';

describe('voteSlice', () => {
  const initialState = {
    currentVote: null,
    votingState: VotingState.VOTING,
    votes: [],
    votingStats: null,
    selectedCard: null,
    canVote: true,
  };

  it('should return the initial state', () => {
    expect(voteSlice.reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setCurrentVote', () => {
    const actual = voteSlice.reducer(initialState, setCurrentVote(5));
    expect(actual.currentVote).toBe(5);
    expect(actual.selectedCard).toBe(5);
  });

  it('should handle setVotingState', () => {
    const actual = voteSlice.reducer(initialState, setVotingState(VotingState.REVEALED));
    expect(actual.votingState).toBe(VotingState.REVEALED);
    expect(actual.canVote).toBe(false);
  });

  it('should handle setSelectedCard', () => {
    const actual = voteSlice.reducer(initialState, setSelectedCard(8));
    expect(actual.selectedCard).toBe(8);
  });

  it('should handle resetVoting', () => {
    const stateWithVote = {
      ...initialState,
      currentVote: 5,
      selectedCard: 5,
      votingState: VotingState.REVEALED,
      canVote: false,
    };
    const actual = voteSlice.reducer(stateWithVote, resetVoting());
    expect(actual.currentVote).toBeNull();
    expect(actual.selectedCard).toBeNull();
    expect(actual.votingState).toBe(VotingState.VOTING);
    expect(actual.canVote).toBe(true);
  });
});
