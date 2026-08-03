import { axiosClient } from './axiosClient';

export interface WorkspaceMember {
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: 'owner' | 'editor' | 'viewer';
}

export interface Workspace {
  _id: string;
  name: string;
  ownerId: string | { _id: string; name: string; email: string };
  members: WorkspaceMember[];
  createdAt: string;
  updatedAt: string;
}

export const workspaceApi = {
  getUserWorkspaces: async (): Promise<Workspace[]> => {
    const { data } = await axiosClient.get('/workspaces');
    return data;
  },

  getWorkspaceById: async (id: string): Promise<Workspace> => {
    const { data } = await axiosClient.get(`/workspaces/${id}`);
    return data;
  },

  createWorkspace: async (name: string): Promise<Workspace> => {
    const { data } = await axiosClient.post('/workspaces', { name });
    return data;
  },

  inviteMember: async (workspaceId: string, email: string, role: 'owner' | 'editor' | 'viewer') => {
    const { data } = await axiosClient.post(`/workspaces/${workspaceId}/invite`, { email, role });
    return data;
  },

  removeMember: async (workspaceId: string, memberId: string): Promise<Workspace> => {
    const { data } = await axiosClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
    return data;
  },
};
