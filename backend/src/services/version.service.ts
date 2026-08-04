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

    const opsUpToVersion = await BoardOp.find({
      boardId,
      sequenceId: { $lte: targetOp.sequenceId },
    }).sort({ sequenceId: 1 });

    const elementsMap = new Map<string, any>();

    for (const op of opsUpToVersion) {
      if (op.opType === 'update' && op.payload?.elements) {
        elementsMap.clear();
        op.payload.elements.forEach((el: any) => elementsMap.set(el.id, el));
      } else if (op.opType === 'add' || op.opType === 'update') {
        if (op.payload?.id) {
          elementsMap.set(op.payload.id, op.payload);
        }
      } else if (op.opType === 'delete') {
        if (op.payload?.id) {
          elementsMap.delete(op.payload.id);
        }
      } else if (op.opType === 'clear') {
        elementsMap.clear();
      }
    }

    const restoredSnapshot = { elements: Array.from(elementsMap.values()) };

    board.snapshot = restoredSnapshot;
    await board.save();

    return {
      message: 'Board restored successfully to historical snapshot',
      snapshot: restoredSnapshot,
    };
  }
}
