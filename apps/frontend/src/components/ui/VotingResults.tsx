import React from 'react';
import { Vote, User, VotingStats } from 'shared';

interface VotingResultsProps {
  votes: Vote[];
  participants: User[];
  stats: VotingStats | null;
}

export const VotingResults: React.FC<VotingResultsProps> = ({
  votes,
  participants,
  stats,
}) => {
  const getUserName = (userId: string) => {
    const user = participants.find(p => p.id === userId);
    return user?.name || 'Unknown';
  };
  
  const getVoteDisplay = (value: number | null) => {
    return value === null ? '?' : value.toString();
  };
  
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Voting Results</h3>
      
      {stats && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.average}</div>
            <div className="text-sm text-gray-600">Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.min}</div>
            <div className="text-sm text-gray-600">Minimum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.max}</div>
            <div className="text-sm text-gray-600">Maximum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.count}</div>
            <div className="text-sm text-gray-600">Votes</div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Individual Votes:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {votes.map((vote) => (
            <div
              key={vote.userId}
              className="flex justify-between items-center p-2 bg-gray-50 rounded"
            >
              <span className="text-sm font-medium">{getUserName(vote.userId)}</span>
              <span className="font-bold text-lg">{getVoteDisplay(vote.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
