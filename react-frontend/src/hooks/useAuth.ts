import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { AuthUser, Role } from '../types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(authService.getMe());

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(authService.getMe());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isLoggedIn = !!user;

  function hasRole(...roles: Role[]): boolean {
    return !!user && roles.includes(user.role);
  }

  function logout() {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  }

  return { user, isLoggedIn, hasRole, logout };
}
