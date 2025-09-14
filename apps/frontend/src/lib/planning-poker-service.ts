import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Room,
  Story,
  UserRole,
  VotingState,
  CreateRoomPayload,
  JoinRoomPayload,
  CreateStoryPayload,
  UpdateStoryPayload,
  SetActiveStoryPayload,
  SubmitVotePayload,
  Vote,
  VotingStats,
} from 'shared';

class PlanningPokerService {
  private rooms: Map<string, Room> = new Map<string, Room>();

  /**
   * Room management
   */
  createRoom(payload: CreateRoomPayload): { room: Room; user: User } {
    const roomId = uuidv4();
    const userId = uuidv4();
    
    // Create moderator user
    const user: User = {
      id: userId,
      name: payload.userName,
      role: UserRole.MODERATOR,
      roomId,
      vote: null,
      hasVoted: false,
    };
    
    // Create room
    const room: Room = {
      id: roomId,
      name: payload.roomName,
      participants: [user],
      stories: [],
      activeStoryId: null,
      votingState: VotingState.VOTING,
    };
    
    this.rooms.set(roomId, room);
    console.log(`Room created: ${roomId} by user ${userId}`);
    
    return { room, user };
  }

  joinRoom(payload: JoinRoomPayload): { room: Room; user: User } | null {
    const { roomId, userName } = payload;
    const room = this.rooms.get(roomId);
    
    if (!room) {
      console.warn(`Room not found: ${roomId}`);
      return null;
    }
    
    const userId = uuidv4();
    const user: User = {
      id: userId,
      name: userName,
      role: UserRole.PARTICIPANT,
      roomId,
      vote: null,
      hasVoted: false,
    };
    
    room.participants.push(user);
    console.log(`User ${userId} joined room ${roomId}`);
    
    return { room, user };
  }

  leaveRoom(userId: string, roomId: string): Room | null {
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
    if (room.participants.every(p => p.role !== UserRole.MODERATOR)) {
      const newModerator = room.participants[0];
      newModerator.role = UserRole.MODERATOR;
      console.log(`New moderator assigned in room ${roomId}: ${newModerator.id}`);
    }
    
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Story management
   */
  createStory(payload: CreateStoryPayload): Room | null {
    const { roomId, title, description } = payload;
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return null;
    }
    
    const storyId = uuidv4();
    const newStory: Story = {
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

  updateStory(payload: UpdateStoryPayload): Room | null {
    const { roomId, storyId, title, description } = payload;
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return null;
    }
    
    const story = room.stories.find(s => s.id === storyId);
    if (!story) {
      return null;
    }
    
    if (title !== undefined) {
      story.title = title;
    }
    
    if (description !== undefined) {
      story.description = description;
    }
    
    console.log(`Story updated: ${storyId} in room ${roomId}`);
    return room;
  }

  deleteStory(roomId: string, storyId: string): Room | null {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return null;
    }
    
    const storyIndex = room.stories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) {
      return null;
    }
    
    // If this is the active story, clear the active story
    if (room.activeStoryId === storyId) {
      room.activeStoryId = null;
    }
    
    // Remove story
    room.stories.splice(storyIndex, 1);
    console.log(`Story deleted: ${storyId} from room ${roomId}`);
    
    return room;
  }

  setActiveStory(payload: SetActiveStoryPayload): Room | null {
    const { roomId, storyId } = payload;
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return null;
    }
    
    // Reset all stories to inactive
    room.stories.forEach(s => (s.isActive = false));
    
    // Set the selected story as active
    const story = room.stories.find(s => s.id === storyId);
    if (!story) {
      return null;
    }
    
    room.activeStoryId = storyId;
    story.isActive = true;
    
    // Reset voting state
    room.votingState = VotingState.VOTING;
    
    // Reset votes for all participants
    room.participants.forEach(p => {
      p.vote = null;
      p.hasVoted = false;
    });
    
    console.log(`Active story set: ${storyId} in room ${roomId}`);
    return room;
  }

  /**
   * Voting management
   */
  submitVote(payload: SubmitVotePayload): Room | null {
    const { roomId, userId, value } = payload;
    const room = this.rooms.get(roomId);
    
    if (!room || room.votingState === VotingState.REVEALED) {
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

  revealVotes(roomId: string): Room | null {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return null;
    }
    
    room.votingState = VotingState.REVEALED;
    console.log(`Votes revealed in room ${roomId}`);
    
    // Calculate final estimation if all participants have voted
    if (room.activeStoryId) {
      const story = room.stories.find(s => s.id === room.activeStoryId);
      if (story) {
        const stats = this.calculateVotingStats(story.votes);
        if (stats) {
          story.finalEstimation = stats.average;
        }
      }
    }
    
    return room;
  }

  resetVotes(roomId: string): Room | null {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return null;
    }
    
    room.votingState = VotingState.VOTING;
    
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

  private calculateVotingStats(votes: Vote[]): VotingStats | null {
    const numericVotes = votes
      .map(v => v.value)
      .filter(v => v !== null) as number[];
    
    if (numericVotes.length === 0) {
      return null;
    }
    
    const sum = numericVotes.reduce((acc, val) => acc + val, 0);
    
    return {
      average: Math.round(sum / numericVotes.length * 10) / 10, // Round to 1 decimal
      min: Math.min(...numericVotes),
      max: Math.max(...numericVotes),
      count: numericVotes.length
    };
  }
}

export { PlanningPokerService };
module.exports = { PlanningPokerService };
