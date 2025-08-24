'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(true);
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return;

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createRoom',
          playerName: playerName.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('playerId', data.room.players[0].id);
        localStorage.setItem('playerName', playerName.trim());
        router.push(`/game/${data.room.id}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'joinRoom',
          roomId: roomCode.trim().toUpperCase(),
          playerName: playerName.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('playerId', data.player.id);
        localStorage.setItem('playerName', playerName.trim());
        router.push(`/game/${roomCode.trim().toUpperCase()}`);
      } else {
        alert(data.error || 'Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
              🚌 Stop the Bus!
            </h1>
            <p className="text-gray-600">The classic word game, now online!</p>
          </div>

          {/* Tab Buttons */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsCreating(true)}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                isCreating 
                  ? 'bg-white shadow-sm font-semibold text-indigo-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Create Game
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                !isCreating 
                  ? 'bg-white shadow-sm font-semibold text-indigo-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Join Game
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="input-field"
                maxLength={20}
              />
            </div>

            {!isCreating && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  className="input-field uppercase"
                  maxLength={6}
                />
              </div>
            )}

            <button
              onClick={isCreating ? handleCreateRoom : handleJoinRoom}
              disabled={!playerName.trim() || (!isCreating && !roomCode.trim())}
              className={`w-full ${
                playerName.trim() && (isCreating || roomCode.trim())
                  ? 'btn-primary' 
                  : 'bg-gray-400 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed opacity-50'
              }`}
            >
              {isCreating ? 'Create Room' : 'Join Room'}
            </button>
          </div>

          {/* Game Instructions */}
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">How to Play:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Each round starts with a random letter</li>
              <li>• Fill in all 6 categories with words starting with that letter</li>
              <li>• Submit your answers or "Stop the Bus" to end the round early</li>
              <li>• Unique answers score 10 points, duplicates score 5 points</li>
              <li>• Most points after 5 rounds wins!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
