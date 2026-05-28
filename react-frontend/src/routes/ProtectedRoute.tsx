import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

/** Bảo vệ route: nếu chưa đăng nhập → /login. Nếu sai role → trang phù hợp */
export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isLoggedIn, hasRole, user } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (allowedRoles && !hasRole(...allowedRoles)) {
    // Chef goes to KDS, others go to admin dashboard
    const fallback = user?.role === 'CHEF' ? '/kds' : '/admin/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

