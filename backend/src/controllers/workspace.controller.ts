import { Response, NextFunction } from 'express';
import { WorkspaceService } from '../services/workspace.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const workspaceService = new WorkspaceService();

export class WorkspaceController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const userId = req.user!.userId;
      const workspace = await workspaceService.createWorkspace(name, userId);
      res.status(201).json(workspace);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const workspaces = await workspaceService.getUserWorkspaces(userId);
      res.json(workspaces);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.getWorkspaceById(req.params.id);
      res.json(workspace);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const workspace = await workspaceService.updateWorkspace(req.params.id, name);
      res.json(workspace);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await workspaceService.deleteWorkspace(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, role } = req.body;
      const invitation = await workspaceService.inviteMember(req.params.id, email, role);
      res.status(201).json(invitation);
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const userId = req.user!.userId;
      const workspace = await workspaceService.acceptInvitation(token, userId);
      res.json(workspace);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const workspace = await workspaceService.removeMember(req.params.id, memberId);
      res.json(workspace);
    } catch (error) {
      next(error);
    }
  }
}
