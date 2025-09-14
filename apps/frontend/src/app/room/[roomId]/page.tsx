'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../../../components/layout/Layout';
import { ParticipantCard } from '../../../components/ui/ParticipantCard';
import { StoryCard } from '../../../components/ui/StoryCard';
import { VotingCardSet } from '../../../components/ui/VotingCard';
import { VotingResults } from '../../../components/ui/VotingResults';
import { CreateStoryModal } from '../../../components/features/CreateStoryModal';
import { useAppDispatch, useAppSelector, useWebSocket } from '../../../hooks';
import { websocketActionCreators } from '../../../store/middleware/websocketMiddleware';
import { setSelectedCard, setCurrentVote } from '../../../store/slices/voteSlice';
import { UserRole, VotingState } from 'shared';

interface RoomPageProps {
  params: { roomId: string };
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = params;
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isConnected } = useWebSocket();
  
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentRoom = useAppSelector((state) => state.room.currentRoom);
  const participants = useAppSelector((state) => state.room.participants);
  const stories = useAppSelector((state) => state.room.stories);
  const activeStoryId = useAppSelector((state) => state.room.activeStoryId);
  const votingState = useAppSelector((state) => state.room.currentRoom?.votingState || VotingState.VOTING);
  const selectedCard = useAppSelector((state) => state.vote.selectedCard);
  
  // Redirect to home if not in a room
  useEffect(() => {
    if (!currentUser || !currentRoom || currentRoom.id !== roomId) {
      router.push('/');
    }
  }, [currentUser, currentRoom, roomId, router]);
  
  if (!currentUser || !currentRoom) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Loading room...</p>
        </div>
      </Layout>
    );
  }
  
  const isModerator = currentUser.role === UserRole.MODERATOR;
  const activeStory = stories.find(s => s.id === activeStoryId);
  const isVotingRevealed = votingState === VotingState.REVEALED;
  const canVote = votingState === VotingState.VOTING && activeStory;
  
  const handleVoteSelect = (value: number | null) => {
    if (!canVote || !currentRoom || !currentUser) return;
    
    dispatch(setSelectedCard(value));
    dispatch(setCurrentVote(value));
    
    dispatch(websocketActionCreators.submitVote({
      roomId: currentRoom.id,
      userId: currentUser.id,
      value,
    }));
  };
  
  const handleCreateStory = (title: string, description: string) => {
    if (!currentRoom) return;
    
    dispatch(websocketActionCreators.createStory({
      roomId: currentRoom.id,
      title,
      description,
    }));
  };
  
  const handleEditStory = (storyId: string, title: string, description: string) => {
    if (!currentRoom) return;
    
    dispatch(websocketActionCreators.updateStory({
      roomId: currentRoom.id,
      storyId,
      title,
      description,
    }));
  };
  
  const handleDeleteStory = (storyId: string) => {
    if (!currentRoom) return;
    
    dispatch(websocketActionCreators.deleteStory({
      roomId: currentRoom.id,
      storyId,
    }));
  };
  
  const handleSetActiveStory = (storyId: string) => {
    if (!currentRoom) return;
    
    dispatch(websocketActionCreators.setActiveStory({
      roomId: currentRoom.id,
      storyId,
    }));
  };
  
  const handleRevealVotes = () => {
    if (!currentRoom) return;
    
    dispatch(websocketActionCreators.revealVotes({
      roomId: currentRoom.id,
    }));
  };
  
  const handleResetVotes = () => {
    if (!currentRoom) return;
    
    dispatch(websocketActionCreators.resetVotes({
      roomId: currentRoom.id,
    }));
  };
  
  const handleLeaveRoom = () => {
    dispatch(websocketActionCreators.leaveRoom());
    router.push('/');
  };
  
  // Calculate voting stats for revealed votes
  const votingStats = activeStory && isVotingRevealed ? (() => {
    const numericVotes = activeStory.votes
      .map(v => v.value)
      .filter(v => v !== null) as number[];
    
    if (numericVotes.length === 0) return null;
    
    const sum = numericVotes.reduce((acc, val) => acc + val, 0);
    return {
      average: Math.round(sum / numericVotes.length * 10) / 10,
      min: Math.min(...numericVotes),
      max: Math.max(...numericVotes),
      count: numericVotes.length,
    };
  })() : null;
  
  return (
    <Layout roomId={roomId}>
      <div className="space-y-6">
        {/* Room Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentRoom.name}</h1>
            <p className="text-gray-600">Room ID: {roomId}</p>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="btn-secondary"
          >
            Leave Room
          </button>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stories Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Stories</h2>
                {isModerator && (
                  <button
                    onClick={() => setIsCreateStoryModalOpen(true)}
                    className="text-sm btn-primary py-1 px-3"
                  >
                    + Add
                  </button>
                )}
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No stories yet.
                    {isModerator && ' Add your first story to get started!'}
                  </p>
                ) : (
                  stories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      isActive={story.id === activeStoryId}
                      userRole={currentUser.role}
                      onEdit={handleEditStory}
                      onDelete={handleDeleteStory}
                      onSetActive={handleSetActiveStory}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Main Voting Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Story */}
            {activeStory ? (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Current Story</h2>
                <h3 className="text-lg font-medium text-gray-700 mb-2">{activeStory.title}</h3>
                {activeStory.description && (
                  <p className="text-gray-600 mb-4">{activeStory.description}</p>
                )}
                
                {/* Moderator Controls */}
                {isModerator && (
                  <div className="flex space-x-3 mb-4">
                    {!isVotingRevealed && (
                      <button
                        onClick={handleRevealVotes}
                        className="btn-primary"
                      >
                        Reveal Votes
                      </button>
                    )}
                    <button
                      onClick={handleResetVotes}
                      className="btn-secondary"
                    >
                      Reset Votes
                    </button>
                  </div>
                )}
                
                {/* Voting Results */}
                {isVotingRevealed && activeStory.votes.length > 0 && (
                  <VotingResults
                    votes={activeStory.votes}
                    participants={participants}
                    stats={votingStats}
                  />
                )}
              </div>
            ) : (
              <div className="card p-6 text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">No Active Story</h2>
                <p className="text-gray-600">
                  {isModerator 
                    ? 'Add a story and set it as active to start voting.'
                    : 'Waiting for moderator to set an active story.'
                  }
                </p>
              </div>
            )}
            
            {/* Voting Cards */}
            {canVote && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  Select Your Estimate
                </h3>
                <VotingCardSet
                  selectedValue={selectedCard}
                  onSelect={handleVoteSelect}
                  disabled={!canVote}
                  isRevealed={isVotingRevealed}
                />
                {selectedCard !== null && (
                  <p className="text-center mt-4 text-sm text-gray-600">
                    You voted: <span className="font-semibold">{selectedCard === null ? '?' : selectedCard}</span>
                  </p>
                )}
              </div>
            )}
            
            {/* Participants */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Participants ({participants.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {participants.map((participant) => (
                  <ParticipantCard
                    key={participant.id}
                    user={participant}
                    votingState={votingState}
                    showVote={participant.id === currentUser.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={isCreateStoryModalOpen}
        onClose={() => setIsCreateStoryModalOpen(false)}
        onSubmit={handleCreateStory}
      />
    </Layout>
  );
}
