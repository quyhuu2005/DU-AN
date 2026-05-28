import { http } from './http';
import type { ApiResponse } from '../types';

export interface KdsItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  note: string;
  status: string; // PENDING, COOKING, READY, SERVED
  tableId: number;
  tableName: string;
  orderCreatedAt: string;
}

export const kdsService = {
  getKdsItems: (branchId: number) =>
    http.get<ApiResponse<KdsItem[]>>(`/orders/branch/${branchId}/kds`),

  updateItemStatus: (itemId: number, status: string) =>
    http.patch<ApiResponse<KdsItem>>(`/orders/items/${itemId}/status`, { status }),
};
