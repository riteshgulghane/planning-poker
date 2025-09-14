const path = require('path');
const express = require('express');
const { createServer } = require('http');
const { Server: IOServer } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const httpServer = createServer(app);

// Socket.IO server setup
const io = new IOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Planning Poker Service (inline implementation)
class PlanningPokerService {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(payload) {
    const roomId = uuidv4();
    const userId = uuidv4();
    
    const user = {
      id: userId,
      name: payload.userName,
      role: 'MODERATOR',
      roomId,
      vote: null,
      hasVoted: false,
    };
    
    const room = {
      id: roomId,
      name: payload.roomName,
      participants: [user],
      stories: [],
      activeStoryId: null,
      votingState: 'VOTING',
    };
    
    this.rooms.set(roomId, room);
    console.log(`Room created: ${roomId} by user ${userId}`);
    
    return { room, user };
  }

  joinRoom(payload) {
    const { roomId, userName } = payload;
    const room = this.rooms.get(roomId);
    
    if (!room) {
      console.warn(`Room not found: ${roomId}`);
      return null;
    }
    
    const userId = uuidv4();
    const user = {
      id: userId,
      name: userName,
      role: 'PARTICIPANT',
      roomId,
      vote: null,
      hasVoted: false,
    };
    
    room.participants.push(user);
    console.log(`User ${userId} joined room ${roomId}`);
    
    return { room, user };
  }

