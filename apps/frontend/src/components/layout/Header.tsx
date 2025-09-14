import React from 'react';
import { useAppSelector } from '../../hooks';

interface HeaderProps {
  roomId?: string;
}

export const Header: React.FC<HeaderProps> = ({ roomId }) => {
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentRoom = useAppSelector((state) => state.room.currentRoom);
  const isConnected = useAppSelector((state) => state.user.isConnected);
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary-700">Planning Poker</h1>
            {currentRoom && (
              <div className="text-sm text-gray-600">
                Room: <span className="font-medium">{currentRoom.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {currentUser && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {currentUser.name[0].toUpperCase()}
                </div>
                <div className="text-sm">
                  <div className="font-medium">{currentUser.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{currentUser.role.toLowerCase()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
