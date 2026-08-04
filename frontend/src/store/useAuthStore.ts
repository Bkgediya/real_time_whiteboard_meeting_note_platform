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
const SAVED_USER = localStorage.getItem('user');

let parsedUser: User | null = null;
try {
  if (SAVED_USER) {
    parsedUser = JSON.parse(SAVED_USER);
  }
} catch (e) {
  parsedUser = null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: parsedUser,
  accessToken: SAVED_TOKEN,
  isAuthenticated: !!SAVED_TOKEN,

  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },

  setTokens: (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    set({ accessToken, isAuthenticated: true });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
