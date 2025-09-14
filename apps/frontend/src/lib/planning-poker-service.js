const { v4: uuidv4 } = require('uuid');

// Import from shared (assuming it's built)
const shared = require('shared');

class PlanningPokerService {
  constructor() {
    this.rooms = new Map();
  }

  /**
   * Room management
   */
  createRoom(payload) {
    const roomId = uuidv4();
    const userId = uuidv4();
    
    // Create moderator user
    const user = {
      id: userId,
      name: payload.userName,
      role: 'MODERATOR', // UserRole.MODERATOR
      roomId,
      vote: null,
      hasVoted: false,
    };
    
    // Create room
    const room = {
      id: roomId,
      name: payload.roomName,
      participants: [user],
      stories: [],
      activeStoryId: null,
      votingState: 'VOTING', // VotingState.VOTING
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
      role: 'PARTICIPANT', // UserRole.PARTICIPANT
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
    if (!room) {
      return null;
    }
    
    const userIndex = room.participants.findIndex(p => p.id === userId);
    if (userIndex === -1) {
      return null;
    }
    
    // Remove user from room
    room.participants.splice(userIndex, 1);
    console.log(`User ${userId} left room ${roomId}`);
    
    // If room is empty, delete it
    if (room.participants.length === 0) {
      this.rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (no participants left)`);
      return null;
    }
    
    // If the user who left was a moderator, assign a new moderator
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
    
    if (!room) {
      return null;
    }
    
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
    
    // If this is the first story, set it as active
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
    
    if (!room || room.votingState === 'REVEALED') {
      return null;
    }
    
    const user = room.participants.find(p => p.id === userId);
    if (!user) {
      return null;
    }
    
    user.vote = value;
    user.hasVoted = true;
    
    // Record vote for the active story
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
    
    if (!room) {
      return null;
    }
    
    room.votingState = 'REVEALED';
    console.log(`Votes revealed in room ${roomId}`);
    
    return room;
  }

  resetVotes(roomId) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return null;
    }
    
    room.votingState = 'VOTING';
    
    // Reset votes for all participants
    room.participants.forEach(p => {
      p.vote = null;
      p.hasVoted = false;
    });
    
    // Clear votes for the active story
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

module.exports = { PlanningPokerService };
