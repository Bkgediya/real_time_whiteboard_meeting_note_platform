import { Response, NextFunction } from 'express';
import { VersionService } from '../services/version.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const versionService = new VersionService();

export class VersionController {
  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await versionService.getBoardVersionHistory(req.params.id);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  async restore(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { versionId } = req.params;
      const result = await versionService.restoreSnapshot(req.params.id, versionId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
