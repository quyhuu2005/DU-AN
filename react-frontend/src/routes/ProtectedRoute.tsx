import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

/** Bảo vệ route: nếu chưa đăng nhập → /login. Nếu sai role → /admin */
export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isLoggedIn, hasRole } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (allowedRoles && !hasRole(...allowedRoles)) return <Navigate to="/admin/dashboard" replace />;

  return <>{children}</>;
}
