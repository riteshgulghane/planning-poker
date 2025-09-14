import { userSlice, setCurrentUser, clearCurrentUser, setConnected, updateUserVote } from '../store/slices/userSlice';
import { User, UserRole } from 'shared';

describe('userSlice', () => {
  const initialState = {
    currentUser: null,
    isConnected: false,
    error: null,
  };

  const mockUser: User = {
    id: '123',
    name: 'Test User',
    role: UserRole.MODERATOR,
    roomId: 'room-123',
    vote: null,
    hasVoted: false,
  };

  it('should return the initial state', () => {
    expect(userSlice.reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setCurrentUser', () => {
    const actual = userSlice.reducer(initialState, setCurrentUser(mockUser));
    expect(actual.currentUser).toEqual(mockUser);
    expect(actual.error).toBeNull();
  });

  it('should handle clearCurrentUser', () => {
    const stateWithUser = { ...initialState, currentUser: mockUser };
    const actual = userSlice.reducer(stateWithUser, clearCurrentUser());
    expect(actual.currentUser).toBeNull();
  });

  it('should handle setConnected', () => {
    const actual = userSlice.reducer(initialState, setConnected(true));
    expect(actual.isConnected).toBe(true);
  });

  it('should handle updateUserVote', () => {
    const stateWithUser = { ...initialState, currentUser: mockUser };
    const actual = userSlice.reducer(stateWithUser, updateUserVote({ vote: 5, hasVoted: true }));
    expect(actual.currentUser?.vote).toBe(5);
    expect(actual.currentUser?.hasVoted).toBe(true);
  });
});
