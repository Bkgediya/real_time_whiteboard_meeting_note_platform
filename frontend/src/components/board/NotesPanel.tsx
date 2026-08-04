import React, { useState, useEffect } from 'react';
import { FileText, X } from 'lucide-react';

interface NotesPanelProps {
  initialContent: string;
  onUpdateNotes: (content: string) => void;
  onClose?: () => void;
  isReadOnly?: boolean;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  initialContent,
  onUpdateNotes,
  onClose,
  isReadOnly = false,
}) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    onUpdateNotes(val);
  };

  return (
    <div className="absolute top-0 right-0 bottom-0 z-50 w-80 md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl transition-all duration-200">
      {/* Header */}
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center space-x-2 text-blue-400">
          <FileText className="w-5 h-5" />
          <span className="font-semibold text-slate-200 text-sm">Meeting Notes</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close Notes Panel"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Textarea Notes Editor */}
      <div className="flex-1 p-4 bg-slate-900/50">
        <textarea
          autoFocus
          value={content}
          onChange={handleChange}
          readOnly={isReadOnly}
          placeholder="Capture meeting minutes, key decisions, and notes here..."
          className="w-full h-full bg-transparent text-slate-200 text-sm leading-relaxed focus:outline-none resize-none placeholder-slate-600 select-text"
        />
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
        <span>CRDT Real-time Sync Active</span>
        <span>{content.length} chars</span>
      </div>
    </div>
  );
};
