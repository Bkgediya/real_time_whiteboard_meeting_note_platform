import { BoardOp } from '../models/BoardOp.js';
import { Board } from '../models/Board.js';

export class VersionService {
  async getBoardVersionHistory(boardId: string) {
    const operations = await BoardOp.find({ boardId })
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    return operations;
  }

  async restoreSnapshot(boardId: string, versionId: string) {
    const targetOp = await BoardOp.findById(versionId);
    if (!targetOp || targetOp.boardId.toString() !== boardId) {
      throw { statusCode: 404, message: 'Snapshot version not found' };
    }

    const board = await Board.findById(boardId);
    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    board.snapshot = targetOp.payload;
    await board.save();

    return {
      message: 'Board restored successfully to historical snapshot',
      snapshot: board.snapshot,
    };
  }
}
