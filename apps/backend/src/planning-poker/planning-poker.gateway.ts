import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PlanningPokerService } from './planning-poker.service';
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
  ErrorPayload,
  Room,
} from 'shared';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
  },
})
export class PlanningPokerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PlanningPokerGateway.name);
  private readonly clientRooms: Map<string, string> = new Map<string, string>();
  private readonly clientIds: Map<string, string> = new Map<string, string>();

  constructor(private readonly planningPokerService: PlanningPokerService) {
    this.logger.log('PlanningPokerGateway initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Get room and user IDs from maps
    const roomId = this.clientRooms.get(client.id);
    const userId = this.clientIds.get(client.id);
    
    if (roomId && userId) {
      // Handle user leaving the room
      const room = this.planningPokerService.leaveRoom(userId, roomId);
      
      // Clean up maps
      this.clientRooms.delete(client.id);
      this.clientIds.delete(client.id);
      
      // If room still exists, notify other participants
      if (room) {
        client.leave(roomId);
        this.server.to(roomId).emit(SocketEvents.ROOM_UPDATED, room);
        this.server.to(roomId).emit(SocketEvents.USER_LEFT, { userId, roomId });
      }
    }
  }

  @SubscribeMessage(SocketEvents.CREATE_ROOM)
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateRoomPayload,
  ): void {
    try {
      const result = this.planningPokerService.createRoom(payload);
      const { room, user } = result;
      
      // Store client-room and client-user mappings
      this.clientRooms.set(client.id, room.id);
      this.clientIds.set(client.id, user.id);
      
      // Join socket room
      client.join(room.id);
      
      // Send response to client
      client.emit(SocketEvents.CREATE_ROOM, result);
    } catch (error) {
      this.logger.error(`Error creating room: ${error.message}`);
      const errorPayload: ErrorPayload = {
        code: 'CREATE_ROOM_ERROR',
        message: 'Failed to create room',
      };
      client.emit(SocketEvents.ERROR, errorPayload);
    }
  }

  @SubscribeMessage(SocketEvents.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ): void {
    try {
      const result = this.planningPokerService.joinRoom(payload);
      
      if (!result) {
        const errorPayload: ErrorPayload = {
          code: 'ROOM_NOT_FOUND',
          message: `Room with ID ${payload.roomId} not found`,
        };
        client.emit(SocketEvents.ERROR, errorPayload);
        return;
      }
      
      const { room, user } = result;
      
      // Store client-room and client-user mappings
      this.clientRooms.set(client.id, room.id);
      this.clientIds.set(client.id, user.id);
      
      // Join socket room
      client.join(room.id);
      
      // Send response to client
      client.emit(SocketEvents.JOIN_ROOM, result);
      
      // Notify other participants
      client.to(room.id).emit(SocketEvents.USER_JOINED, { user, roomId: room.id });
      client.to(room.id).emit(SocketEvents.ROOM_UPDATED, room);
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`);
      const errorPayload: ErrorPayload = {
        code: 'JOIN_ROOM_ERROR',
        message: 'Failed to join room',
      };
      client.emit(SocketEvents.ERROR, errorPayload);
    }
  }

  @SubscribeMessage(SocketEvents.LEAVE_ROOM)
  handleLeaveRoom(@ConnectedSocket() client: Socket): void {
    const roomId = this.clientRooms.get(client.id);
    const userId = this.clientIds.get(client.id);
    
    if (roomId && userId) {
      // Handle user leaving the room
      const room = this.planningPokerService.leaveRoom(userId, roomId);
      
      // Clean up maps
      this.clientRooms.delete(client.id);
      this.clientIds.delete(client.id);
      
      // Leave socket room
      client.leave(roomId);
      
      // If room still exists, notify other participants
      if (room) {
        this.server.to(roomId).emit(SocketEvents.ROOM_UPDATED, room);
        this.server.to(roomId).emit(SocketEvents.USER_LEFT, { userId, roomId });
      }
    }
  }

  @SubscribeMessage(SocketEvents.CREATE_STORY)
  handleCreateStory(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateStoryPayload,
  ): void {
    try {
      const room = this.planningPokerService.createStory(payload);
      
      if (!room) {
        const errorPayload: ErrorPayload = {
          code: 'ROOM_NOT_FOUND',
          message: `Room with ID ${payload.roomId} not found`,
        };
        client.emit(SocketEvents.ERROR, errorPayload);
        return;
      }
      
      // Notify all participants in the room
      this.server.to(payload.roomId).emit(SocketEvents.ROOM_UPDATED, room);
    } catch (error) {
      this.logger.error(`Error creating story: ${error.message}`);
      const errorPayload: ErrorPayload = {
        code: 'CREATE_STORY_ERROR',
        message: 'Failed to create story',
      };
      client.emit(SocketEvents.ERROR, errorPayload);
    }
  }

  @SubscribeMessage(SocketEvents.UPDATE_STORY)
  handleUpdateStory(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UpdateStoryPayload,
  ): void {
    try {
      const room = this.planningPokerService.updateStory(payload);
      
      if (!room) {
        const errorPayload: ErrorPayload = {
          code: 'STORY_NOT_FOUND',
          message: `Story not found in room ${payload.roomId}`,
        };
        client.emit(SocketEvents.ERROR, errorPayload);
        return;
      }
      
      // Notify all participants in the room
      this.server.to(payload.roomId).emit(SocketEvents.ROOM_UPDATED, room);
    } catch (error) {
      this.logger.error(`Error updating story: ${error.message}`);
      const errorPayload: ErrorPayload = {
        code: 'UPDATE_STORY_ERROR',
        message: 'Failed to update story',
      };
      client.emit(SocketEvents.ERROR, errorPayload);
    }
  }

  @SubscribeMessage(SocketEvents.DELETE_STORY)
  handleDeleteStory(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DeleteStoryPayload,
  ): void {
    try {
      const room = this.planningPokerService.deleteStory(payload.roomId, payload.storyId);
      
      if (!room) {
        const errorPayload: ErrorPayload = {
          code: 'STORY_NOT_FOUND',
          message: `Story not found in room ${payload.roomId}`,
        };
        client.emit(SocketEvents.ERROR, errorPayload);
        return;
      }
      
      // Notify all participants in the room
      this.server.to(payload.roomId).emit(SocketEvents.ROOM_UPDATED, room);
    } catch (error) {
      this.logger.error(`Error deleting story: ${error.message}`);
      const errorPayload: ErrorPayload = {
        code: 'DELETE_STORY_ERROR',
        message: 'Failed to delete story',
      };
      client.emit(SocketEvents.ERROR, errorPayload);
    }
  }

  @SubscribeMessage(SocketEvents.SET_ACTIVE_STORY)
  handleSetActiveStory(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SetActiveStoryPayload,
  ): void {
    try {
      const room = this.planningPokerService.setActiveStory(payload);
      
      if (!room) {
        const errorPayload: ErrorPayload = {
          code: 'STORY_NOT_FOUND',
          message: `Story not found in room ${payload.roomId}`,
        };
        client.emit(SocketEvents.ERROR, errorPayload);
        return;
      }
      
      // Notify all participants in the room
      this.server.to(payload.roomId).emit(SocketEvents.ROOM_UPDATED, room);
    } catch (error) {
      this.logger.error(`Error setting active story: ${error.message}`);
      const errorPayload: ErrorPayload = {
        code: 'SET_ACTIVE_STORY_ERROR',
        message: 'Failed to set active story',
      };
      client.emit(SocketEvents.ERROR, errorPayload);
    }
  }

  @SubscribeMessage(SocketEvents.SUBMIT_VOTE)
  handleSubmitVote(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubmitVotePayload,
  ): void {
    try {
      const room = this.planningPokerService.submitVote(payload);
      
      if (!room) {
        const errorPayload: ErrorPayload = {
          code: 'SUBMIT_VOTE_ERROR',
          message: 'Failed to submit vote',
        };
        client.emit(SocketEvents.ERROR, errorPayload);
        return;
      }
      
      // Notify all participants in the room
      this.server.to(payload.roomId).emit(SocketEvents.ROOM_UPDATED, room);
    } catch (error) {
      this.logger.error(`Error submitting vote: ${error.message}`);
      const errorPayload: ErrorPayload = {
        code: 'SUBMIT_VOTE_ERROR',
        message: 'Failed to submit vote',
      };
      client.emit(SocketEvents.ERROR, errorPayload);
    }
  }

  @SubscribeMessage(SocketEvents.REVEAL_VOTES)
  handleRevealVotes(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RevealVotesPayload,
  ): void {
    try {
      const room = this.planningPokerService.revealVotes(payload.roomId);
      
      if (!room) {
        const errorPayload: ErrorPayload = {
          code: 'ROOM_NOT_FOUND',
          message: `Room with ID ${payload.roomId} not found`,
        };
        client.emit(SocketEvents.ERROR, errorPayload);
        return;
      }
      
      // Notify all participants in the room
      this.server.to(payload.roomId).emit(SocketEvents.ROOM_UPDATED, room);
    } catch (error) {
      this.logger.error(`Error revealing votes: ${error.message}`);
      const errorPayload: ErrorPayload = {
        code: 'REVEAL_VOTES_ERROR',
        message: 'Failed to reveal votes',
      };
      client.emit(SocketEvents.ERROR, errorPayload);
    }
  }

  @SubscribeMessage(SocketEvents.RESET_VOTES)
  handleResetVotes(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ResetVotesPayload,
  ): void {
    try {
      const room = this.planningPokerService.resetVotes(payload.roomId);
      
      if (!room) {
        const errorPayload: ErrorPayload = {
          code: 'ROOM_NOT_FOUND',
          message: `Room with ID ${payload.roomId} not found`,
        };
        client.emit(SocketEvents.ERROR, errorPayload);
        return;
      }
      
      // Notify all participants in the room
      this.server.to(payload.roomId).emit(SocketEvents.ROOM_UPDATED, room);
    } catch (error) {
      this.logger.error(`Error resetting votes: ${error.message}`);
      const errorPayload: ErrorPayload = {
        code: 'RESET_VOTES_ERROR',
        message: 'Failed to reset votes',
      };
      client.emit(SocketEvents.ERROR, errorPayload);
    }
  }
}
