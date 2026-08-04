import React, { useEffect, useState, useRef } from 'react';
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
import { ArrowLeft, Share2, Download, History, FileText, CheckCircle2, Loader2 } from 'lucide-react';

export const BoardPage: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { elements, setElements } = useBoardStore();

  const [boardDetail, setBoardDetail] = useState<BoardDetailResponse | null>(null);
  const [notesText, setNotesText] = useState<string>('');
  const [showNotes, setShowNotes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Save Status: 'saved' | 'saving' | 'unsaved'
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const isInitialLoadRef = useRef(true);

  const { cursors, notesContent, emitCursorMove, emitCanvasOp, emitNotesUpdate } = useSocket(boardId);

  // Initial Board Fetch
  useEffect(() => {
    if (!boardId) return;
    isInitialLoadRef.current = true;
    boardApi.getBoardById(boardId).then((data) => {
      setBoardDetail(data);
      if (data.note) {
        setNotesText(data.note);
      }
      if (data.board.snapshot?.elements) {
        setElements(data.board.snapshot.elements);
      }
      setTimeout(() => {
        isInitialLoadRef.current = false;
        setSaveStatus('saved');
      }, 500);
    });
  }, [boardId, setElements]);

  // Sync real-time notes updates received from socket
  useEffect(() => {
    if (notesContent) {
      setNotesText(notesContent);
    }
  }, [notesContent]);

  // Debounced Auto-Save Effect
  useEffect(() => {
    if (isInitialLoadRef.current || !boardId || !boardDetail) return;

    setSaveStatus('unsaved');
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await boardApi.updateSnapshot(boardId, { elements });
        setSaveStatus('saved');
      } catch (e) {
        setSaveStatus('unsaved');
      }
    }, 1200); // Auto-save 1.2s after last canvas change

    return () => clearTimeout(timer);
  }, [elements, boardId, boardDetail]);

  const handleNotesUpdate = (newContent: string) => {
    setNotesText(newContent);
    emitNotesUpdate(newContent);
  };

  const handleManualSave = async () => {
    if (!boardId) return;
    setSaveStatus('saving');
    try {
      await boardApi.updateSnapshot(boardId, { elements });
      setSaveStatus('saved');
    } catch (e) {
      setSaveStatus('unsaved');
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
          {/* Automatic Save Indicator */}
          <button
            onClick={handleManualSave}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium flex items-center space-x-1.5 text-slate-300"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span className="text-blue-400">Saving...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">All changes saved</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400">Saving changes...</span>
              </>
            )}
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
            initialContent={notesText}
            onUpdateNotes={handleNotesUpdate}
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
            if (snapshot?.elements) {
              setElements(snapshot.elements);
            } else if (Array.isArray(snapshot)) {
              setElements(snapshot);
            }
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
