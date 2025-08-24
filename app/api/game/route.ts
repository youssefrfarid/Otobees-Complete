import { NextRequest, NextResponse } from 'next/server';
import { GameManager } from '@/lib/gameLogic';

const gameManager = GameManager.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomId, playerId, playerName, answers } = body;

    switch (action) {
      case 'createRoom': {
        const room = gameManager.createRoom(playerName);
        return NextResponse.json({ success: true, room });
      }

      case 'joinRoom': {
        const { room, player } = gameManager.joinRoom(roomId, playerName);
        if (!room) {
          return NextResponse.json({ success: false, error: 'Room not found or game already started' });
        }
        return NextResponse.json({ success: true, room, player });
      }

      case 'startGame': {
        const success = gameManager.startGame(roomId);
        const room = gameManager.getRoom(roomId);
        return NextResponse.json({ success, room });
      }

      case 'submitAnswers': {
        const success = gameManager.submitAnswers(roomId, playerId, answers);
        const room = gameManager.getRoom(roomId);
        return NextResponse.json({ success, room });
      }

      case 'stopBus': {
        const success = gameManager.stopBus(roomId, playerId);
        const room = gameManager.getRoom(roomId);
        return NextResponse.json({ success, room });
      }

      case 'nextRound': {
        const success = gameManager.nextRound(roomId);
        const room = gameManager.getRoom(roomId);
        return NextResponse.json({ success, room });
      }

      case 'getRoom': {
        const room = gameManager.getRoom(roomId);
        if (!room) {
          return NextResponse.json({ success: false, error: 'Room not found' });
        }
        return NextResponse.json({ success: true, room });
      }

      case 'leaveRoom': {
        gameManager.removePlayer(roomId, playerId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}
