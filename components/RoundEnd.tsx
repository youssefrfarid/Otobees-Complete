'use client';

import React from 'react';
import { GameRoom, Player, CATEGORIES, CATEGORY_LABELS } from '@/lib/gameTypes';

interface RoundEndProps {
  room: GameRoom;
  player: Player;
  onNextRound: () => void;
}

export default function RoundEnd({ room, player, onNextRound }: RoundEndProps) {
  const isHost = player.id === room.host;
  const currentRoundScores = room.players.map(p => ({
    player: p,
    score: room.roundScores[p.id]?.[room.currentRound - 1] || 0
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Round {room.currentRound} Results
        </h2>

        {/* Round Scores */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Round Scores</h3>
          <div className="space-y-3">
            {currentRoundScores.map(({ player: p, score }, index) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' :
                  p.id === player.id ? 'bg-indigo-100 border-2 border-indigo-300' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                  </span>
                  <span className="font-medium text-gray-800">
                    {p.name}
                    {p.id === player.id && ' (You)'}
                  </span>
                </div>
                <span className="text-xl font-bold text-gray-800">
                  +{score} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Player Answers */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">All Answers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left font-semibold">Player</th>
                  {CATEGORIES.map(cat => (
                    <th key={cat} className="p-2 text-left font-semibold">
                      {CATEGORY_LABELS[cat]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {room.players.map(p => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2 font-medium">{p.name}</td>
                    {CATEGORIES.map(cat => (
                      <td key={cat} className="p-2">
                        {p.answers[cat] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Scores */}
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Total Scores</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {room.players
              .sort((a, b) => b.score - a.score)
              .map(p => (
                <div key={p.id} className="text-center">
                  <p className="text-sm text-gray-600">{p.name}</p>
                  <p className="text-2xl font-bold text-indigo-600">{p.score}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Next Round Button */}
        {room.currentRound < room.totalRounds ? (
          isHost ? (
            <button onClick={onNextRound} className="w-full btn-primary">
              Start Round {room.currentRound + 1}
            </button>
          ) : (
            <div className="text-center text-gray-600">
              <p className="text-sm">Waiting for host to start next round...</p>
            </div>
          )
        ) : (
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700 mb-2">Game will end soon!</p>
            <p className="text-sm text-gray-600">Redirecting to final scores...</p>
          </div>
        )}
      </div>
    </div>
  );
}
