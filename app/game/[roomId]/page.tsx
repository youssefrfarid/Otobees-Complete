'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameRoom, Player, CategoryAnswers } from '@/lib/gameTypes';
import Lobby from '@/components/Lobby';
import GameBoard from '@/components/GameBoard';
import RoundEnd from '@/components/RoundEnd';
import GameEnd from '@/components/GameEnd';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch room data
  const fetchRoom = useCallback(async () => {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getRoom',
          roomId
        })
      });

      const data = await response.json();
      if (data.success) {
        setRoom(data.room);
        
        // Find current player
        const playerId = localStorage.getItem('playerId');
        const currentPlayer = data.room.players.find((p: Player) => p.id === playerId);
        if (currentPlayer) {
          setPlayer(currentPlayer);
        } else if (!currentPlayer && data.room.gameState === 'waiting') {
          // Player not in room, try to join
          const playerName = localStorage.getItem('playerName');
          if (playerName) {
            await joinRoom(playerName);
          } else {
            setError('Please enter your name to join');
          }
        } else if (!currentPlayer && player) {
          // Keep existing player state if not found temporarily
          // This prevents kicks during state transitions
          console.log('Player temporarily not found, keeping existing state');
        }
      } else {
        setError('Room not found');
      }
    } catch (err) {
      console.error('Error fetching room:', err);
      setError('Failed to connect to game');
    } finally {
      setLoading(false);
    }
  }, [roomId, player]);

  // Join room
  const joinRoom = async (playerName: string) => {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'joinRoom',
          roomId,
          playerName
        })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('playerId', data.player.id);
        localStorage.setItem('playerName', playerName);
        setRoom(data.room);
        setPlayer(data.player);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room');
    }
  };

  // Start game
  const handleStartGame = async () => {
    if (!player || !room) return;

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'startGame',
          roomId
        })
      });

      const data = await response.json();
      if (data.success) {
        setRoom(data.room);
      }
    } catch (err) {
      console.error('Error starting game:', err);
    }
  };

  // Submit answers
  const handleSubmitAnswers = async (answers: CategoryAnswers) => {
    if (!player || !room) return;

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submitAnswers',
          roomId,
          playerId: player.id,
          answers
        })
      });

      const data = await response.json();
      if (data.success) {
        setRoom(data.room);
        const updatedPlayer = data.room.players.find((p: Player) => p.id === player.id);
        if (updatedPlayer) setPlayer(updatedPlayer);
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
    }
  };

  // Stop the bus
  const handleStopBus = async () => {
    if (!player || !room) return;

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stopBus',
          roomId,
          playerId: player.id
        })
      });

      const data = await response.json();
      if (data.success) {
        setRoom(data.room);
      }
    } catch (err) {
      console.error('Error stopping bus:', err);
    }
  };

  // Next round
  const handleNextRound = async () => {
    if (!room) return;

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'nextRound',
          roomId
        })
      });

      const data = await response.json();
      if (data.success) {
        setRoom(data.room);
        const updatedPlayer = data.room.players.find((p: Player) => p.id === player?.id);
        if (updatedPlayer) setPlayer(updatedPlayer);
      }
    } catch (err) {
      console.error('Error starting next round:', err);
    }
  };

  // New game
  const handleNewGame = () => {
    localStorage.removeItem('playerId');
    router.push('/');
  };

  // Polling for updates
  useEffect(() => {
    fetchRoom();
    
    const interval = setInterval(() => {
      // Only fetch if we're not in a loading state
      if (!loading) {
        fetchRoom();
      }
    }, 2000); // Poll every 2 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [fetchRoom, loading]);

  // Handle browser back button
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (player && room) {
        fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'leaveRoom',
            roomId,
            playerId: player.id
          })
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [player, room, roomId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!room || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Connecting to game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      {room.gameState === 'waiting' && (
        <Lobby room={room} player={player} onStartGame={handleStartGame} />
      )}
      
      {room.gameState === 'playing' && (
        <GameBoard 
          room={room} 
          player={player} 
          onSubmit={handleSubmitAnswers}
          onStopBus={handleStopBus}
        />
      )}
      
      {room.gameState === 'roundEnd' && (
        <RoundEnd room={room} player={player} onNextRound={handleNextRound} />
      )}
      
      {room.gameState === 'gameEnd' && (
        <GameEnd room={room} onNewGame={handleNewGame} />
      )}
    </div>
  );
}
