import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ConfirmDialog from '../components/base/ConfirmDialog';
import { ROUTES } from '../constants';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.DASHBOARD,  icon: 'dashboard',        label: 'Tổng quan' },
  { to: ROUTES.BRANCHES,   icon: 'storefront',       label: 'Quản lý Chi nhánh', roles: ['BOSS'] },
  { to: ROUTES.CATEGORIES, icon: 'category',         label: 'Danh mục',          roles: ['BOSS'] },
  { to: ROUTES.MENU,       icon: 'restaurant_menu',  label: 'Thực đơn gốc',      roles: ['BOSS'] },
  { to: ROUTES.EMPLOYEES,  icon: 'groups',           label: 'Quản lý Nhân sự',   roles: ['BOSS', 'MANAGER'] },
  { to: ROUTES.BRANCH_MENU,icon: 'menu_book',        label: 'Thực đơn chi nhánh',roles: ['BOSS', 'MANAGER'] },
  { to: ROUTES.TABLE_SETUP,icon: 'table_restaurant', label: 'Sơ đồ bàn',         roles: ['BOSS', 'MANAGER'] },
];

export default function AdminLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole(r as 'BOSS' | 'MANAGER' | 'STAFF'))
  );

  const initials = (user?.fullName || 'User').split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();

  const handleLogoutConfirm = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* ── Sidebar ── */}
      <aside
        className="fixed inset-y-0 left-0 w-60 flex flex-col z-20 border-r"
        style={{ background: 'var(--color-sidebar)', borderColor: 'var(--color-border)' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'var(--color-primary)' }}
            >P</div>
            <span className="font-extrabold text-lg" style={{ color: 'var(--color-text-primary)' }}>ProPOS</span>
          </div>
          <p className="text-xs mt-0.5 ml-10" style={{ color: 'var(--color-text-secondary)' }}>
            {user?.role === 'BOSS' ? 'Admin Panel' : 'Manager Panel'}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >{initials}</div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {user?.fullName ?? 'Người dùng'}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{user?.role}</p>
              </div>
              <span className="material-symbols-outlined text-base" style={{ color: 'var(--color-text-secondary)' }}>
                expand_more
              </span>
            </button>

            {showUserMenu && (
              <div
                className="absolute bottom-full left-0 right-0 mb-1 rounded-xl shadow-lg border py-1 z-50"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <button
                  onClick={() => { setShowUserMenu(false); setShowLogout(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-50 transition-colors"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-6 h-14 border-b"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="material-symbols-outlined text-base">home</span>
            <span>ProPOS</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="btn-icon">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Logout confirm */}
      {showLogout && (
        <ConfirmDialog
          message="Bạn có chắc chắn muốn đăng xuất?"
          description="Phiên làm việc hiện tại sẽ bị xóa."
          confirmText="Đăng xuất"
          cancelText="Hủy"
          variant="warning"
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  );
}
