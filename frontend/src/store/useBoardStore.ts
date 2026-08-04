import { create } from 'zustand';

export type ToolType = 'select' | 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text' | 'sticky';

export interface CanvasElement {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
}

interface BoardState {
  selectedTool: ToolType;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
  elements: CanvasElement[];
  undoStack: CanvasElement[][];
  redoStack: CanvasElement[][];

  setSelectedTool: (tool: ToolType) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updatedProps: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  undo: () => void;
  redo: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  selectedTool: 'select',
  strokeColor: '#3b82f6',
  fillColor: '#ffffff',
  strokeWidth: 3,
  fontSize: 16,
  elements: [],
  undoStack: [],
  redoStack: [],

  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),

  setElements: (elements) => set({ elements }),

  addElement: (element) => {
    const { elements, undoStack } = get();
    if (elements.some((el) => el.id === element.id)) {
      set({
        elements: elements.map((el) => (el.id === element.id ? element : el)),
      });
      return;
    }
    set({
      elements: [...elements, element],
      undoStack: [...undoStack, elements],
      redoStack: [],
    });
  },

  updateElement: (id, updatedProps) => {
    const { elements, undoStack } = get();
    const updated = elements.map((el) => (el.id === id ? { ...el, ...updatedProps } : el));
    set({
      elements: updated,
      undoStack: [...undoStack, elements],
      redoStack: [],
    });
  },

  removeElement: (id) => {
    const { elements, undoStack } = get();
    const updated = elements.filter((el) => el.id !== id);
    set({
      elements: updated,
      undoStack: [...undoStack, elements],
      redoStack: [],
    });
  },

  undo: () => {
    const { elements, undoStack, redoStack } = get();
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    set({
      elements: previous,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, elements],
    });
  },

  redo: () => {
    const { elements, undoStack, redoStack } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      elements: next,
      undoStack: [...undoStack, elements],
      redoStack: redoStack.slice(0, -1),
    });
  },
}));
