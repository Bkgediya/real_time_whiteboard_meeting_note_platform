import React from 'react';
import { CursorPresence } from '../../hooks/useSocket';
import { MousePointer2 } from 'lucide-react';

interface PresenceLayerProps {
  cursors: Record<string, CursorPresence>;
}

const CURSOR_COLORS = ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];

export const PresenceLayer: React.FC<PresenceLayerProps> = ({ cursors }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {Object.values(cursors).map((cursor, index) => {
        const color = CURSOR_COLORS[index % CURSOR_COLORS.length];
        return (
          <div
            key={cursor.userId}
            className="absolute transition-all duration-75 ease-out flex items-center gap-1.5"
            style={{
              transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
            }}
          >
            <MousePointer2 className="w-5 h-5 drop-shadow-md" style={{ color, fill: color }} />
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full text-white shadow-lg whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {cursor.userName}
            </span>
          </div>
        );
      })}
    </div>
  );
};
