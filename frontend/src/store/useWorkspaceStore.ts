import { create } from 'zustand';
import { Workspace } from '../api/workspaceApi';

interface WorkspaceState {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  setActiveWorkspace: (workspace: Workspace) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: null,
  workspaces: [],

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setWorkspaces: (workspaces) => set({ workspaces }),
}));
