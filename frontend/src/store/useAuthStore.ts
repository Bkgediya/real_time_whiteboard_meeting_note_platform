import { create } from 'zustand';
import { User } from '../api/authApi';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setTokens: (accessToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const SAVED_TOKEN = localStorage.getItem('accessToken');

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: SAVED_TOKEN,
  isAuthenticated: !!SAVED_TOKEN,

  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  setTokens: (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    set({ accessToken, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
