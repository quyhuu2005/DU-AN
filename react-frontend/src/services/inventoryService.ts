import { http } from './http';
import type { ApiResponse } from '../types';

export interface InventoryItem {
  id: number;
  branchId: number;
  name: string;
  unit: string;
  quantity: number;
  minStock: number;
  stockStatus: 'SUFFICIENT' | 'LOW' | 'OUT_OF_STOCK';
  expiryDate?: string;
  updatedAt: string;
  createdAt: string;
}

export interface InventoryTransaction {
  id: number;
  inventoryItemId: number;
  type: 'IMPORT' | 'EXPORT';
  quantity: number;
  reason?: string;
  note?: string;
  performedBy: number;
  performedByName: string;
  createdAt: string;
}

export const inventoryService = {
  getAll: (branchId: number, search = '') =>
    http.get<ApiResponse<InventoryItem[]>>(
      `/inventory/branch/${branchId}?search=${encodeURIComponent(search)}`
    ),

  create: (branchId: number, data: { name: string; unit: string; quantity: number; minStock: number; expiryDate?: string }) =>
    http.post<ApiResponse<InventoryItem>>(`/inventory/branch/${branchId}`, data),

  update: (id: number, data: { name: string; unit: string; minStock: number; expiryDate?: string }) =>
    http.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, data),

  delete: (id: number) =>
    http.delete<ApiResponse<null>>(`/inventory/${id}`),

  importStock: (id: number, data: { quantity: number; note?: string; performedBy: number; performedByName: string }) =>
    http.post<ApiResponse<InventoryItem>>(`/inventory/${id}/import`, data),

  exportStock: (id: number, data: { quantity: number; reason: string; note?: string; performedBy: number; performedByName: string }) =>
    http.post<ApiResponse<InventoryItem>>(`/inventory/${id}/export`, data),

  getTransactions: (id: number) =>
    http.get<ApiResponse<InventoryTransaction[]>>(`/inventory/${id}/transactions`),
};
