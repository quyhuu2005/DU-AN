export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8082/api';

export const ROUTES = {
  LOGIN:         '/login',
  ADMIN:         '/admin',
  DASHBOARD:     '/admin/dashboard',
  BRANCHES:      '/admin/branches',
  CATEGORIES:    '/admin/categories',
  MENU:          '/admin/menu',
  EMPLOYEES:     '/admin/employees',
  BRANCH_MENU:   '/admin/branch-menu',
  TABLE_SETUP:   '/admin/table-setup',
  REPORT_BRANCH: '/admin/report/branch',
  REPORT_SYSTEM: '/admin/report/system',
  ORDER_HISTORY: '/admin/order-history',
  INVENTORY:     '/admin/inventory',
  POS:           '/pos',
  KDS:           '/kds',
} as const;

export const BRANCH_STATUS = {
  ACTIVE:   'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export const ROLE = {
  BOSS:    'BOSS',
  MANAGER: 'MANAGER',
  STAFF:   'STAFF',
} as const;

export const PAGE_SIZE = 10;
