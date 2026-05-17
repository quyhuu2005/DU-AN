import { http } from './http';
import type { AuthUser, LoginRequest } from '../types';

export const authService = {
  login: (data: LoginRequest) =>
    http.post<{ token: string; user: AuthUser }>('/auth/login', data),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: (): AuthUser | null => {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  saveSession: (token: string, user: AuthUser) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};
