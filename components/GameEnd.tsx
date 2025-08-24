'use client';

import React from 'react';
import { GameRoom } from '@/lib/gameTypes';

interface GameEndProps {
  room: GameRoom;
  onNewGame: () => void;
}

export default function GameEnd({ room, onNewGame }: GameEndProps) {
  const finalScores = room.players
    .sort((a, b) => b.score - a.score)
    .map((p, index) => ({ player: p, position: index + 1 }));

  const winner = finalScores[0].player;

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        {/* Winner Announcement */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Game Over!</h2>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-6 shadow-lg">
            <p className="text-6xl mb-4">🏆</p>
            <p className="text-2xl font-bold mb-2">{winner.name} Wins!</p>
            <p className="text-4xl font-bold">{winner.score} points</p>
          </div>
        </div>

        {/* Final Standings */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Final Standings</h3>
          <div className="space-y-3">
            {finalScores.map(({ player: p, position }) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  position === 1 ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400' :
                  position === 2 ? 'bg-gray-100 border-2 border-gray-300' :
                  position === 3 ? 'bg-orange-50 border-2 border-orange-300' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-600">
                    #{position}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{p.name}</p>
                    <p className="text-sm text-gray-600">
                      {room.roundScores[p.id]?.map(s => `${s}pts`).join(' + ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-800">{p.score}</p>
                  <p className="text-sm text-gray-600">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Stats */}
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Game Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Rounds Played:</span>
              <span className="font-semibold ml-2">{room.totalRounds}</span>
            </div>
            <div>
              <span className="text-gray-600">Letters Used:</span>
              <span className="font-semibold ml-2">{room.usedLetters.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* New Game Button */}
        <button onClick={onNewGame} className="w-full btn-primary">
          Play Again
        </button>
      </div>
    </div>
  );
}
