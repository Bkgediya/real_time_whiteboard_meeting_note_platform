import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from '../config/redis.js';
import { socketAuthMiddleware, AuthenticatedSocket } from './socket.auth.middleware.js';
import { registerPresenceHandlers } from './handlers/presence.handler.js';
import { registerCanvasHandlers } from './handlers/canvas.handler.js';
import { registerNotesHandlers } from './handlers/notes.handler.js';

export const initSocketGateway = (httpServer: HTTPServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Attach Redis adapter for horizontal scaling across multiple instances
  try {
    io.adapter(createAdapter(pubClient, subClient));
    console.log('[Socket.IO] Redis Adapter attached');
  } catch (err) {
    console.error('[Socket.IO] Failed to attach Redis adapter, falling back to in-memory:', err);
  }

  // Socket Auth Middleware
  io.use(socketAuthMiddleware as any);

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id} (User: ${socket.user?.email})`);

    // Room join logic
    socket.on('board:join', (boardId: string) => {
      const roomName = `board:${boardId}`;
      socket.join(roomName);
      console.log(`[Socket.IO] User ${socket.user?.email} joined room ${roomName}`);
    });

    // Room leave logic
    socket.on('board:leave', (boardId: string) => {
      const roomName = `board:${boardId}`;
      socket.leave(roomName);
      console.log(`[Socket.IO] User ${socket.user?.email} left room ${roomName}`);
    });

    // Register event handlers
    registerPresenceHandlers(io, socket);
    registerCanvasHandlers(io, socket);
    registerNotesHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
