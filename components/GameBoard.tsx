'use client';

import React, { useState, useEffect } from 'react';
import { Player, CategoryAnswers, CATEGORIES, CATEGORY_LABELS, GameRoom } from '@/lib/gameTypes';

interface GameBoardProps {
  room: GameRoom;
  player: Player;
  onSubmit: (answers: CategoryAnswers) => void;
  onStopBus: () => void;
}

export default function GameBoard({ room, player, onSubmit, onStopBus }: GameBoardProps) {
  const [answers, setAnswers] = useState<CategoryAnswers>({
    girl: '',
    boy: '',
    object: '',
    food: '',
    animal: '',
    country: ''
  });
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (room.gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!player.hasSubmitted) {
              onSubmit(answers);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setTimeLeft(60);
    }
  }, [room.gameState, room.currentRound]);

  const handleInputChange = (category: keyof CategoryAnswers, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const allFieldsFilled = CATEGORIES.every(cat => answers[cat].trim() !== '');
  const canStopBus = player.hasSubmitted && !room.players.every(p => p.hasSubmitted);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">Round {room.currentRound}/{room.totalRounds}</div>
            <div className="text-sm font-semibold text-indigo-600">
              Time: {timeLeft}s
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-lg mb-2">Current Letter:</p>
            <p className="text-6xl font-bold animate-pulse-slow">{room.currentLetter}</p>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4 mb-6">
          {CATEGORIES.map((category) => (
            <div key={category} className="category-card">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {CATEGORY_LABELS[category]}
              </label>
              <input
                type="text"
                value={answers[category]}
                onChange={(e) => handleInputChange(category, e.target.value)}
                disabled={player.hasSubmitted}
                placeholder={`Enter a ${CATEGORY_LABELS[category].toLowerCase()} starting with ${room.currentLetter}`}
                className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed"
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!player.hasSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!allFieldsFilled}
              className={`flex-1 ${
                allFieldsFilled 
                  ? 'btn-primary' 
                  : 'bg-gray-400 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed opacity-50'
              }`}
            >
              Submit Answers
            </button>
          ) : (
            <>
              <div className="flex-1 bg-green-100 text-green-800 font-semibold py-3 px-6 rounded-lg text-center">
                ✅ Answers Submitted!
              </div>
              {canStopBus && (
                <button
                  onClick={onStopBus}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  🛑 Stop the Bus!
                </button>
              )}
            </>
          )}
        </div>

        {/* Waiting Status */}
        {player.hasSubmitted && (
          <div className="mt-4 text-center text-gray-600">
            <p className="text-sm">
              Waiting for: {room.players.filter(p => !p.hasSubmitted).map(p => p.name).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
