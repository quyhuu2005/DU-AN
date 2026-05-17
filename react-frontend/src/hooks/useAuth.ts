import { authService } from '../services/authService';
import type { AuthUser, Role } from '../types';

export function useAuth() {
  const user: AuthUser | null = authService.getMe();
  const isLoggedIn = !!user;

  function hasRole(...roles: Role[]): boolean {
    return !!user && roles.includes(user.role);
  }

  function logout() {
    authService.logout();
    window.location.href = '/login';
  }

  return { user, isLoggedIn, hasRole, logout };
}
