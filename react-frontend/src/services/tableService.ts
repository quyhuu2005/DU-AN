import { http } from './http';
import type { ApiResponse } from '../types';

export interface DiningTable {
  id: number;
  branchId: number;
  name: string;
  zone?: string;
  capacity: number;
  status: string; // EMPTY, OCCUPIED, RESERVED
}

export interface DiningTableFormData {
  branchId: number;
  name: string;
  zone?: string;
  capacity: number;
}

export const tableService = {
  getAll: (branchId: number) =>
    http.get<ApiResponse<DiningTable[]>>(`/dining-tables?branchId=${branchId}`),

  create: (data: DiningTableFormData) =>
    http.post<ApiResponse<DiningTable>>('/dining-tables', data),

  update: (id: number, data: DiningTableFormData) =>
    http.put<ApiResponse<DiningTable>>(`/dining-tables/${id}`, data),

  delete: (id: number) =>
    http.delete<ApiResponse<null>>(`/dining-tables/${id}`),
};
