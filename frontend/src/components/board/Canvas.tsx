import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text as KonvaText, Group } from 'react-konva';
import { useBoardStore, CanvasElement } from '../../store/useBoardStore';

interface CanvasProps {
  onCanvasOp?: (opType: 'add' | 'update' | 'delete' | 'clear', element: CanvasElement) => void;
  onCursorMove?: (x: number, y: number) => void;
  isReadOnly?: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ onCanvasOp, onCursorMove, isReadOnly = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const {
    selectedTool,
    setSelectedTool,
    strokeColor,
    strokeWidth,
    fillColor,
    elements,
    addElement,
    updateElement,
    removeElement,
  } = useBoardStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [editingPos, setEditingPos] = useState<{ x: number; y: number; width?: number; height?: number }>({ x: 0, y: 0 });

  const currentLineRef = useRef<CanvasElement | null>(null);

  // Dynamic Responsive Resize Observer for all devices & screen resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth || window.innerWidth,
          height: containerRef.current.offsetHeight || window.innerHeight,
        });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const handleElementEraserClick = (el: CanvasElement) => {
    if (selectedTool === 'eraser' && !isReadOnly) {
      removeElement(el.id);
      if (onCanvasOp) onCanvasOp('delete', el);
    }
  };

  const handleMouseDown = (e: any) => {
    if (isReadOnly) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    // If clicking on background while inline editing, commit edits
    if (editingId) {
      commitInlineEdit();
    }

    if (selectedTool === 'pen') {
      setIsDrawing(true);
      const newEl: CanvasElement = {
        id: Date.now().toString(),
        type: 'pen',
        x: 0,
        y: 0,
        points: [point.x, point.y],
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      };
      currentLineRef.current = newEl;
      addElement(newEl);
      if (onCanvasOp) onCanvasOp('add', newEl);
    } else if (selectedTool === 'rectangle') {
      const newEl: CanvasElement = {
        id: Date.now().toString(),
        type: 'rectangle',
        x: point.x,
        y: point.y,
        width: 140,
        height: 90,
        fill: fillColor || '#3b82f6',
        stroke: strokeColor,
        strokeWidth,
      };
      addElement(newEl);
      if (onCanvasOp) onCanvasOp('add', newEl);
      setSelectedTool('select');
    } else if (selectedTool === 'circle') {
      const newEl: CanvasElement = {
        id: Date.now().toString(),
        type: 'circle',
        x: point.x,
        y: point.y,
        radius: 60,
        fill: fillColor || '#3b82f6',
        stroke: strokeColor,
        strokeWidth,
      };
      addElement(newEl);
      if (onCanvasOp) onCanvasOp('add', newEl);
      setSelectedTool('select');
    } else if (selectedTool === 'text') {
      const defaultText = 'Type text here';
      const newEl: CanvasElement = {
        id: Date.now().toString(),
        type: 'text',
        x: point.x,
        y: point.y,
        text: defaultText,
        fill: strokeColor || '#ffffff',
        fontSize: 20,
      };
      addElement(newEl);
      if (onCanvasOp) onCanvasOp('add', newEl);

      // Immediately start inline editing
      setEditingId(newEl.id);
      setEditingText(defaultText);
      setEditingPos({ x: point.x, y: point.y, width: 200, height: 40 });
      setSelectedTool('select');
    } else if (selectedTool === 'sticky') {
      const defaultNote = 'Sticky note text';
      const newEl: CanvasElement = {
        id: Date.now().toString(),
        type: 'sticky',
        x: point.x,
        y: point.y,
        width: 160,
        height: 160,
        fill: '#fef08a',
        text: defaultNote,
      };
      addElement(newEl);
      if (onCanvasOp) onCanvasOp('add', newEl);

      // Immediately start inline editing
      setEditingId(newEl.id);
      setEditingText(defaultNote);
      setEditingPos({ x: point.x + 10, y: point.y + 10, width: 140, height: 140 });
      setSelectedTool('select');
    }
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (onCursorMove && point) {
      onCursorMove(point.x, point.y);
    }

    if (!isDrawing || isReadOnly || !currentLineRef.current || !point) return;

    const updatedPoints = currentLineRef.current.points?.concat([point.x, point.y]) || [];
    const updatedEl = { ...currentLineRef.current, points: updatedPoints };
    currentLineRef.current = updatedEl;
    updateElement(updatedEl.id, { points: updatedPoints });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentLineRef.current && onCanvasOp) {
      onCanvasOp('update', currentLineRef.current);
    }
    setIsDrawing(false);
    currentLineRef.current = null;
  };

  const startInlineEdit = (el: CanvasElement) => {
    if (isReadOnly) return;
    setEditingId(el.id);
    setEditingText(el.text || '');
    if (el.type === 'sticky') {
      setEditingPos({ x: el.x + 10, y: el.y + 10, width: 140, height: 140 });
    } else {
      setEditingPos({ x: el.x, y: el.y, width: 200, height: 40 });
    }
  };

  const commitInlineEdit = () => {
    if (!editingId) return;
    updateElement(editingId, { text: editingText });
    const freshElements = useBoardStore.getState().elements;
    const el = freshElements.find((e) => e.id === editingId);
    if (el && onCanvasOp) {
      onCanvasOp('update', { ...el, text: editingText });
    }
    setEditingId(null);
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-950 relative overflow-hidden select-none">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className={selectedTool === 'eraser' ? 'cursor-pointer' : 'cursor-crosshair'}
      >
        <Layer>
          {elements.map((el) => {
            if (el.type === 'pen') {
              return (
                <Line
                  key={el.id}
                  points={el.points || []}
                  stroke={el.stroke}
                  strokeWidth={el.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  onClick={() => handleElementEraserClick(el)}
                  onTap={() => handleElementEraserClick(el)}
                />
              );
            }
            if (el.type === 'rectangle') {
              return (
                <Rect
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  fill={el.fill}
                  stroke={el.stroke}
                  strokeWidth={el.strokeWidth}
                  draggable={!isReadOnly && selectedTool === 'select'}
                  onClick={() => handleElementEraserClick(el)}
                  onTap={() => handleElementEraserClick(el)}
                  onDragEnd={(e) => {
                    updateElement(el.id, { x: e.target.x(), y: e.target.y() });
                    if (onCanvasOp) onCanvasOp('update', { ...el, x: e.target.x(), y: e.target.y() });
                  }}
                />
              );
            }
            if (el.type === 'circle') {
              return (
                <Circle
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  radius={el.radius}
                  fill={el.fill}
                  stroke={el.stroke}
                  strokeWidth={el.strokeWidth}
                  draggable={!isReadOnly && selectedTool === 'select'}
                  onClick={() => handleElementEraserClick(el)}
                  onTap={() => handleElementEraserClick(el)}
                  onDragEnd={(e) => {
                    updateElement(el.id, { x: e.target.x(), y: e.target.y() });
                    if (onCanvasOp) onCanvasOp('update', { ...el, x: e.target.x(), y: e.target.y() });
                  }}
                />
              );
            }
            if (el.type === 'text') {
              return (
                <KonvaText
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  text={editingId === el.id ? '' : el.text}
                  fontSize={el.fontSize}
                  fill={el.fill}
                  draggable={!isReadOnly && selectedTool === 'select'}
                  onClick={() => handleElementEraserClick(el)}
                  onTap={() => handleElementEraserClick(el)}
                  onDblClick={() => startInlineEdit(el)}
                  onDblTap={() => startInlineEdit(el)}
                  onDragEnd={(e) => {
                    updateElement(el.id, { x: e.target.x(), y: e.target.y() });
                    if (onCanvasOp) onCanvasOp('update', { ...el, x: e.target.x(), y: e.target.y() });
                  }}
                />
              );
            }
            if (el.type === 'sticky') {
              return (
                <Group
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  draggable={!isReadOnly && selectedTool === 'select'}
                  onClick={() => handleElementEraserClick(el)}
                  onTap={() => handleElementEraserClick(el)}
                  onDblClick={() => startInlineEdit(el)}
                  onDblTap={() => startInlineEdit(el)}
                  onDragEnd={(e) => {
                    updateElement(el.id, { x: e.target.x(), y: e.target.y() });
                    if (onCanvasOp) onCanvasOp('update', { ...el, x: e.target.x(), y: e.target.y() });
                  }}
                >
                  <Rect width={160} height={160} fill={el.fill} cornerRadius={8} shadowBlur={10} shadowOpacity={0.2} />
                  <KonvaText
                    text={editingId === el.id ? '' : el.text}
                    width={140}
                    height={140}
                    x={10}
                    y={10}
                    fontSize={14}
                    fill="#1e293b"
                    wrap="word"
                  />
                </Group>
              );
            }
            return null;
          })}
        </Layer>
      </Stage>

      {/* Floating HTML textarea overlay for inline text / sticky editing */}
      {editingId && (
        <textarea
          autoFocus
          value={editingText}
          onChange={(e) => {
            const val = e.target.value;
            setEditingText(val);
            updateElement(editingId, { text: val });
            const freshElements = useBoardStore.getState().elements;
            const el = freshElements.find((item) => item.id === editingId);
            if (el && onCanvasOp) {
              onCanvasOp('update', { ...el, text: val });
            }
          }}
          onBlur={commitInlineEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              commitInlineEdit();
            }
          }}
          className="absolute bg-slate-900/90 text-white border border-blue-500 rounded-lg p-2 text-sm focus:outline-none z-30 shadow-2xl resize-none"
          style={{
            left: `${editingPos.x}px`,
            top: `${editingPos.y}px`,
            width: `${editingPos.width || 160}px`,
            height: `${editingPos.height || 60}px`,
          }}
        />
      )}
    </div>
  );
};
