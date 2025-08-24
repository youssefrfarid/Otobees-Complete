'use client';

import React from 'react';
import { GameRoom, Player } from '@/lib/gameTypes';

interface LobbyProps {
  room: GameRoom;
  player: Player;
  onStartGame: () => void;
}

export default function Lobby({ room, player, onStartGame }: LobbyProps) {
  const isHost = player.id === room.host;
  const canStart = room.players.length >= 2 && isHost;

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Game Lobby</h2>
        
        {/* Room Code */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-4 mb-6">
          <p className="text-sm mb-1">Room Code:</p>
          <p className="text-3xl font-bold tracking-wider">{room.id}</p>
        </div>

        {/* Players List */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Players ({room.players.length})
          </h3>
          <div className="space-y-2">
            {room.players.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  p.id === player.id 
                    ? 'bg-indigo-100 border-2 border-indigo-300' 
                    : 'bg-gray-50'
                }`}
              >
                <span className="font-medium text-gray-800">
                  {p.name}
                  {p.id === player.id && ' (You)'}
                </span>
                {p.id === room.host && (
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={`w-full ${
              canStart 
                ? 'btn-primary' 
                : 'bg-gray-400 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed opacity-50'
            }`}
          >
            {canStart ? 'Start Game' : 'Need at least 2 players'}
          </button>
        ) : (
          <div className="text-center text-gray-600">
            <p className="text-sm">Waiting for host to start the game...</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">How to play:</span> Share the room code with friends. 
            Once everyone joins, the host can start the game. Each round, you'll get a letter 
            and need to fill in words for each category that start with that letter!
          </p>
        </div>
      </div>
    </div>
  );
}
