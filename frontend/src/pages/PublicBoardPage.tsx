import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { boardApi, BoardDetailResponse } from '../api/boardApi';
import { useBoardStore } from '../store/useBoardStore';
import { Canvas } from '../components/board/Canvas';
import { NotesPanel } from '../components/board/NotesPanel';
import { Lock, FileText } from 'lucide-react';

export const PublicBoardPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [boardDetail, setBoardDetail] = useState<BoardDetailResponse | null>(null);
  const [showNotes, setShowNotes] = useState(true);
  const [error, setError] = useState('');
  const setElements = useBoardStore((state) => state.setElements);

  useEffect(() => {
    if (!shareToken) return;
    boardApi
      .getPublicBoard(shareToken)
      .then((data) => {
        setBoardDetail(data);
        if (data.board.snapshot?.elements) {
          setElements(data.board.snapshot.elements);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Invalid or expired share link');
      });
  }, [shareToken, setElements]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <Lock className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-100 mb-1">Access Restricted</h2>
        <p className="text-sm text-slate-400 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100 relative">
      <header className="h-14 bg-slate-950/90 border-b border-slate-800 px-4 flex items-center justify-between z-30 select-none">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-lg flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>Public Read-Only View</span>
          </span>
          <h2 className="font-bold text-slate-100 text-base">
            {boardDetail ? boardDetail.board.title : 'Loading Board...'}
          </h2>
        </div>

        <button
          onClick={() => setShowNotes(!showNotes)}
          className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
        >
          <FileText className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 h-full relative">
          <Canvas isReadOnly={true} />
        </div>

        {showNotes && (
          <NotesPanel
            initialContent={boardDetail ? boardDetail.note : ''}
            onUpdateNotes={() => {}}
            isReadOnly={true}
            onClose={() => setShowNotes(false)}
          />
        )}
      </div>
    </div>
  );
};
