import React, { useEffect, useState } from 'react';
import { UserPlus, Trash2, X, Shield, Lock } from 'lucide-react';
import { boardApi, Board, BoardMember } from '../../api/boardApi';

interface InviteBoardModalProps {
  boardId: string;
  onClose: () => void;
}

export const InviteBoardModal: React.FC<InviteBoardModalProps> = ({ boardId, onClose }) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    boardApi.getBoardById(boardId).then((data) => {
      setBoard(data.board);
    });
  }, [boardId]);

  const handleAddBoardMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setUpdating(true);
    try {
      const res = await boardApi.inviteToBoard(boardId, inviteEmail, inviteRole);
      setBoard(res.board);
      setInviteEmail('');
      alert(res.message || `Board invitation sent to ${inviteEmail} as ${inviteRole.toUpperCase()}`);
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to send board invitation');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveBoardMember = async (memberId: string) => {
    try {
      const updated = await boardApi.removeBoardMember(boardId, memberId);
      setBoard(updated);
    } catch (e) {
      alert('Failed to remove member access');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-lg">Invite to Board ({board?.title || 'Board'})</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invite User to this Specific Board */}
        <form onSubmit={handleAddBoardMember} className="my-5 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <UserPlus className="w-3.5 h-3.5 text-blue-400" />
            <span>Invite Collaborator to this Board</span>
          </label>
          <div className="space-y-2">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="ketan@example.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="editor">Editor (Can Draw & Edit Notes)</option>
                <option value="viewer">Viewer (Read Only Access)</option>
              </select>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                {updating ? 'Inviting...' : 'Send Board Invite'}
              </button>
            </div>
          </div>
        </form>

        {/* Current Board Members & Permissions List */}
        {board?.members && board.members.length > 0 && (
          <div className="my-5 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Board Access List</label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {board.members.map((m: BoardMember) => {
                const isUserObj = typeof m.userId === 'object';
                const name = isUserObj ? m.userId?.name || 'User' : 'User';
                const email = isUserObj ? m.userId?.email || '' : '';
                const memberId = isUserObj ? m.userId?._id : (m.userId as unknown as string);

                return (
                  <div key={memberId} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{name}</p>
                      <p className="text-[10px] text-slate-500">{email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full uppercase ${
                        m.role === 'editor' ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {m.role}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBoardMember(memberId)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Revoke Board Access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
