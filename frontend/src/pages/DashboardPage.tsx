import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { workspaceApi } from '../api/workspaceApi';
import { boardApi, Board } from '../api/boardApi';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Star, Clock, LayoutGrid, Users, UserPlus, Trash2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { activeWorkspace, setWorkspaces, setActiveWorkspace } = useWorkspaceStore();
  const [boards, setBoards] = useState<Board[]>([]);
  const [search, setSearch] = useState('');
  const [starredOnly, setStarredOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'editor' | 'viewer'>('editor');

  const navigate = useNavigate();

  useEffect(() => {
    workspaceApi.getUserWorkspaces().then((data) => {
      setWorkspaces(data);
      if (data.length > 0 && !activeWorkspace) {
        setActiveWorkspace(data[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeWorkspace) return;
    setLoading(true);
    boardApi
      .getWorkspaceBoards(activeWorkspace._id, search, starredOnly)
      .then((data) => {
        setBoards(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeWorkspace, search, starredOnly]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !newBoardTitle) return;
    try {
      const board = await boardApi.createBoard(activeWorkspace._id, newBoardTitle);
      setBoards((prev) => [board, ...prev]);
      setShowCreateModal(false);
      setNewBoardTitle('');
      navigate(`/board/${board._id}`);
    } catch (e) {
      alert('Failed to create board');
    }
  };

  const handleToggleStar = async (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await boardApi.toggleStar(boardId);
      setBoards((prev) => prev.map((b) => (b._id === boardId ? updated : b)));
    } catch (e) {
      alert('Failed to toggle star');
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !inviteEmail) return;
    try {
      await workspaceApi.inviteMember(activeWorkspace._id, inviteEmail, inviteRole);
      alert(`Invitation sent to ${inviteEmail}!`);
      setShowInviteModal(false);
      setInviteEmail('');
    } catch (e) {
      alert('Failed to send invitation');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {activeWorkspace ? activeWorkspace.name : 'Dashboard'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Collaborative whiteboard workspaces & meeting notes
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all"
            >
              <UserPlus className="w-4 h-4 text-blue-400" />
              <span>Invite Members</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Board</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search boards by title..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setStarredOnly(!starredOnly)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 border transition-all ${
              starredOnly
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-4 h-4 ${starredOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Starred Boards</span>
          </button>
        </div>

        {/* Board Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800/80 rounded-3xl">
            <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">No boards found</h3>
            <p className="text-sm text-slate-500 mt-1">Create your first collaborative board to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board._id}
                onClick={() => navigate(`/board/${board._id}`)}
                className="group bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between shadow-xl relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                      {board.title}
                    </h3>
                    <button
                      onClick={(e) => handleToggleStar(board._id, e)}
                      className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      <Star className={`w-5 h-5 ${board.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-6 pt-3 border-t border-slate-800/60">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last opened {new Date(board.lastOpenedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create New Whiteboard</h3>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <input
                type="text"
                required
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Board Title (e.g., Sprint Planning)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Invite Member to Workspace</h3>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
              >
                <option value="editor">Editor (Draw, Edit Notes)</option>
                <option value="viewer">Viewer (Read Only)</option>
                <option value="owner">Owner (Full Control)</option>
              </select>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
