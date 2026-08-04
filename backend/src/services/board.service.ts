import crypto from 'crypto';
import mongoose from 'mongoose';
import { Board } from '../models/Board.js';
import { BoardOp } from '../models/BoardOp.js';
import { Note } from '../models/Note.js';
import { Workspace } from '../models/Workspace.js';
import { User } from '../models/User.js';
import { BoardInvitation } from '../models/BoardInvitation.js';

export class BoardService {
  async createBoard(workspaceId: string, ownerId: string, title: string) {
    const board = await Board.create({
      title,
      workspaceId,
      ownerId,
      members: [{ userId: new mongoose.Types.ObjectId(ownerId), role: 'editor' }],
      snapshot: { elements: [] },
    });

    // Create corresponding meeting notes document for board
    await Note.create({
      boardId: board._id,
      content: '',
    });

    return board;
  }

  async getWorkspaceBoards(workspaceId: string, userId: string, search?: string, starredOnly?: boolean) {
    const userObjId = new mongoose.Types.ObjectId(userId);

    const query: any = {
      $or: [
        { 'members.userId': userObjId },
        { ownerId: userObjId },
      ],
    };

    if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
      query.$or.push({ workspaceId: new mongoose.Types.ObjectId(workspaceId) });
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (starredOnly) {
      query.isStarred = true;
    }

    const boards = await Board.find(query)
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar')
      .sort({ lastOpenedAt: -1, createdAt: -1 });

    // Filter to keep accessible boards: either user is owner, user is board member, or public workspace board
    const accessibleBoards = boards.filter((board) => {
      const getStrId = (id: any) => id?._id?.toString() ?? id?.toString() ?? '';
      const isOwner = board.ownerId && getStrId(board.ownerId) === userId;

      const isMember = board.members.some((m) => {
        if (!m.userId) return false;
        return getStrId(m.userId) === userId;
      });

      if (isOwner || isMember) return true;

      // Public board inside active workspace
      if (workspaceId && board.workspaceId.toString() === workspaceId && !(board as any).isPrivate) {
        return true;
      }

      return false;
    });

    return accessibleBoards;
  }

  async getBoardById(boardId: string, userId?: string) {
    const board = await Board.findById(boardId)
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar');

    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    let isReadOnly = false;
    if (userId) {
      const getStrId = (id: any) => id?._id?.toString() ?? id?.toString() ?? '';
      const isOwner = board.ownerId && getStrId(board.ownerId) === userId;

      const memberRecord = board.members.find((m) => {
        if (!m.userId) return false;
        return getStrId(m.userId) === userId;
      });

      if (!isOwner) {
        if (!memberRecord) {
          throw { statusCode: 403, message: 'Access denied: You must accept the board invitation to view this board' };
        }
        if (memberRecord.role === 'viewer') {
          isReadOnly = true;
        }
      }
    }

    board.lastOpenedAt = new Date();
    await board.save();

    const note = await Note.findOne({ boardId });

    return {
      board,
      note: note ? note.content : '',
      isReadOnly,
    };
  }

  async inviteToBoard(boardId: string, email: string, role: 'editor' | 'viewer') {
    const board = await Board.findById(boardId);
    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    const targetEmail = email.toLowerCase().trim();

    // Create or retrieve pending invitation record
    let invitation = await BoardInvitation.findOne({ boardId, email: targetEmail });
    if (!invitation) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      invitation = await BoardInvitation.create({
        boardId,
        email: targetEmail,
        role,
        token,
        expiresAt,
      });
    }

    const updatedBoard = await Board.findById(boardId)
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar');

    return {
      board: updatedBoard,
      invitation,
      message: `Board invitation sent to ${targetEmail} as ${role.toUpperCase()}. User must accept to view board.`,
    };
  }

  async getPendingBoardInvitations(email: string) {
    const invitations = await BoardInvitation.find({ email: email.toLowerCase() })
      .populate({
        path: 'boardId',
        select: 'title workspaceId ownerId',
        populate: { path: 'ownerId', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    return invitations;
  }

  async acceptBoardInvitation(token: string, userId: string) {
    const invitation = await BoardInvitation.findOne({ token });
    if (!invitation || invitation.expiresAt < new Date()) {
      throw { statusCode: 400, message: 'Invalid or expired board invitation token' };
    }

    const board = await Board.findById(invitation.boardId);
    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    const getStrId = (id: any) => id?._id?.toString() ?? id?.toString() ?? '';
    const existingMember = board.members.find((m) => {
      if (!m.userId) return false;
      return getStrId(m.userId) === userId;
    });

    if (!existingMember) {
      board.members.push({ userId: new mongoose.Types.ObjectId(userId), role: invitation.role });
      await board.save();
    }

    await BoardInvitation.findByIdAndDelete(invitation._id);
    return board;
  }

  async declineBoardInvitation(token: string) {
    await BoardInvitation.findOneAndDelete({ token });
    return { message: 'Board invitation declined' };
  }

  async removeBoardMember(boardId: string, targetUserId: string) {
    const board = await Board.findById(boardId);
    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    const getStrId = (id: any) => id?._id?.toString() ?? id?.toString() ?? '';
    board.members = board.members.filter((m) => {
      if (!m.userId) return false;
      return getStrId(m.userId) !== targetUserId;
    });
    await board.save();

    const updatedBoard = await Board.findById(boardId)
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar');

    return updatedBoard;
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
