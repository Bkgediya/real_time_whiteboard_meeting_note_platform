import React from 'react';
import { useBoardStore, ToolType } from '../../store/useBoardStore';
import {
  MousePointer,
  Pencil,
  Eraser,
  Square,
  Circle,
  Type,
  StickyNote,
  Undo,
  Redo,
} from 'lucide-react';

interface ToolbarProps {
  onClear?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onClear }) => {
  const {
    selectedTool,
    setSelectedTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useBoardStore();

  const tools: { id: ToolType; label: string; icon: React.ReactNode }[] = [
    { id: 'select', label: 'Select', icon: <MousePointer className="w-5 h-5" /> },
    { id: 'pen', label: 'Pen', icon: <Pencil className="w-5 h-5" /> },
    { id: 'eraser', label: 'Eraser', icon: <Eraser className="w-5 h-5" /> },
    { id: 'rectangle', label: 'Rectangle', icon: <Square className="w-5 h-5" /> },
    { id: 'circle', label: 'Circle', icon: <Circle className="w-5 h-5" /> },
    { id: 'text', label: 'Text', icon: <Type className="w-5 h-5" /> },
    { id: 'sticky', label: 'Sticky Note', icon: <StickyNote className="w-5 h-5" /> },
  ];

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ffffff', '#0f172a'];

  return (
    <div className="absolute top-6 left-6 z-20 flex flex-col gap-3 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-2xl">
      {/* Tool Selector Buttons */}
      <div className="flex flex-col gap-1.5">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTool(t.id)}
            title={t.label}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              selectedTool === t.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="h-px bg-slate-800 my-1" />

      {/* Color Palette */}
      <div className="flex flex-col gap-1.5 items-center">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setStrokeColor(c)}
            className={`w-6 h-6 rounded-full border border-slate-700 transition-transform ${
              strokeColor === c ? 'scale-125 ring-2 ring-blue-500' : 'hover:scale-110'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="h-px bg-slate-800 my-1" />

      {/* Stroke Width Selector */}
      <div className="flex flex-col items-center gap-1">
        {[2, 4, 8].map((w) => (
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            className={`w-6 h-6 rounded-lg text-xs font-bold transition-colors ${
              strokeWidth === w ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="h-px bg-slate-800 my-1" />

      {/* Undo & Redo */}
      <div className="flex flex-col gap-1">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo"
          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo className="w-5 h-5" />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo"
          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
