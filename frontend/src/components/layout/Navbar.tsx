import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { LogOut, LayoutGrid, User, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();

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
              className="bg-slate-900 text-sm font-medium border border-slate-700/80 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 text-slate-200 cursor-pointer"
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

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-full py-1.5 px-3">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-300">{user.name}</span>
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
