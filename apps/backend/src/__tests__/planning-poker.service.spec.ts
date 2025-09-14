import { Test, TestingModule } from '@nestjs/testing';
import { PlanningPokerService } from '../planning-poker/planning-poker.service';
import { UserRole, VotingState } from 'shared';

describe('PlanningPokerService', () => {
  let service: PlanningPokerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanningPokerService],
    }).compile();

    service = module.get<PlanningPokerService>(PlanningPokerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRoom', () => {
    it('should create a room with moderator user', () => {
      const payload = { userName: 'Test User', roomName: 'Test Room' };
      const result = service.createRoom(payload);

      expect(result.room).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.room.name).toBe('Test Room');
      expect(result.user.name).toBe('Test User');
      expect(result.user.role).toBe(UserRole.MODERATOR);
      expect(result.room.participants).toHaveLength(1);
      expect(result.room.votingState).toBe(VotingState.VOTING);
    });
  });

  describe('joinRoom', () => {
    it('should allow user to join existing room', () => {
      // First create a room
      const createPayload = { userName: 'Moderator', roomName: 'Test Room' };
      const { room } = service.createRoom(createPayload);

      // Then join the room
      const joinPayload = { userName: 'Participant', roomId: room.id };
      const result = service.joinRoom(joinPayload);

      expect(result).not.toBeNull();
      expect(result!.user.name).toBe('Participant');
      expect(result!.user.role).toBe(UserRole.PARTICIPANT);
      expect(result!.room.participants).toHaveLength(2);
    });

    it('should return null for non-existent room', () => {
      const joinPayload = { userName: 'User', roomId: 'non-existent' };
      const result = service.joinRoom(joinPayload);

      expect(result).toBeNull();
    });
  });

  describe('createStory', () => {
    it('should create a story in existing room', () => {
      // Create room first
      const createPayload = { userName: 'Moderator', roomName: 'Test Room' };
      const { room } = service.createRoom(createPayload);

      // Create story
      const storyPayload = {
        roomId: room.id,
        title: 'Test Story',
        description: 'Test Description'
      };
      const result = service.createStory(storyPayload);

      expect(result).not.toBeNull();
      expect(result!.stories).toHaveLength(1);
      expect(result!.stories[0].title).toBe('Test Story');
      expect(result!.activeStoryId).toBe(result!.stories[0].id);
    });
  });

  describe('submitVote', () => {
    it('should record vote for user', () => {
      // Create room and story
      const createPayload = { userName: 'Moderator', roomName: 'Test Room' };
      const { room, user } = service.createRoom(createPayload);
      
      const storyPayload = {
        roomId: room.id,
        title: 'Test Story',
        description: 'Test Description'
      };
      service.createStory(storyPayload);

      // Submit vote
      const votePayload = {
        roomId: room.id,
        userId: user.id,
        value: 5
      };
      const result = service.submitVote(votePayload);

      expect(result).not.toBeNull();
      expect(result!.participants[0].vote).toBe(5);
      expect(result!.participants[0].hasVoted).toBe(true);
    });
  });
});
