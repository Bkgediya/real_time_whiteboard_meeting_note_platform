import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { Workspace, WorkspaceRole } from '../models/Workspace.js';
import { Board } from '../models/Board.js';

const roleHierarchy: Record<WorkspaceRole, number> = {
  owner: 3,
  editor: 2,
  viewer: 1,
};

export const checkWorkspaceRole = (requiredRole: WorkspaceRole) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const workspaceId = req.params.workspaceId || req.params.id || req.body.workspaceId;

      if (!userId || !workspaceId) {
        return res.status(400).json({ error: 'User ID and Workspace ID are required for permission check' });
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      const member = workspace.members.find((m) => m.userId.toString() === userId);
      if (!member) {
        return res.status(403).json({ error: 'Access denied: You are not a member of this workspace' });
      }

      const userRoleLevel = roleHierarchy[member.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({ error: `Access denied: Requires ${requiredRole} role or higher` });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error during permission check' });
    }
  };
};

export const checkBoardRole = (requiredRole: WorkspaceRole) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const boardId = req.params.boardId || req.params.id;

      if (!userId || !boardId) {
        return res.status(400).json({ error: 'User ID and Board ID are required for permission check' });
      }

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }

      const workspace = await Workspace.findById(board.workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Parent Workspace not found' });
      }

      const member = workspace.members.find((m) => m.userId.toString() === userId);
      if (!member) {
        return res.status(403).json({ error: 'Access denied: You are not a member of this workspace' });
      }

      const userRoleLevel = roleHierarchy[member.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({ error: `Access denied: Requires ${requiredRole} role or higher` });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error during board permission check' });
    }
  };
};
