'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../components/layout/Layout';
import { useAppDispatch, useAppSelector, useWebSocket } from '../hooks';
import { websocketActionCreators } from '../store/middleware/websocketMiddleware';
import { clearUserError } from '../store/slices/userSlice';
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isConnected } = useWebSocket();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const currentRoom = useAppSelector((state) => state.room.currentRoom);
  const error = useAppSelector((state) => state.user.error);
  
  // Redirect to room if user is already in a room
  useEffect(() => {
    if (currentUser && currentRoom) {
      router.push(`/room/${currentRoom.id}`);
    }
  }, [currentUser, currentRoom, router]);
  
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !roomName.trim() || !isConnected) return;
    
    setLoading(true);
    dispatch(clearUserError());
    
    dispatch(websocketActionCreators.createRoom({
      userName: userName.trim(),
      roomName: roomName.trim(),
    }));
    
    // Loading will be cleared when we receive the response
    setTimeout(() => setLoading(false), 5000); // Fallback timeout
  };
  
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !roomId.trim() || !isConnected) return;
    
    setLoading(true);
    dispatch(clearUserError());
    
    dispatch(websocketActionCreators.joinRoom({
      userName: userName.trim(),
      roomId: roomId.trim(),
    }));
    
    // Loading will be cleared when we receive the response
    setTimeout(() => setLoading(false), 5000); // Fallback timeout
  };
  
  const generateRandomRoomId = () => {
    setRoomId(uuidv4().substring(0, 8));
  };
  
  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Planning Poker</h1>
            <p className="text-lg text-gray-600">Agile estimation made simple</p>
            
            {!isConnected && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">Connecting to server...</p>
              </div>
            )}
          </div>
          
          <div className="card p-6">
            {/* Mode Selection */}
            <div className="flex mb-6">
              <button
                onClick={() => setMode('create')}
                className={`flex-1 py-2 px-4 text-center rounded-l-lg font-medium ${
                  mode === 'create'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Create Room
              </button>
              <button
                onClick={() => setMode('join')}
                className={`flex-1 py-2 px-4 text-center rounded-r-lg font-medium ${
                  mode === 'join'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Join Room
              </button>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {/* Create Room Form */}
            {mode === 'create' && (
              <form onSubmit={handleCreateRoom}>
                <div className="mb-4">
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    id="roomName"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter room name"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!isConnected || loading}
                  className="w-full btn-primary"
                >
                  {loading ? 'Creating Room...' : 'Create Room & Start'}
                </button>
              </form>
            )}
            
            {/* Join Room Form */}
            {mode === 'join' && (
              <form onSubmit={handleJoinRoom}>
                <div className="mb-4">
                  <label htmlFor="userNameJoin" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="userNameJoin"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                    Room ID *
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="roomId"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter room ID"
                      required
                    />
                    <button
                      type="button"
                      onClick={generateRandomRoomId}
                      className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300 text-sm"
                    >
                      Random
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={!isConnected || loading}
                  className="w-full btn-primary"
                >
                  {loading ? 'Joining Room...' : 'Join Room'}
                </button>
              </form>
            )}
          </div>
          
          <div className="text-center mt-6 text-sm text-gray-600">
            <p>
              Planning Poker helps your team estimate story points using the Fibonacci sequence.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
