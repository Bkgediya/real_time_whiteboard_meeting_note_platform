import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardApi, BoardDetailResponse } from '../api/boardApi';
import { useBoardStore } from '../store/useBoardStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSocket } from '../hooks/useSocket';
import { Canvas } from '../components/board/Canvas';
import { Toolbar } from '../components/board/Toolbar';
import { PresenceLayer } from '../components/board/PresenceLayer';
import { NotesPanel } from '../components/board/NotesPanel';
import { VersionHistoryModal } from '../components/board/VersionHistoryModal';
import { ExportModal } from '../components/board/ExportModal';
import { ShareModal } from '../components/board/ShareModal';
import { ArrowLeft, Share2, Download, History, FileText, Save } from 'lucide-react';

export const BoardPage: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { elements, setElements } = useBoardStore();

  const [boardDetail, setBoardDetail] = useState<BoardDetailResponse | null>(null);
  const [showNotes, setShowNotes] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [saving, setSaving] = useState(false);

  const { cursors, notesContent, emitCursorMove, emitCanvasOp, emitNotesUpdate } = useSocket(boardId);

  useEffect(() => {
    if (!boardId) return;
    boardApi.getBoardById(boardId).then((data) => {
      setBoardDetail(data);
      if (data.board.snapshot?.elements) {
        setElements(data.board.snapshot.elements);
      }
    });
  }, [boardId, setElements]);

  const handleSaveSnapshot = async () => {
    if (!boardId) return;
    setSaving(true);
    try {
      await boardApi.updateSnapshot(boardId, { elements });
      setSaving(false);
    } catch (e) {
      setSaving(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100 relative">
      {/* Board Top Navigation Bar */}
      <header className="h-14 bg-slate-950/90 border-b border-slate-800 px-4 flex items-center justify-between z-30 select-none backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-slate-100 text-base">
            {boardDetail ? boardDetail.board.title : 'Loading Board...'}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveSnapshot}
            disabled={saving}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 text-slate-300"
          >
            <Save className="w-3.5 h-3.5 text-blue-400" />
            <span>{saving ? 'Saving...' : 'Save Snapshot'}</span>
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            title="Version History"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowExport(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            title="Export Board / Notes"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowShare(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-lg border transition-colors ${
              showNotes ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Meeting Notes Panel"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Surface Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Drawing Toolbar */}
        <Toolbar />

        {/* Live Cursors Presence Overlay */}
        <PresenceLayer cursors={cursors} />

        {/* Konva Stage Whiteboard */}
        <div className="flex-1 h-full relative">
          <Canvas
            onCanvasOp={(opType, element) => emitCanvasOp(opType, element)}
            onCursorMove={(x, y) => emitCursorMove(x, y, user?.name || 'User')}
          />
        </div>

        {/* Side-by-side Rich Meeting Notes Panel */}
        {showNotes && (
          <NotesPanel
            initialContent={notesContent || (boardDetail ? boardDetail.note : '')}
            onUpdateNotes={(content) => emitNotesUpdate(content)}
            onClose={() => setShowNotes(false)}
          />
        )}
      </div>

      {/* Modals */}
      {showHistory && boardId && (
        <VersionHistoryModal
          boardId={boardId}
          onClose={() => setShowHistory(false)}
          onRestore={(snapshot) => {
            if (snapshot?.elements) setElements(snapshot.elements);
          }}
        />
      )}

      {showExport && boardId && (
        <ExportModal boardId={boardId} onClose={() => setShowExport(false)} />
      )}

      {showShare && boardId && (
        <ShareModal boardId={boardId} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
};
