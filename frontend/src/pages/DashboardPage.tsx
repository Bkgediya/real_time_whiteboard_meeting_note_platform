import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { workspaceApi, WorkspaceMember, Invitation } from '../api/workspaceApi';
import { boardApi, Board, BoardInvitation } from '../api/boardApi';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Star, Clock, LayoutGrid, Users, UserPlus, Mail, Check, X, Shield, Trash2, Lock, Eye, Edit3, Share2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { InviteBoardModal } from '../components/board/InviteBoardModal';

export const DashboardPage: React.FC = () => {
  const { activeWorkspace, setWorkspaces, setActiveWorkspace } = useWorkspaceStore();
  const currentUser = useAuthStore((state) => state.user);

  const [boards, setBoards] = useState<Board[]>([]);
  const [pendingWorkspaceInvites, setPendingWorkspaceInvites] = useState<Invitation[]>([]);
  const [pendingBoardInvites, setPendingBoardInvites] = useState<BoardInvitation[]>([]);
  const [search, setSearch] = useState('');
  const [starredOnly, setStarredOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [managingBoardId, setManagingBoardId] = useState<string | null>(null);

  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'editor' | 'viewer'>('editor');
  const [inviting, setInviting] = useState(false);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const data = await workspaceApi.getUserWorkspaces();
      setWorkspaces(data);
      if (data.length > 0) {
        const currentUserId = currentUser?.id;
        const isActiveValid = activeWorkspace && data.some((w) => w._id === activeWorkspace._id);
        const isActiveOwned = activeWorkspace && currentUserId && (
          typeof activeWorkspace.ownerId === 'object'
            ? (activeWorkspace.ownerId as any)._id === currentUserId
            : activeWorkspace.ownerId === currentUserId
        );

        if (!activeWorkspace || !isActiveValid || !isActiveOwned) {
          setActiveWorkspace(data[0]);
        } else {
          const updatedActive = data.find((w) => w._id === activeWorkspace._id);
          if (updatedActive) setActiveWorkspace(updatedActive);
          else setActiveWorkspace(data[0]);
        }
      }

      // Fetch pending workspace and board invitations
      const wsInvites = await workspaceApi.getPendingInvitations();
      setPendingWorkspaceInvites(wsInvites);

      const boardInvites = await boardApi.getPendingBoardInvitations();
      setPendingBoardInvites(boardInvites);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
  };

  useEffect(() => {
    loadData();
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

  const handleAcceptWorkspaceInvite = async (token: string) => {
    try {
      const joinedWorkspace = await workspaceApi.acceptInvitation(token);
      alert(`Joined workspace "${joinedWorkspace.name}"!`);
      await loadData();
      setActiveWorkspace(joinedWorkspace);
    } catch (e) {
      alert('Failed to accept invitation');
    }
  };

  const handleDeclineWorkspaceInvite = async (token: string) => {
    try {
      await workspaceApi.declineInvitation(token);
      setPendingWorkspaceInvites((prev) => prev.filter((i) => i.token !== token));
    } catch (e) {
      alert('Failed to decline invitation');
    }
  };

  const handleAcceptBoardInvite = async (token: string) => {
    try {
      const board = await boardApi.acceptBoardInvitation(token);
      alert(`Accepted invitation to board "${board.title}"!`);
      await loadData();
      if (activeWorkspace) {
        const data = await boardApi.getWorkspaceBoards(activeWorkspace._id, search, starredOnly);
        setBoards(data);
      }
    } catch (e) {
      alert('Failed to accept board invitation');
    }
  };

  const handleDeclineBoardInvite = async (token: string) => {
    try {
      await boardApi.declineBoardInvitation(token);
      setPendingBoardInvites((prev) => prev.filter((i) => i.token !== token));
    } catch (e) {
      alert('Failed to decline board invitation');
    }
  };

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
    setInviting(true);
    try {
      await workspaceApi.inviteMember(activeWorkspace._id, inviteEmail, inviteRole);
      alert(`Workspace invitation sent to ${inviteEmail}!`);
      setShowInviteModal(false);
      setInviteEmail('');
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeWorkspace) return;
    if (!confirm('Are you sure you want to remove this member from the workspace?')) return;
    try {
      await workspaceApi.removeMember(activeWorkspace._id, memberId);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to remove member');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Pending Workspace & Board Invitations Banner */}
        {(pendingWorkspaceInvites.length > 0 || pendingBoardInvites.length > 0) && (
          <div className="space-y-3">
            {/* Workspace Invites */}
            {pendingWorkspaceInvites.map((invite) => (
              <div
                key={invite._id}
                className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Workspace Invitation</h4>
                    <p className="text-xs text-slate-300">
                      You were invited to join <span className="font-semibold text-blue-400">{invite.workspaceId?.name || 'Workspace'}</span> as <span className="uppercase font-semibold text-indigo-300">{invite.role}</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleDeclineWorkspaceInvite(invite.token)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => handleAcceptWorkspaceInvite(invite.token)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all shadow-md shadow-blue-500/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Workspace Invite</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Board Invites */}
            {pendingBoardInvites.map((invite) => (
              <div
                key={invite._id}
                className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Board Invitation</h4>
                    <p className="text-xs text-slate-300">
                      You were invited to collaborate on board <span className="font-semibold text-emerald-400">{invite.boardId?.title || 'Board'}</span> as <span className="uppercase font-semibold text-teal-300">{invite.role}</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleDeclineBoardInvite(invite.token)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => handleAcceptBoardInvite(invite.token)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all shadow-md shadow-emerald-500/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Board Invite</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {activeWorkspace ? activeWorkspace.name : 'Dashboard'}
              </h1>
              {activeWorkspace && (
                <button
                  onClick={() => setShowMembersModal(true)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full text-xs font-semibold text-slate-300 flex items-center space-x-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>{activeWorkspace.members?.length || 1} Members</span>
                </button>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Collaborative whiteboard workspaces & meeting notes
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all"
            >
              <UserPlus className="w-4 h-4 text-blue-400" />
              <span>Invite Workspace Members</span>
            </button> */}

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
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 border transition-all ${starredOnly
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
            <h3 className="text-lg font-semibold text-slate-300">No boards accessible</h3>
            <p className="text-sm text-slate-500 mt-1">Create a new board or ask a colleague to invite you to a board!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boards.map((board) => {
              const currentUserId = currentUser ? (currentUser.id || (currentUser as any)._id) : null;
              const boardOwnerId = typeof board.ownerId === 'object' ? (board.ownerId as any)._id || (board.ownerId as any).id : board.ownerId;
              const isOwner = Boolean(currentUserId && boardOwnerId && currentUserId.toString() === boardOwnerId.toString());

              const userMemberRecord = board.members?.find((m) => {
                const memberUserId = typeof m.userId === 'object' ? (m.userId as any)._id || (m.userId as any).id : m.userId;
                return currentUserId && memberUserId && memberUserId.toString() === currentUserId.toString();
              });

              const userRole = isOwner ? 'Owner' : userMemberRecord?.role || 'editor';

              return (
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

                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full uppercase flex items-center space-x-1 ${userRole === 'Owner'
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                        : userRole === 'editor'
                          ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                        {userRole === 'editor' && <Edit3 className="w-3 h-3" />}
                        {userRole === 'viewer' && <Eye className="w-3 h-3" />}
                        <span>{userRole === 'Owner' ? 'Owner' : userRole === 'editor' ? 'Editor' : 'Read Only'}</span>
                      </span>

                      {/* Direct Invite to Board Button */}
                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setManagingBoardId(board._id);
                          }}
                          className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all"
                          title="Invite users to this specific board"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Invite to Board</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-6 pt-3 border-t border-slate-800/60">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last opened {new Date(board.lastOpenedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
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

              <div className="flex justify-end space-x-3 pt-2">
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
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Workspace Member Modal */}
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
                placeholder="ketan@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Permission Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="editor">Editor (Draw, Edit Notes & Boards)</option>
                  <option value="viewer">Viewer (Read Only)</option>
                  <option value="owner">Owner (Full Workspace Admin)</option>
                </select>
              </div>
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
                  disabled={inviting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm"
                >
                  {inviting ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace Members Modal */}
      {showMembersModal && activeWorkspace && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Workspace Members ({activeWorkspace.name})</span>
              </h3>
              <button onClick={() => setShowMembersModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3">
              {activeWorkspace.members?.map((member: WorkspaceMember) => {
                const isUserObj = typeof member.userId === 'object';
                const name = isUserObj ? member.userId?.name || 'User' : 'User';
                const email = isUserObj ? member.userId?.email || '' : '';
                const memberId = isUserObj ? member.userId?._id : (member.userId as unknown as string);

                return (
                  <div
                    key={memberId}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center text-xs">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{name}</p>
                        <p className="text-xs text-slate-500">{email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 bg-slate-800 rounded-full text-xs font-semibold uppercase text-blue-400 border border-slate-700">
                        {member.role}
                      </span>
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(memberId)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Per-Board Invitation & Access Modal */}
      {managingBoardId && (
        <InviteBoardModal
          boardId={managingBoardId}
          onClose={() => {
            setManagingBoardId(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
