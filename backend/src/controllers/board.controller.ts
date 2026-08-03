import { Response, NextFunction } from 'express';
import { BoardService } from '../services/board.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const boardService = new BoardService();

export class BoardController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId, title } = req.body;
      const ownerId = req.user!.userId;
      const board = await boardService.createBoard(workspaceId, ownerId, title);
      res.status(201).json(board);
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceBoards(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { search, starred } = req.query;
      const boards = await boardService.getWorkspaceBoards(
        workspaceId,
        search as string,
        starred === 'true'
      );
      res.json(boards);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await boardService.getBoardById(req.params.id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async updateSnapshot(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { snapshot } = req.body;
      const userId = req.user!.userId;
      const board = await boardService.updateBoardSnapshot(req.params.id, snapshot, userId);
      res.json(board);
    } catch (error) {
      next(error);
    }
  }

  async toggleStar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const board = await boardService.toggleStar(req.params.id);
      res.json(board);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await boardService.deleteBoard(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async generateShareLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { expiresInDays } = req.body;
      const result = await boardService.generateShareLink(req.params.id, expiresInDays);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPublicBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { shareToken } = req.params;
      const result = await boardService.getPublicBoard(shareToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
