import React, { useEffect, useState } from 'react';
import { boardApi } from '../../api/boardApi';
import { History, X, RotateCcw } from 'lucide-react';

interface VersionHistoryModalProps {
  boardId: string;
  onClose: () => void;
  onRestore: (snapshot: any) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ boardId, onClose, onRestore }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    boardApi
      .getHistory(boardId)
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [boardId]);

  const handleRestore = async (versionId: string) => {
    try {
      const res = await boardApi.restoreSnapshot(boardId, versionId);
      onRestore(res.snapshot);
      onClose();
    } catch (e) {
      alert('Failed to restore snapshot version');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-lg">Board Version History</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 max-h-80 overflow-y-auto space-y-3">
          {loading ? (
            <p className="text-slate-400 text-sm text-center py-6">Loading version history...</p>
          ) : history.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No previous operation snapshots recorded yet.</p>
          ) : (
            history.map((item) => (
              <div
                key={item._id}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Operation: <span className="uppercase text-blue-400">{item.opType}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()} by {item.userId?.name || 'User'}
                  </p>
                </div>
                <button
                  onClick={() => handleRestore(item._id)}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
