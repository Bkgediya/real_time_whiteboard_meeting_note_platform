import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socket.auth.middleware.js';
import { Board } from '../../models/Board.js';
import { Workspace } from '../../models/Workspace.js';
import { BoardOp } from '../../models/BoardOp.js';

export const registerCanvasHandlers = (io: Server, socket: AuthenticatedSocket) => {
  socket.on('canvas:op', async (data: { boardId: string; opType: 'add' | 'update' | 'delete' | 'clear'; element: any }) => {
    const { boardId, opType, element } = data;
    const roomName = `board:${boardId}`;

    try {
      // Authorization check on socket event
      const board = await Board.findById(boardId);
      if (!board) return;

      const workspace = await Workspace.findById(board.workspaceId);
      if (!workspace) return;

      const member = workspace.members.find((m) => m.userId.toString() === socket.user!.userId);
      if (!member || member.role === 'viewer') {
        socket.emit('error', { message: 'Unauthorized: Viewers cannot edit the canvas' });
        return;
      }

      // Log board op
      const opCount = await BoardOp.countDocuments({ boardId });
      await BoardOp.create({
        boardId,
        opType,
        payload: element,
        userId: socket.user!.userId,
        sequenceId: opCount + 1,
      });

      // Broadcast operation to room
      socket.to(roomName).emit('canvas:op', {
        opType,
        element,
        userId: socket.user!.userId,
      });
    } catch (error) {
      console.error('[Socket Canvas Error]', error);
    }
  });
};
