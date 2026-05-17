import { http } from './http';
import type { ApiResponse, PaginatedResponse } from '../types';

export interface Employee {
  id: number;
  username: string;
  fullName: string;
  role: string;
  branchId?: number;
  branchName?: string;
  status: string;
}

export interface EmployeeFormData {
  username: string;
  password?: string;
  fullName: string;
  role: string;
  branch_id?: number;
}

export const employeeService = {
  getAll: (page = 0, size = 10, search = '', role = '', branchId = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      search,
      role,
      ...(branchId ? { branchId } : {})
    });
    return http.get<PaginatedResponse<Employee>>(`/users?${params.toString()}`);
  },

  create: (data: EmployeeFormData) =>
    http.post<ApiResponse<Employee>>('/users', data),

  update: (id: number, data: EmployeeFormData) =>
    http.put<ApiResponse<Employee>>(`/users/${id}`, data),

  deactivate: (id: number) =>
    http.patch<ApiResponse<null>>(`/users/${id}/deactivate`),

  activate: (id: number) =>
    http.patch<ApiResponse<null>>(`/users/${id}/activate`),
};
