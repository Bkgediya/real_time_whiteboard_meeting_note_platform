import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { sendRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/jwt.utils.js';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);
      sendRefreshTokenCookie(res, result.refreshToken);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendRefreshTokenCookie(res, result.refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const result = await authService.refresh(refreshToken);
      sendRefreshTokenCookie(res, result.refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const result = await authService.verifyEmail(token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await authService.getCurrentUser(userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await authService.logout(userId);
      clearRefreshTokenCookie(res);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}
