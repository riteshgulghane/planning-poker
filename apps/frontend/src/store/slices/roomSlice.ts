import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Room, User, Story } from 'shared';

interface RoomState {
  currentRoom: Room | null;
  participants: User[];
  stories: Story[];
  activeStoryId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  currentRoom: null,
  participants: [],
  stories: [],
  activeStoryId: null,
  loading: false,
  error: null,
};

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setCurrentRoom: (state, action: PayloadAction<Room>) => {
      state.currentRoom = action.payload;
      state.participants = action.payload.participants;
      state.stories = action.payload.stories;
      state.activeStoryId = action.payload.activeStoryId;
      state.error = null;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
      state.participants = [];
      state.stories = [];
      state.activeStoryId = null;
    },
    updateRoom: (state, action: PayloadAction<Room>) => {
      state.currentRoom = action.payload;
      state.participants = action.payload.participants;
      state.stories = action.payload.stories;
      state.activeStoryId = action.payload.activeStoryId;
    },
    addParticipant: (state, action: PayloadAction<User>) => {
      const existingIndex = state.participants.findIndex(p => p.id === action.payload.id);
      if (existingIndex === -1) {
        state.participants.push(action.payload);
      }
    },
    removeParticipant: (state, action: PayloadAction<string>) => {
      state.participants = state.participants.filter(p => p.id !== action.payload);
    },
    addStory: (state, action: PayloadAction<Story>) => {
      const existingIndex = state.stories.findIndex(s => s.id === action.payload.id);
      if (existingIndex === -1) {
        state.stories.push(action.payload);
      }
    },
    updateStory: (state, action: PayloadAction<Story>) => {
      const index = state.stories.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.stories[index] = action.payload;
      }
    },
    removeStory: (state, action: PayloadAction<string>) => {
      state.stories = state.stories.filter(s => s.id !== action.payload);
    },
    setActiveStory: (state, action: PayloadAction<string | null>) => {
      state.activeStoryId = action.payload;
      state.stories.forEach(story => {
        story.isActive = story.id === action.payload;
      });
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setRoomError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearRoomError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCurrentRoom,
  clearCurrentRoom,
  updateRoom,
  addParticipant,
  removeParticipant,
  addStory,
  updateStory,
  removeStory,
  setActiveStory,
  setLoading,
  setRoomError,
  clearRoomError,
} = roomSlice.actions;
