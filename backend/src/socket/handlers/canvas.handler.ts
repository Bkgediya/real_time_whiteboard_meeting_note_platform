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
      const board = await Board.findById(boardId);
      if (!board) return;

      const workspace = await Workspace.findById(board.workspaceId);
      if (!workspace) return;

      const userId = socket.user!.userId;
      const isBoardOwner = board.ownerId.toString() === userId;
      const isWsOwner = workspace.ownerId.toString() === userId;

      const boardMember = board.members.find((m) => m.userId.toString() === userId);
      const wsMember = workspace.members.find((m) => m.userId.toString() === userId);

      const isAuthorizedEditor =
        isBoardOwner ||
        isWsOwner ||
        (boardMember && boardMember.role === 'editor') ||
        (wsMember && (wsMember.role === 'editor' || wsMember.role === 'owner'));

      if (!isAuthorizedEditor) {
        socket.emit('error', { message: 'Unauthorized: Viewers cannot edit the canvas' });
        return;
      }

      // Log board op
      const opCount = await BoardOp.countDocuments({ boardId });
      await BoardOp.create({
        boardId,
        opType,
        payload: element,
        userId,
        sequenceId: opCount + 1,
      });

      // Broadcast operation to all other users in board room
      socket.to(roomName).emit('canvas:op', {
        opType,
        element,
        userId,
      });
    } catch (error) {
      console.error('[Socket Canvas Error]', error);
    }
  });
};
