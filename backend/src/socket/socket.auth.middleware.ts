import { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.utils.js';

export interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    email: string;
  };
}

export const socketAuthMiddleware = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token;

    if (!token || typeof token !== 'string') {
      return next(new Error('Authentication error: Token required'));
    }

    const decoded = verifyAccessToken(token);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid or expired token'));
  }
};
