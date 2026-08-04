import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useBoardStore } from '../store/useBoardStore';

export interface CursorPresence {
  userId: string;
  userName: string;
  x: number;
  y: number;
  timestamp?: number;
}

export const useSocket = (boardId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [cursors, setCursors] = useState<Record<string, CursorPresence>>({});
  const [notesContent, setNotesContent] = useState<string>('');
  const accessToken = useAuthStore((state) => state.accessToken);

  const addElement = useBoardStore((state) => state.addElement);
  const updateElement = useBoardStore((state) => state.updateElement);
  const removeElement = useBoardStore((state) => state.removeElement);
  const setElements = useBoardStore((state) => state.setElements);

  useEffect(() => {
    if (!boardId || !accessToken) return;

    const socket = io('http://localhost:5000', {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('board:join', boardId);
    });

    socket.on('cursor:update', (data: CursorPresence) => {
      setCursors((prev) => ({
        ...prev,
        [data.userId]: {
          ...data,
          timestamp: data.timestamp || Date.now(),
        },
      }));
    });

    socket.on('cursor:remove', (data: { userId: string }) => {
      setCursors((prev) => {
        const copy = { ...prev };
        delete copy[data.userId];
        return copy;
      });
    });

    socket.on('canvas:op', (data: { opType: 'add' | 'update' | 'delete' | 'clear'; element: any }) => {
      const { opType, element } = data;
      if (opType === 'add' && element) {
        addElement(element);
      } else if (opType === 'update' && element?.id) {
        updateElement(element.id, element);
      } else if (opType === 'delete' && element?.id) {
        removeElement(element.id);
      } else if (opType === 'clear') {
        setElements([]);
      }
    });

    socket.on('notes:update', (data: { content: string }) => {
      setNotesContent(data.content);
    });

    // Stale cursor auto-pruning interval (removes cursor if no update for 2.5s)
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        let changed = false;
        const copy = { ...prev };
        Object.entries(copy).forEach(([id, cursor]) => {
          if (cursor.timestamp && now - cursor.timestamp > 2500) {
            delete copy[id];
            changed = true;
          }
        });
        return changed ? copy : prev;
      });
    }, 1000);

    return () => {
      clearInterval(cleanupInterval);
      socket.emit('board:leave', boardId);
      socket.disconnect();
    };
  }, [boardId, accessToken, addElement, updateElement, removeElement, setElements]);

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
