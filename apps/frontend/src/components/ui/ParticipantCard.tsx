import React from 'react';
import { User, UserRole, VotingState } from 'shared';

interface ParticipantCardProps {
  user: User;
  votingState: VotingState;
  showVote?: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  user,
  votingState,
  showVote = false,
}) => {
  const isModerator = user.role === UserRole.MODERATOR;
  const hasVoted = user.hasVoted;
  const isRevealed = votingState === VotingState.REVEALED;
  
  const getVoteDisplay = () => {
    if (!hasVoted) return '';
    if (!isRevealed && !showVote) return '✓';
    return user.vote === null ? '?' : user.vote.toString();
  };
  
  const getStatusColor = () => {
    if (!hasVoted) return 'bg-gray-200';
    if (!isRevealed && !showVote) return 'bg-blue-200';
    return 'bg-green-200';
  };
  
  return (
    <div className={`card p-4 flex flex-col items-center space-y-2 ${getStatusColor()}`}>
      <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
        {user.name[0].toUpperCase()}
      </div>
      
      <div className="text-center">
        <p className="font-semibold text-gray-800">{user.name}</p>
        {isModerator && (
          <p className="text-xs text-primary-600 font-medium">Moderator</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {hasVoted && (
          <div className="w-8 h-8 bg-white rounded border-2 border-gray-300 flex items-center justify-center text-sm font-bold">
            {getVoteDisplay()}
          </div>
        )}
        {!hasVoted && votingState === VotingState.VOTING && (
          <div className="text-xs text-gray-500">Thinking...</div>
        )}
      </div>
    </div>
  );
};
