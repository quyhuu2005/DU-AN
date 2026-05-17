import { http } from './http';
import type { ApiResponse, PaginatedResponse } from '../types';

export interface BranchMenu {
  id: number;
  branchId: number;
  productId: number;
  productName: string;
  categoryName: string;
  imageUrl?: string;
  basePrice: number;
  localPrice: number;
  isAvailable: boolean;
  status: string;
}

export const branchMenuService = {
  getAll: (branchId: number, page = 0, size = 10, search = '', categoryId = '') => {
    const params = new URLSearchParams({
      branchId: branchId.toString(),
      page: page.toString(),
      size: size.toString(),
      search,
      ...(categoryId ? { categoryId } : {})
    });
    return http.get<PaginatedResponse<BranchMenu>>(`/branch-menus?${params.toString()}`);
  },

  updatePrice: (id: number, localPrice: number) =>
    http.patch<ApiResponse<BranchMenu>>(`/branch-menus/${id}/price`, { localPrice }),

  toggleStatus: (id: number, isAvailable: boolean) =>
    http.patch<ApiResponse<BranchMenu>>(`/branch-menus/${id}/toggle`, { isAvailable }),
};
