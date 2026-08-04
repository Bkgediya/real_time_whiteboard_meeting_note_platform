import { axiosClient } from './axiosClient';

export interface BoardMember {
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: 'editor' | 'viewer';
}

export interface Board {
  _id: string;
  title: string;
  workspaceId: string;
  ownerId: string | { _id: string; name: string; email: string };
  isPrivate?: boolean;
  members?: BoardMember[];
  isStarred: boolean;
  lastOpenedAt: string;
  snapshot: {
    elements: any[];
  };
  shareToken?: string;
  shareExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardDetailResponse {
  board: Board;
  note: string;
  isReadOnly?: boolean;
}

export interface BoardInvitation {
  _id: string;
  boardId: { _id: string; title: string; ownerId?: { name?: string; email?: string } };
  email: string;
  role: 'editor' | 'viewer';
  token: string;
  expiresAt: string;
}

export const boardApi = {
  getWorkspaceBoards: async (workspaceId: string, search?: string, starred?: boolean): Promise<Board[]> => {
    const { data } = await axiosClient.get(`/boards/workspace/${workspaceId}`, {
      params: { search, starred },
    });
    return data;
  },

  getBoardById: async (boardId: string): Promise<BoardDetailResponse> => {
    const { data } = await axiosClient.get(`/boards/${boardId}`);
    return data;
  },

  createBoard: async (workspaceId: string, title: string): Promise<Board> => {
    const { data } = await axiosClient.post('/boards', { workspaceId, title });
    return data;
  },

  inviteToBoard: async (boardId: string, email: string, role: 'editor' | 'viewer') => {
    const { data } = await axiosClient.post(`/boards/${boardId}/invite`, { email, role });
    return data;
  },

  getPendingBoardInvitations: async (): Promise<BoardInvitation[]> => {
    const { data } = await axiosClient.get('/boards/invitations/pending');
    return data;
  },

  acceptBoardInvitation: async (token: string): Promise<Board> => {
    const { data } = await axiosClient.post(`/boards/accept-invite/${token}`);
    return data;
  },

  declineBoardInvitation: async (token: string): Promise<void> => {
    await axiosClient.post(`/boards/decline-invite/${token}`);
  },

  removeBoardMember: async (boardId: string, memberId: string): Promise<Board> => {
    const { data } = await axiosClient.delete(`/boards/${boardId}/members/${memberId}`);
    return data;
  },

  updateSnapshot: async (boardId: string, snapshot: any): Promise<Board> => {
    const { data } = await axiosClient.put(`/boards/${boardId}/snapshot`, { snapshot });
    return data;
  },

  toggleStar: async (boardId: string): Promise<Board> => {
    const { data } = await axiosClient.put(`/boards/${boardId}/star`);
    return data;
  },

  deleteBoard: async (boardId: string): Promise<{ message: string }> => {
    const { data } = await axiosClient.delete(`/boards/${boardId}`);
    return data;
  },

  generateShareLink: async (boardId: string, expiresInDays: number = 7) => {
    const { data } = await axiosClient.post(`/boards/${boardId}/share-link`, { expiresInDays });
    return data;
  },

  getPublicBoard: async (shareToken: string): Promise<BoardDetailResponse> => {
    const { data } = await axiosClient.get(`/boards/public/${shareToken}`);
    return data;
  },

  getHistory: async (boardId: string) => {
    const { data } = await axiosClient.get(`/versions/${boardId}/history`);
    return data;
  },

  restoreSnapshot: async (boardId: string, versionId: string) => {
    const { data } = await axiosClient.post(`/versions/${boardId}/restore/${versionId}`);
    return data;
  },
};
