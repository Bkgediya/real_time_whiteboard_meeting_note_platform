import { axiosClient } from './axiosClient';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  defaultWorkspaceId?: string;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const { data } = await axiosClient.post('/auth/login', credentials);
    return data;
  },

  register: async (userData: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    const { data } = await axiosClient.post('/auth/register', userData);
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await axiosClient.get('/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const { data } = await axiosClient.get(`/auth/verify-email/${token}`);
    return data;
  },
};
