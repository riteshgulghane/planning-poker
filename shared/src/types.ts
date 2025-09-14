/**
 * User related types
 */
export interface User {
  id: string;
  name: string;
  role: UserRole;
  roomId: string;
  vote: number | null;
  hasVoted: boolean;
}

export enum UserRole {
  MODERATOR = 'MODERATOR',
  PARTICIPANT = 'PARTICIPANT'
}

/**
 * Room related types
 */
export interface Room {
  id: string;
  name: string;
  participants: User[];
  stories: Story[];
  activeStoryId: string | null;
  votingState: VotingState;
}

export enum VotingState {
  VOTING = 'VOTING',
  REVEALED = 'REVEALED'
}

/**
 * Story related types
 */
export interface Story {
  id: string;
  title: string;
  description: string;
  votes: Vote[];
  isActive: boolean;
  isCompleted: boolean;
  finalEstimation: number | null;
}

export interface Vote {
  userId: string;
  value: number | null; // null for '?' card
}

/**
 * Stats for voting results
 */
export interface VotingStats {
  average: number;
  min: number;
  max: number;
  count: number;
}

/**
 * Socket event types
 */
export enum SocketEvents {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // Room events
  CREATE_ROOM = 'createRoom',
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  ROOM_UPDATED = 'roomUpdated',
  
  // User events
  USER_JOINED = 'userJoined',
  USER_LEFT = 'userLeft',
  
  // Story events
  CREATE_STORY = 'createStory',
  UPDATE_STORY = 'updateStory',
  DELETE_STORY = 'deleteStory',
  SET_ACTIVE_STORY = 'setActiveStory',
  
  // Voting events
  SUBMIT_VOTE = 'submitVote',
  REVEAL_VOTES = 'revealVotes',
  RESET_VOTES = 'resetVotes',
  
  // Error events
  ERROR = 'error'
}

/**
 * Socket event payload types
 */
export interface CreateRoomPayload {
  userName: string;
  roomName: string;
}

export interface CreateRoomResponse {
  room: Room;
  user: User;
}

export interface JoinRoomPayload {
  userName: string;
  roomId: string;
}

export interface JoinRoomResponse {
  room: Room;
  user: User;
}

export interface CreateStoryPayload {
  roomId: string;
  title: string;
  description: string;
}

export interface UpdateStoryPayload {
  roomId: string;
  storyId: string;
  title?: string;
  description?: string;
}

export interface DeleteStoryPayload {
  roomId: string;
  storyId: string;
}

export interface SetActiveStoryPayload {
  roomId: string;
  storyId: string;
}

export interface SubmitVotePayload {
  roomId: string;
  userId: string;
  value: number | null;
}

export interface RevealVotesPayload {
  roomId: string;
}

export interface ResetVotesPayload {
  roomId: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
}

/**
 * Constants
 */
export const FIBONACCI_SCALE = [1, 2, 3, 5, 8, 13, 21, null]; // null represents '?'
