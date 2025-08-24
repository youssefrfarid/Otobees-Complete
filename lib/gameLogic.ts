import { GameRoom, Player, CategoryAnswers, LETTERS, CATEGORIES } from './gameTypes';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from './storage';

// Use global to persist across hot reloads in Next.js dev mode
declare global {
  var gameManager: GameManager | undefined;
}

export class GameManager {
  private constructor() {}

  static getInstance(): GameManager {
    if (!global.gameManager) {
      console.log('Creating new GameManager instance');
      global.gameManager = new GameManager();
    } else {
      console.log('Using existing GameManager instance');
    }
    return global.gameManager;
  }

  async createRoom(hostName: string): Promise<GameRoom> {
    const roomId = this.generateRoomCode();
    console.log('Creating room:', roomId);
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

    await Storage.setRoom(roomId, room);
    console.log('Room created successfully:', roomId);
    return room;
  }

  async joinRoom(roomId: string, playerName: string): Promise<{ room: GameRoom | null; player: Player | null }> {
    const room = await Storage.getRoom(roomId);
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
    await Storage.setRoom(roomId, room);
    return { room, player };
  }

  async startGame(roomId: string): Promise<boolean> {
    const room = await Storage.getRoom(roomId);
    if (!room || room.players.length < 2) return false;

    room.gameState = 'playing';
    room.currentRound = 1;
    room.currentLetter = this.getRandomLetter(room.usedLetters);
    room.usedLetters.push(room.currentLetter);

    // Reset all players
    room.players.forEach((player: Player) => {
      player.answers = this.getEmptyAnswers();
      player.hasSubmitted = false;
    });

    await Storage.setRoom(roomId, room);
    return true;
  }

  async submitAnswers(roomId: string, playerId: string, answers: CategoryAnswers): Promise<boolean> {
    const room = await Storage.getRoom(roomId);
    if (!room) return false;

    const player = room.players.find((p: Player) => p.id === playerId);
    if (!player) return false;

    player.answers = answers;
    player.hasSubmitted = true;

    await Storage.setRoom(roomId, room);

    // Check if all players submitted
    if (room.players.every((p: Player) => p.hasSubmitted)) {
      await this.endRound(roomId);
    }

    return true;
  }

  async stopBus(roomId: string, playerId: string): Promise<boolean> {
    const room = await Storage.getRoom(roomId);
    if (!room || room.gameState !== 'playing') return false;

    const player = room.players.find((p: Player) => p.id === playerId);
    if (!player || !player.hasSubmitted) return false;

    await this.endRound(roomId);
    return true;
  }

  private async endRound(roomId: string): Promise<void> {
    const room = await Storage.getRoom(roomId);
    if (!room) return;

    // Calculate scores for this round
    const roundScores = this.calculateRoundScores(room);
    
    // Update player scores
    room.players.forEach((player: Player) => {
      const score = roundScores[player.id] || 0;
      player.score += score;
      
      if (!room.roundScores[player.id]) {
        room.roundScores[player.id] = [];
      }
      room.roundScores[player.id].push(score);
    });

    room.gameState = 'roundEnd';
    await Storage.setRoom(roomId, room);

    // Don't use setTimeout on server-side, let client handle transitions
    // This prevents state sync issues
  }

  async nextRound(roomId: string): Promise<boolean> {
    const room = await Storage.getRoom(roomId);
    if (!room || room.gameState !== 'roundEnd') return false;

    if (room.currentRound >= room.totalRounds) {
      room.gameState = 'gameEnd';
      await Storage.setRoom(roomId, room);
      return false;
    }

    room.currentRound++;
    room.currentLetter = this.getRandomLetter(room.usedLetters);
    room.usedLetters.push(room.currentLetter);
    room.gameState = 'playing';

    // Reset players for new round
    room.players.forEach((player: Player) => {
      player.answers = this.getEmptyAnswers();
      player.hasSubmitted = false;
    });

    await Storage.setRoom(roomId, room);
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

  async getRoom(roomId: string): Promise<GameRoom | null> {
    const room = await Storage.getRoom(roomId);
    console.log('Getting room:', roomId, 'Found:', !!room);
    return room;
  }

  async removePlayer(roomId: string, playerId: string): Promise<void> {
    const room = await Storage.getRoom(roomId);
    if (!room) return;

    room.players = room.players.filter((p: Player) => p.id !== playerId);
    
    if (room.players.length === 0) {
      await Storage.deleteRoom(roomId);
    } else {
      await Storage.setRoom(roomId, room);
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