  leaveRoom(userId, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    const userIndex = room.participants.findIndex(p => p.id === userId);
    if (userIndex === -1) return null;
    
    room.participants.splice(userIndex, 1);
    console.log(`User ${userId} left room ${roomId}`);
    
    if (room.participants.length === 0) {
      this.rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (no participants left)`);
      return null;
    }
    
    if (room.participants.every(p => p.role !== 'MODERATOR')) {
      const newModerator = room.participants[0];
      newModerator.role = 'MODERATOR';
      console.log(`New moderator assigned in room ${roomId}: ${newModerator.id}`);
    }
    
    return room;
  }

  createStory(payload) {
    const { roomId, title, description } = payload;
    const room = this.rooms.get(roomId);
    
    if (!room) return null;
    
    const storyId = uuidv4();
    const newStory = {
      id: storyId,
      title,
      description,
      votes: [],
      isActive: false,
      isCompleted: false,
      finalEstimation: null,
    };
    
    room.stories.push(newStory);
    
    if (room.stories.length === 1) {
      room.activeStoryId = storyId;
      newStory.isActive = true;
    }
    
    console.log(`Story created: ${storyId} in room ${roomId}`);
    return room;
  }

  submitVote(payload) {
    const { roomId, userId, value } = payload;
    const room = this.rooms.get(roomId);
    
    if (!room || room.votingState === 'REVEALED') return null;
    
    const user = room.participants.find(p => p.id === userId);
    if (!user) return null;
    
    user.vote = value;
    user.hasVoted = true;
    
    if (room.activeStoryId) {
      const story = room.stories.find(s => s.id === room.activeStoryId);
      if (story) {
        const existingVote = story.votes.find(v => v.userId === userId);
        if (existingVote) {
          existingVote.value = value;
        } else {
          story.votes.push({ userId, value });
        }
      }
    }
    
    console.log(`Vote submitted by user ${userId} in room ${roomId}`);
    return room;
  }

  revealVotes(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    room.votingState = 'REVEALED';
    console.log(`Votes revealed in room ${roomId}`);
    return room;
  }

  resetVotes(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    room.votingState = 'VOTING';
    
    room.participants.forEach(p => {
      p.vote = null;
      p.hasVoted = false;
    });
    
    if (room.activeStoryId) {
      const story = room.stories.find(s => s.id === room.activeStoryId);
      if (story) {
        story.votes = [];
        story.finalEstimation = null;
      }
    }
    
    console.log(`Votes reset in room ${roomId}`);
    return room;
  }
}

// Initialize services
const planningPokerService = new PlanningPokerService();
const clientRooms = new Map();
const clientIds = new Map();

// Socket Events
const SocketEvents = {
  CREATE_ROOM: 'CREATE_ROOM',
  JOIN_ROOM: 'JOIN_ROOM',
  LEAVE_ROOM: 'LEAVE_ROOM',
  ROOM_UPDATED: 'ROOM_UPDATED',
  USER_JOINED: 'USER_JOINED',
  USER_LEFT: 'USER_LEFT',
  CREATE_STORY: 'CREATE_STORY',
  SUBMIT_VOTE: 'SUBMIT_VOTE',
  REVEAL_VOTES: 'REVEAL_VOTES',
  RESET_VOTES: 'RESET_VOTES',
  ERROR: 'ERROR',
};

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    const roomId = clientRooms.get(socket.id);
    const userId = clientIds.get(socket.id);
    
    if (roomId && userId) {
      const room = planningPokerService.leaveRoom(userId, roomId);
      
      clientRooms.delete(socket.id);
      clientIds.delete(socket.id);
      
      if (room) {
        socket.leave(roomId);
        io.to(roomId).emit(SocketEvents.ROOM_UPDATED, room);
        io.to(roomId).emit(SocketEvents.USER_LEFT, { userId, roomId });
      }
    }
  });

  socket.on(SocketEvents.CREATE_ROOM, (payload) => {
    try {
      const result = planningPokerService.createRoom(payload);
      const { room, user } = result;
      
      clientRooms.set(socket.id, room.id);
      clientIds.set(socket.id, user.id);
      
      socket.join(room.id);
      socket.emit(SocketEvents.CREATE_ROOM, result);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, { code: 'CREATE_ROOM_ERROR', message: 'Failed to create room' });
    }
  });

  socket.on(SocketEvents.JOIN_ROOM, (payload) => {
    try {
      const result = planningPokerService.joinRoom(payload);
      
      if (!result) {
        socket.emit(SocketEvents.ERROR, { code: 'ROOM_NOT_FOUND', message: `Room with ID ${payload.roomId} not found` });
        return;
      }
      
      const { room, user } = result;
      
      clientRooms.set(socket.id, room.id);
      clientIds.set(socket.id, user.id);
      
      socket.join(room.id);
      socket.emit(SocketEvents.JOIN_ROOM, result);
      
      socket.to(room.id).emit(SocketEvents.USER_JOINED, { user, roomId: room.id });
      socket.to(room.id).emit(SocketEvents.ROOM_UPDATED, room);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, { code: 'JOIN_ROOM_ERROR', message: 'Failed to join room' });
    }
  });

  socket.on(SocketEvents.CREATE_STORY, (payload) => {
    try {
      const room = planningPokerService.createStory(payload);
      if (room) {
        io.to(payload.roomId).emit(SocketEvents.ROOM_UPDATED, room);
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, { code: 'CREATE_STORY_ERROR', message: 'Failed to create story' });
    }
  });

  socket.on(SocketEvents.SUBMIT_VOTE, (payload) => {
    try {
      const room = planningPokerService.submitVote(payload);
      if (room) {
        io.to(payload.roomId).emit(SocketEvents.ROOM_UPDATED, room);
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, { code: 'SUBMIT_VOTE_ERROR', message: 'Failed to submit vote' });
    }
  });

  socket.on(SocketEvents.REVEAL_VOTES, (payload) => {
    try {
      const room = planningPokerService.revealVotes(payload.roomId);
      if (room) {
        io.to(payload.roomId).emit(SocketEvents.ROOM_UPDATED, room);
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, { code: 'REVEAL_VOTES_ERROR', message: 'Failed to reveal votes' });
    }
  });

  socket.on(SocketEvents.RESET_VOTES, (payload) => {
    try {
      const room = planningPokerService.resetVotes(payload.roomId);
      if (room) {
        io.to(payload.roomId).emit(SocketEvents.ROOM_UPDATED, room);
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, { code: 'RESET_VOTES_ERROR', message: 'Failed to reset votes' });
    }
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'planning-poker-unified'
  });
});

// Serve static files from the frontend build folder
app.use(express.static(path.join(__dirname, '../frontend/out')));

// Handle React Router - send all non-API requests to React app
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/out', 'index.html'));
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Planning Poker unified server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 Frontend served from: ${path.join(__dirname, '../frontend/out')}`);
});
