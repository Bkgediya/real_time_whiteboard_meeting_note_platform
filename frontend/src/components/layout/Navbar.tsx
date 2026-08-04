import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { authApi } from '../../api/authApi';
import { LogOut, Sparkles, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, setUser, logout } = useAuthStore();
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      authApi
        .getCurrentUser()
        .then((userData) => setUser(userData))
        .catch(() => { });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between text-white select-none z-30">
      {/* Brand & Workspace Picker */}
      <div className="flex items-center space-x-6">
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            CollabBoard
          </span>
        </div>

        {/* Workspace Dropdown */}
        {activeWorkspace && (
          <div className="relative">
            <select
              value={activeWorkspace._id}
              onChange={(e) => {
                const target = workspaces.find((w) => w._id === e.target.value);
                if (target) setActiveWorkspace(target);
              }}
              className="bg-slate-900 text-sm font-semibold border border-slate-700/80 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 text-slate-200 cursor-pointer shadow-sm"
            >
              {workspaces.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-full py-1 px-3 shadow-inner">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-200 leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{user.email}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <UserIcon className="w-4 h-4 animate-pulse" />
            <span>Loading profile...</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
