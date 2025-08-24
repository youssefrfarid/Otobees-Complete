import { Redis } from '@upstash/redis';
import { GameRoom } from './gameTypes';

// Create Redis client - falls back to in-memory for local development
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// In-memory fallback for local development
const memoryStorage = new Map<string, GameRoom>();

export class Storage {
  static async setRoom(roomId: string, room: GameRoom): Promise<void> {
    if (redis) {
      await redis.set(`room:${roomId}`, JSON.stringify(room), { ex: 3600 }); // 1 hour expiry
    } else {
      memoryStorage.set(roomId, room);
    }
  }

  static async getRoom(roomId: string): Promise<GameRoom | null> {
    if (redis) {
      const data = await redis.get(`room:${roomId}`);
      return data ? JSON.parse(data as string) : null;
    } else {
      return memoryStorage.get(roomId) || null;
    }
  }

  static async deleteRoom(roomId: string): Promise<void> {
    if (redis) {
      await redis.del(`room:${roomId}`);
    } else {
      memoryStorage.delete(roomId);
    }
  }

  static async getAllRoomIds(): Promise<string[]> {
    if (redis) {
      const keys = await redis.keys('room:*');
      return keys.map(key => key.replace('room:', ''));
    } else {
      return Array.from(memoryStorage.keys());
    }
  }
}
