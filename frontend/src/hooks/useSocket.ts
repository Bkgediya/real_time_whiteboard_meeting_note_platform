import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useBoardStore } from '../store/useBoardStore';

export interface CursorPresence {
  userId: string;
  userName: string;
  x: number;
  y: number;
}

export const useSocket = (boardId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [cursors, setCursors] = useState<Record<string, CursorPresence>>({});
  const [notesContent, setNotesContent] = useState<string>('');
  const accessToken = useAuthStore((state) => state.accessToken);
  const addElement = useBoardStore((state) => state.addElement);

  useEffect(() => {
    if (!boardId || !accessToken) return;

    const socket = io('http://localhost:5000', {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to server');
      socket.emit('board:join', boardId);
    });

    socket.on('cursor:update', (data: CursorPresence) => {
      setCursors((prev) => ({
        ...prev,
        [data.userId]: data,
      }));
    });

    socket.on('canvas:op', (data: { opType: string; element: any }) => {
      if (data.opType === 'add') {
        addElement(data.element);
      }
    });

    socket.on('notes:update', (data: { content: string }) => {
      setNotesContent(data.content);
    });

    return () => {
      socket.emit('board:leave', boardId);
      socket.disconnect();
    };
  }, [boardId, accessToken, addElement]);

  const emitCursorMove = (x: number, y: number, userName: string) => {
    if (socketRef.current && boardId) {
      socketRef.current.emit('cursor:move', { boardId, x, y, userName });
    }
  };

  const emitCanvasOp = (opType: 'add' | 'update' | 'delete' | 'clear', element: any) => {
    if (socketRef.current && boardId) {
      socketRef.current.emit('canvas:op', { boardId, opType, element });
    }
  };

  const emitNotesUpdate = (content: string) => {
    if (socketRef.current && boardId) {
      socketRef.current.emit('notes:update', { boardId, content });
    }
  };

  return {
    socket: socketRef.current,
    cursors,
    notesContent,
    emitCursorMove,
    emitCanvasOp,
    emitNotesUpdate,
  };
};
