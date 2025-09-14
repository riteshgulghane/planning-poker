import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from './slices/userSlice';
import { roomSlice } from './slices/roomSlice';
import { voteSlice } from './slices/voteSlice';
import { websocketMiddleware } from './middleware/websocketMiddleware';

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    room: roomSlice.reducer,
    vote: voteSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['websocket/connect', 'websocket/disconnect'],
      },
    }).concat(websocketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
