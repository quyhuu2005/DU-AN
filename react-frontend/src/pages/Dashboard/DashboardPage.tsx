import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { branchService } from '../../services/branchService';
import { categoryService } from '../../services/categoryService';
import { menuService } from '../../services/menuService';
import { employeeService } from '../../services/employeeService';
import { tableService } from '../../services/tableService';
import { branchMenuService } from '../../services/branchMenuService';
import { orderService } from '../../services/orderService';

export default function DashboardPage() {
  const { user } = useAuth();
  const isBoss = user?.role === 'BOSS';

  const [counts, setCounts] = useState({
    branches: '—',
    masterMenu: '—',
    categories: '—',
    employees: '—',
    branchMenu: '—',
    tables: '—',
    branchEmployees: '—',
    activeOrders: '—'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isBoss) {
          const [br, cat, prod, emp] = await Promise.all([
            branchService.getAll(0, 1),
            categoryService.getAll(),
            menuService.getAll(0, 1),
            employeeService.getAll(0, 1)
          ]);
          setCounts(prev => ({
            ...prev,
            branches: br.totalElements.toString(),
            categories: cat.data.length.toString(),
            masterMenu: prod.totalElements.toString(),
            employees: emp.totalElements.toString()
          }));
        } else if (user?.branchId) {
          const [bm, tb, be, ao] = await Promise.all([
            branchMenuService.getAll(user.branchId, 0, 1),
            tableService.getAll(user.branchId),
            employeeService.getAll(0, 1, '', '', user.branchId.toString()),
            orderService.getActiveOrdersByBranch(user.branchId)
          ]);
          setCounts(prev => ({
            ...prev,
            branchMenu: bm.totalElements.toString(),
            tables: tb.data.length.toString(),
            branchEmployees: be.totalElements.toString(),
            activeOrders: ao.data.length.toString()
          }));
        }
      } catch (e) {
        console.error('Failed to fetch dashboard stats', e);
      }
    };
    fetchStats();
  }, [isBoss, user?.branchId]);

  const bossStats = [
    { icon: 'storefront',       label: 'Chi nhánh hoạt động', value: counts.branches, color: '#F97316' },
    { icon: 'restaurant_menu',  label: 'Món ăn trong menu gốc', value: counts.masterMenu, color: '#3B82F6' },
    { icon: 'category',         label: 'Danh mục',            value: counts.categories, color: '#8B5CF6' },
    { icon: 'people',           label: 'Nhân viên toàn chuỗi',value: counts.employees, color: '#10B981' },
  ];

  const managerStats = [
    { icon: 'menu_book',        label: 'Món ăn chi nhánh',    value: counts.branchMenu, color: '#F97316' },
    { icon: 'table_restaurant', label: 'Bàn phục vụ',         value: counts.tables, color: '#3B82F6' },
    { icon: 'groups',           label: 'Nhân viên chi nhánh', value: counts.branchEmployees, color: '#8B5CF6' },
    { icon: 'receipt_long',     label: 'Đơn đang phục vụ',    value: counts.activeOrders, color: '#10B981' },
  ];

  const stats = isBoss ? bossStats : managerStats;

  const bossActions = [
    { icon: 'storefront',      label: 'Quản lý Chi nhánh',  href: '/admin/branches' },
    { icon: 'category',        label: 'Quản lý Danh mục',   href: '/admin/categories' },
    { icon: 'restaurant_menu', label: 'Thực đơn gốc',       href: '/admin/menu' },
    { icon: 'groups',          label: 'Quản lý Nhân sự',    href: '/admin/employees' },
  ];

  const managerActions = [
    { icon: 'menu_book',        label: 'Thực đơn chi nhánh', href: '/admin/branch-menu' },
    { icon: 'table_restaurant', label: 'Sơ đồ bàn',          href: '/admin/table-setup' },
    { icon: 'groups',           label: 'Nhân sự chi nhánh',  href: '/admin/employees' },
    { icon: 'bar_chart',        label: 'Báo cáo doanh thu',  href: '/admin/report/branch' },
  ];

  const actions = isBoss ? bossActions : managerActions;

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Tổng quan {isBoss ? 'Hệ thống' : 'Chi nhánh'}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Chào mừng, <strong>{user?.fullName ?? 'Quản trị viên'}</strong>! {isBoss ? 'Đây là bảng điều khiển toàn hệ thống.' : `Bạn đang quản lý Chi nhánh ${user?.branchId || ''}.`}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.color + '18' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="text-base font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <span className="material-symbols-outlined text-primary">bolt</span>
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {actions.map((a) => (
            <a key={a.label} href={a.href}
              className="flex flex-col items-start gap-3 p-5 rounded-2xl border hover:border-primary/50 hover:bg-primary/[0.02] hover:shadow-sm transition-all group"
              style={{ borderColor: 'var(--color-border)', textDecoration: 'none', color: 'var(--color-text-primary)' }}>
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-[24px]" style={{ color: 'var(--color-primary)' }}>{a.icon}</span>
              </div>
              <span className="text-sm font-semibold">{a.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
