import { http } from './http';
import type { Branch, BranchFormData, ApiResponse, PaginatedResponse } from '../types';

export const branchService = {
  getAll: (page = 0, size = 10, search = '', status = '') =>
    http.get<PaginatedResponse<Branch>>(
      `/branches?page=${page}&size=${size}&search=${search}&status=${status}`
    ),

  create: (data: BranchFormData) =>
    http.post<ApiResponse<Branch>>('/branches', data),

  update: (id: number, data: BranchFormData) =>
    http.put<ApiResponse<Branch>>(`/branches/${id}`, data),

  deactivate: (id: number) =>
    http.patch<ApiResponse<Branch>>(`/branches/${id}/deactivate`),

  activate: (id: number) =>
    http.patch<ApiResponse<Branch>>(`/branches/${id}/activate`),
};
