import crypto from 'crypto';
import { Board } from '../models/Board.js';
import { BoardOp } from '../models/BoardOp.js';
import { Note } from '../models/Note.js';

export class BoardService {
  async createBoard(workspaceId: string, ownerId: string, title: string) {
    const board = await Board.create({
      title,
      workspaceId,
      ownerId,
      snapshot: { elements: [] },
    });

    // Create corresponding meeting notes document for board
    await Note.create({
      boardId: board._id,
      content: '',
    });

    return board;
  }

  async getWorkspaceBoards(workspaceId: string, search?: string, starredOnly?: boolean) {
    const query: any = { workspaceId };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (starredOnly) {
      query.isStarred = true;
    }

    const boards = await Board.find(query).sort({ lastOpenedAt: -1, createdAt: -1 });
    return boards;
  }

  async getBoardById(boardId: string) {
    const board = await Board.findById(boardId).populate('ownerId', 'name email avatar');
    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    // Update lastOpenedAt timestamp
    board.lastOpenedAt = new Date();
    await board.save();

    const note = await Note.findOne({ boardId });

    return {
      board,
      note: note ? note.content : '',
    };
  }

  async updateBoardSnapshot(boardId: string, snapshot: any, userId: string) {
    const board = await Board.findById(boardId);
    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    board.snapshot = snapshot;
    await board.save();

    // Log snapshot operation
    const opCount = await BoardOp.countDocuments({ boardId });
    await BoardOp.create({
      boardId,
      opType: 'update',
      payload: snapshot,
      userId,
      sequenceId: opCount + 1,
    });

    return board;
  }

  async toggleStar(boardId: string) {
    const board = await Board.findById(boardId);
    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    board.isStarred = !board.isStarred;
    await board.save();
    return board;
  }

  async deleteBoard(boardId: string) {
    await Board.findByIdAndDelete(boardId);
    await Note.deleteOne({ boardId });
    await BoardOp.deleteMany({ boardId });
    return { message: 'Board deleted successfully' };
  }

  async generateShareLink(boardId: string, expiresInDays: number = 7) {
    const board = await Board.findById(boardId);
    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    const shareToken = crypto.randomBytes(24).toString('hex');
    const shareExpiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    board.shareToken = shareToken;
    board.shareExpiresAt = shareExpiresAt;
    await board.save();

    return {
      shareToken,
      shareExpiresAt,
      shareUrl: `/public/boards/${shareToken}`,
    };
  }

  async getPublicBoard(shareToken: string) {
    const board = await Board.findOne({ shareToken }).populate('ownerId', 'name email avatar');
    if (!board || (board.shareExpiresAt && board.shareExpiresAt < new Date())) {
      throw { statusCode: 404, message: 'Share link is invalid or expired' };
    }

    const note = await Note.findOne({ boardId: board._id });

    return {
      board,
      note: note ? note.content : '',
      isReadOnly: true,
    };
  }
}
