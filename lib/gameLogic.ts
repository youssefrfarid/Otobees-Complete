import { GameRoom, Player, CategoryAnswers, LETTERS, CATEGORIES } from './gameTypes';
import { v4 as uuidv4 } from 'uuid';

export class GameManager {
  private static instance: GameManager;
  private rooms: Map<string, GameRoom> = new Map();

  private constructor() {}

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  createRoom(hostName: string): GameRoom {
    const roomId = this.generateRoomCode();
    const host: Player = {
      id: uuidv4(),
      name: hostName,
      answers: this.getEmptyAnswers(),
      hasSubmitted: false,
      score: 0
    };

    const room: GameRoom = {
      id: roomId,
      players: [host],
      currentLetter: '',
      gameState: 'waiting',
      currentRound: 0,
      totalRounds: 5,
      usedLetters: [],
      roundScores: {},
      host: host.id
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId: string, playerName: string): { room: GameRoom | null; player: Player | null } {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'waiting') {
      return { room: null, player: null };
    }

    const player: Player = {
      id: uuidv4(),
      name: playerName,
      answers: this.getEmptyAnswers(),
      hasSubmitted: false,
      score: 0
    };

    room.players.push(player);
    return { room, player };
  }

  startGame(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) return false;

    room.gameState = 'playing';
    room.currentRound = 1;
    room.currentLetter = this.getRandomLetter(room.usedLetters);
    room.usedLetters.push(room.currentLetter);
    
    // Reset all players for new round
    room.players.forEach(player => {
      player.answers = this.getEmptyAnswers();
      player.hasSubmitted = false;
    });

    return true;
  }

  submitAnswers(roomId: string, playerId: string, answers: CategoryAnswers): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    player.answers = answers;
    player.hasSubmitted = true;

    // Check if all players have submitted
    if (room.players.every(p => p.hasSubmitted)) {
      this.endRound(roomId);
    }

    return true;
  }

  stopBus(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.hasSubmitted) return false;

    // Force end the round
    this.endRound(roomId);
    return true;
  }

  private endRound(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Calculate scores for this round
    const roundScores = this.calculateRoundScores(room);
    
    // Update player scores
    room.players.forEach(player => {
      const score = roundScores[player.id] || 0;
      player.score += score;
      
      if (!room.roundScores[player.id]) {
        room.roundScores[player.id] = [];
      }
      room.roundScores[player.id].push(score);
    });

    room.gameState = 'roundEnd';

    // Don't use setTimeout on server-side, let client handle transitions
    // This prevents state sync issues
  }

  nextRound(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'roundEnd') return false;

    if (room.currentRound >= room.totalRounds) {
      room.gameState = 'gameEnd';
      return false;
    }

    room.currentRound++;
    room.currentLetter = this.getRandomLetter(room.usedLetters);
    room.usedLetters.push(room.currentLetter);
    room.gameState = 'playing';

    // Reset players for new round
    room.players.forEach(player => {
      player.answers = this.getEmptyAnswers();
      player.hasSubmitted = false;
    });

    return true;
  }

  private calculateRoundScores(room: GameRoom): Record<string, number> {
    const scores: Record<string, number> = {};
    const letter = room.currentLetter.toLowerCase();

    room.players.forEach(player => {
      let score = 0;
      
      CATEGORIES.forEach(category => {
        const answer = player.answers[category].trim().toLowerCase();
        
        if (answer && answer.startsWith(letter)) {
          // Check for duplicates
          const duplicates = room.players.filter(p => 
            p.id !== player.id && 
            p.answers[category].trim().toLowerCase() === answer
          );

          if (duplicates.length === 0) {
            score += 10; // Unique answer
          } else {
            score += 5; // Duplicate answer
          }
        }
      });

      scores[player.id] = score;
    });

    return scores;
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  removePlayer(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== playerId);
    
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    } else if (room.host === playerId && room.players.length > 0) {
      room.host = room.players[0].id;
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private getRandomLetter(usedLetters: string[]): string {
    const availableLetters = LETTERS.filter(l => !usedLetters.includes(l));
    if (availableLetters.length === 0) {
      return LETTERS[Math.floor(Math.random() * LETTERS.length)];
    }
    return availableLetters[Math.floor(Math.random() * availableLetters.length)];
  }

  private getEmptyAnswers(): CategoryAnswers {
    return {
      girl: '',
      boy: '',
      object: '',
      food: '',
      animal: '',
      country: ''
    };
  }
}
