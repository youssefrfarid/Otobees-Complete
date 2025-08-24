import { NextRequest, NextResponse } from 'next/server';
import { GameManager } from '@/lib/gameLogic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, roomId, playerName, playerId, answers } = body;
    
    console.log('API Request:', action, { roomId, playerName, playerId });
    const gameManager = GameManager.getInstance();

    switch (action) {
      case 'createRoom': {
        console.log('Creating room for:', playerName);
        const room = await gameManager.createRoom(playerName);
        const host = room.players[0];
        console.log('Room created:', room.id, 'Host:', host.name);
        return NextResponse.json({ success: true, room, player: host });
      }

      case 'joinRoom': {
        const { room, player } = await gameManager.joinRoom(roomId, playerName);
        if (!room) {
          return NextResponse.json({ success: false, error: 'Room not found or game already started' });
        }
        return NextResponse.json({ success: true, room, player });
      }

      case 'startGame': {
        const success = await gameManager.startGame(roomId);
        const room = await gameManager.getRoom(roomId);
        return NextResponse.json({ success, room });
      }

      case 'submitAnswers': {
        const success = await gameManager.submitAnswers(roomId, playerId, answers);
        const room = await gameManager.getRoom(roomId);
        return NextResponse.json({ success, room });
      }

      case 'stopBus': {
        const success = await gameManager.stopBus(roomId, playerId);
        const room = await gameManager.getRoom(roomId);
        return NextResponse.json({ success, room });
      }

      case 'nextRound': {
        const success = await gameManager.nextRound(roomId);
        const room = await gameManager.getRoom(roomId);
        return NextResponse.json({ success, room });
      }

      case 'getRoom': {
        console.log('Getting room:', roomId);
        const room = await gameManager.getRoom(roomId);
        if (!room) {
          console.log('Room not found:', roomId);
          return NextResponse.json({ success: false, error: 'Room not found' });
        }
        console.log('Room found:', room.id, 'State:', room.gameState);
        return NextResponse.json({ success: true, room });
      }

      case 'leaveRoom': {
        await gameManager.removePlayer(roomId, playerId);
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
