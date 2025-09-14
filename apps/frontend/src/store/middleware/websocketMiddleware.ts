import { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import {
  SocketEvents,
  CreateRoomPayload,
  JoinRoomPayload,
  CreateStoryPayload,
  UpdateStoryPayload,
  DeleteStoryPayload,
  SetActiveStoryPayload,
  SubmitVotePayload,
  RevealVotesPayload,
  ResetVotesPayload,
  CreateRoomResponse,
  JoinRoomResponse,
  ErrorPayload,
  Room,
} from 'shared';
import { setCurrentUser, setConnected, setUserError, clearUserError } from '../slices/userSlice';
import { setCurrentRoom, updateRoom, setRoomError, clearRoomError } from '../slices/roomSlice';
import { setVotingState, resetVoting } from '../slices/voteSlice';

// WebSocket action types
export const websocketActions = {
  connect: 'websocket/connect',
  disconnect: 'websocket/disconnect',
  createRoom: 'websocket/createRoom',
  joinRoom: 'websocket/joinRoom',
  leaveRoom: 'websocket/leaveRoom',
  createStory: 'websocket/createStory',
  updateStory: 'websocket/updateStory',
  deleteStory: 'websocket/deleteStory',
  setActiveStory: 'websocket/setActiveStory',
  submitVote: 'websocket/submitVote',
  revealVotes: 'websocket/revealVotes',
  resetVotes: 'websocket/resetVotes',
} as const;

// Action creators
export const websocketActionCreators = {
  connect: (url: string) => ({ type: websocketActions.connect, payload: { url } }),
  disconnect: () => ({ type: websocketActions.disconnect }),
  createRoom: (payload: CreateRoomPayload) => ({ type: websocketActions.createRoom, payload }),
  joinRoom: (payload: JoinRoomPayload) => ({ type: websocketActions.joinRoom, payload }),
  leaveRoom: () => ({ type: websocketActions.leaveRoom }),
  createStory: (payload: CreateStoryPayload) => ({ type: websocketActions.createStory, payload }),
  updateStory: (payload: UpdateStoryPayload) => ({ type: websocketActions.updateStory, payload }),
  deleteStory: (payload: DeleteStoryPayload) => ({ type: websocketActions.deleteStory, payload }),
  setActiveStory: (payload: SetActiveStoryPayload) => ({ type: websocketActions.setActiveStory, payload }),
  submitVote: (payload: SubmitVotePayload) => ({ type: websocketActions.submitVote, payload }),
  revealVotes: (payload: RevealVotesPayload) => ({ type: websocketActions.revealVotes, payload }),
  resetVotes: (payload: ResetVotesPayload) => ({ type: websocketActions.resetVotes, payload }),
};

export const websocketMiddleware: Middleware = (store) => {
  let socket: Socket | null = null;

  return (next) => (action: any) => {
    const { dispatch } = store;

    switch (action.type) {
      case websocketActions.connect:
        if (socket) {
          socket.disconnect();
        }

        socket = io(action.payload.url, {
          transports: ['websocket', 'polling'],
        });

        // Connection event handlers
        socket.on('connect', () => {
          console.log('✅ Connected to WebSocket server');
          dispatch(setConnected(true));
          dispatch(clearUserError());
        });

        socket.on('disconnect', () => {
          console.log('❌ Disconnected from WebSocket server');
          dispatch(setConnected(false));
        });

        socket.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error);
          dispatch(setConnected(false));
          dispatch(setUserError('Failed to connect to server'));
        });

        // Room event handlers
        socket.on(SocketEvents.CREATE_ROOM, (response: CreateRoomResponse) => {
          console.log('✅ Room created:', response);
          dispatch(setCurrentUser(response.user));
          dispatch(setCurrentRoom(response.room));
          dispatch(clearUserError());
          dispatch(clearRoomError());
        });

        socket.on(SocketEvents.JOIN_ROOM, (response: JoinRoomResponse) => {
          console.log('✅ Joined room:', response);
          dispatch(setCurrentUser(response.user));
          dispatch(setCurrentRoom(response.room));
          dispatch(clearUserError());
          dispatch(clearRoomError());
        });

        socket.on(SocketEvents.ROOM_UPDATED, (room: Room) => {
          console.log('🔄 Room updated:', room);
          dispatch(updateRoom(room));
          dispatch(setVotingState(room.votingState));
        });

        socket.on(SocketEvents.USER_JOINED, (data: { user: any; roomId: string }) => {
          console.log('👋 User joined:', data);
        });

        socket.on(SocketEvents.USER_LEFT, (data: { userId: string; roomId: string }) => {
          console.log('👋 User left:', data);
        });

        // Error handler
        socket.on(SocketEvents.ERROR, (error: ErrorPayload) => {
          console.error('❌ WebSocket error:', error);
          switch (error.code) {
            case 'ROOM_NOT_FOUND':
            case 'CREATE_ROOM_ERROR':
            case 'JOIN_ROOM_ERROR':
              dispatch(setUserError(error.message));
              break;
            default:
              dispatch(setRoomError(error.message));
          }
        });

        break;

      case websocketActions.disconnect:
        if (socket) {
          socket.disconnect();
          socket = null;
          dispatch(setConnected(false));
        }
        break;

      case websocketActions.createRoom:
        if (socket) {
          console.log('🏠 Creating room:', action.payload);
          socket.emit(SocketEvents.CREATE_ROOM, action.payload);
        }
        break;

      case websocketActions.joinRoom:
        if (socket) {
          console.log('🚪 Joining room:', action.payload);
          socket.emit(SocketEvents.JOIN_ROOM, action.payload);
        }
        break;

      case websocketActions.leaveRoom:
        if (socket) {
          console.log('🚪 Leaving room');
          socket.emit(SocketEvents.LEAVE_ROOM);
        }
        break;

      case websocketActions.createStory:
        if (socket) {
          console.log('📝 Creating story:', action.payload);
          socket.emit(SocketEvents.CREATE_STORY, action.payload);
        }
        break;

      case websocketActions.updateStory:
        if (socket) {
          console.log('✏️ Updating story:', action.payload);
          socket.emit(SocketEvents.UPDATE_STORY, action.payload);
        }
        break;

      case websocketActions.deleteStory:
        if (socket) {
          console.log('🗑️ Deleting story:', action.payload);
          socket.emit(SocketEvents.DELETE_STORY, action.payload);
        }
        break;

      case websocketActions.setActiveStory:
        if (socket) {
          console.log('🎯 Setting active story:', action.payload);
          socket.emit(SocketEvents.SET_ACTIVE_STORY, action.payload);
        }
        break;

      case websocketActions.submitVote:
        if (socket) {
          console.log('🗳️ Submitting vote:', action.payload);
          socket.emit(SocketEvents.SUBMIT_VOTE, action.payload);
        }
        break;

      case websocketActions.revealVotes:
        if (socket) {
          console.log('👁️ Revealing votes:', action.payload);
          socket.emit(SocketEvents.REVEAL_VOTES, action.payload);
        }
        break;

      case websocketActions.resetVotes:
        if (socket) {
          console.log('🔄 Resetting votes:', action.payload);
          socket.emit(SocketEvents.RESET_VOTES, action.payload);
          dispatch(resetVoting());
        }
        break;
    }

    return next(action);
  };
};
