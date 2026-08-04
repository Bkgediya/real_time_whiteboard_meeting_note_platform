import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socket.auth.middleware.js';
import { pubClient } from '../../config/redis.js';

export const registerPresenceHandlers = (io: Server, socket: AuthenticatedSocket) => {
  socket.on('cursor:move', async (data: { boardId: string; x: number; y: number; userName: string }) => {
    const { boardId, x, y, userName } = data;
    const roomName = `board:${boardId}`;

    const fallbackName = (socket.user as any)?.name || socket.user?.email?.split('@')[0] || 'User';
    const finalUserName = userName && userName !== 'User' ? userName : fallbackName;

    const cursorData = {
      userId: socket.user!.userId,
      userName: finalUserName,
      x,
      y,
      timestamp: Date.now(),
    };

    // Store in Redis key with 30s TTL
    const redisKey = `presence:${boardId}:${socket.user!.userId}`;
    try {
      await pubClient.set(redisKey, JSON.stringify(cursorData), 'EX', 30);
    } catch (e) {
      // Redis error fallback
    }

    // Broadcast cursor position to all other users in board room
    socket.to(roomName).emit('cursor:update', cursorData);
  });
};
