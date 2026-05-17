// ── Auth ──────────────────────────────────────────────
export type Role = 'BOSS' | 'MANAGER' | 'STAFF';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  branchId?: number;
  token: string;
}

// ── Branch ────────────────────────────────────────────
export type BranchStatus = 'ACTIVE' | 'INACTIVE';

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: BranchStatus;
  createdAt?: string;
}

export interface BranchFormData {
  name: string;
  address: string;
  phone: string;
}

// ── Category ──────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  itemCount: number;
}

export interface CategoryFormData {
  name: string;
}

// ── Menu Item (Master) ────────────────────────────────
export interface MenuItem {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  basePrice: number;
  description: string;
  imageUrl?: string;
  hasOrders: boolean;  // nếu true → không được xóa
}

export interface MenuItemFormData {
  name: string;
  categoryId: number;
  basePrice: number;
  description: string;
  imageFile?: File;
}

// ── API Response wrapper ──────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
