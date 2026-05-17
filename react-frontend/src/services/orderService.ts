import { http } from './http';
import type { ApiResponse } from '../types';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  note: string;
  status: string;
}

export interface Order {
  id: number;
  branchId: number;
  tableId: number;
  tableName: string;
  staffId: number;
  staffName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export const orderService = {
  createOrder: (branchId: number, tableId: number, staffId: number) =>
    http.post<ApiResponse<Order>>(`/orders/branch/${branchId}/table/${tableId}/staff/${staffId}`, {}),
    
  getActiveOrderByTable: (tableId: number) =>
    http.get<ApiResponse<Order | null>>(`/orders/table/${tableId}/active`),
    
  getActiveOrdersByBranch: (branchId: number) =>
    http.get<ApiResponse<Order[]>>(`/orders/branch/${branchId}/active`),
    
  addItem: (orderId: number, productId: number, quantity: number, note?: string) =>
    http.post<ApiResponse<Order>>(`/orders/${orderId}/items`, { productId, quantity, note }),
    
  updateItemQuantity: (itemId: number, quantity: number) =>
    http.patch<ApiResponse<Order>>(`/orders/items/${itemId}/quantity`, { quantity }),
    
  removeItem: (itemId: number) =>
    http.delete<ApiResponse<Order>>(`/orders/items/${itemId}`),
    
  checkout: (orderId: number) =>
    http.post<ApiResponse<Order>>(`/orders/${orderId}/checkout`, {}),
};
