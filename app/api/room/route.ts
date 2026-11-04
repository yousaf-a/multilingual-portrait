import { NextRequest, NextResponse } from 'next/server';

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: string;
  text: string;
  reaction?: string;
  type: 'text' | 'reaction' | 'whisper';
  timestamp: number;
}

// Global in-memory room store (preserves chat between API requests on server instance)
interface RoomData {
  createdAt: number;
  lastActive: number;
  messages: ChatMessage[];
}

const rooms = new Map<string, RoomData>();

// Cleanup stale rooms older than 6 hours to prevent memory leaks
function cleanupStaleRooms() {
  const now = Date.now();
  const maxAge = 6 * 60 * 60 * 1000;
  for (const [id, room] of rooms.entries()) {
    if (now - room.lastActive > maxAge) {
      rooms.delete(id);
    }
  }
}

// GET /api/room?roomId=abc&since=123456789
export async function GET(req: NextRequest) {
  cleanupStaleRooms();
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const since = parseInt(searchParams.get('since') || '0', 10);

  if (!roomId) {
    return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
  }

  const room = rooms.get(roomId);
  if (!room) {
    return NextResponse.json({
      roomId,
      messages: [],
      serverTime: Date.now()
    });
  }

  // Return messages newer than 'since'
  const newMessages = room.messages.filter((m) => m.timestamp > since);

  return NextResponse.json({
    roomId,
    messages: newMessages,
    allCount: room.messages.length,
    serverTime: Date.now()
  });
}

// POST /api/room
export async function POST(req: NextRequest) {
  cleanupStaleRooms();
  try {
    const body = await req.json();
    const { roomId, sender, text, reaction, type } = body;

    if (!roomId || (!text && !reaction)) {
      return NextResponse.json({ error: 'Missing roomId or message body' }, { status: 400 });
    }

    let room = rooms.get(roomId);
    if (!room) {
      room = {
        createdAt: Date.now(),
        lastActive: Date.now(),
        messages: []
      };
      rooms.set(roomId, room);
    }

    room.lastActive = Date.now();

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      roomId,
      sender: sender || 'Guest',
      text: (text || '').trim(),
      reaction: reaction || undefined,
      type: type || (reaction ? 'reaction' : 'text'),
      timestamp: Date.now()
    };

    // Keep last 120 messages per room
    room.messages.push(newMessage);
    if (room.messages.length > 120) {
      room.messages.shift();
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
      serverTime: Date.now()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
