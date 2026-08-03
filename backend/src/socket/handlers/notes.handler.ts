import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socket.auth.middleware.js';
import { Note } from '../../models/Note.js';

export const registerNotesHandlers = (io: Server, socket: AuthenticatedSocket) => {
  socket.on('notes:update', async (data: { boardId: string; content: string }) => {
    const { boardId, content } = data;
    const roomName = `board:${boardId}`;

    try {
      await Note.findOneAndUpdate(
        { boardId },
        { content },
        { upsert: true, new: true }
      );

      // Broadcast updated notes to room
      socket.to(roomName).emit('notes:update', {
        content,
        userId: socket.user!.userId,
      });
    } catch (error) {
      console.error('[Socket Notes Error]', error);
    }
  });
};
