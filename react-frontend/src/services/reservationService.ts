import { http } from './http';
import type { ApiResponse } from '../types';
import type { DiningTable } from './tableService';

export interface Reservation {
  id: number;
  branchId: number;
  tableId: number | null;
  tableName: string | null;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservedAt: string;
  durationMinutes: number;
  status: string; // PENDING, CONFIRMED, SEATED, CANCELLED, NO_SHOW
  note: string;
  createdBy: number;
  createdAt: string;
}

export interface ReservationRequest {
  branchId: number;
  tableId?: number | null;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservedAt: string; // ISO 8601 string
  durationMinutes?: number;
  note?: string;
}

export const reservationService = {
  create: (data: ReservationRequest) =>
    http.post<ApiResponse<Reservation>>('/admin/reservations', data),

  update: (id: number, data: ReservationRequest) =>
    http.put<ApiResponse<Reservation>>(`/admin/reservations/${id}`, data),

  getByDate: (branchId: number, date: string) =>
    http.get<ApiResponse<Reservation[]>>(`/admin/reservations?branchId=${branchId}&date=${date}`),

  updateStatus: (id: number, status: string) =>
    http.patch<ApiResponse<Reservation>>(`/admin/reservations/${id}/status?status=${status}`, {}),

  assignTable: (id: number, tableId: number) =>
    http.patch<ApiResponse<Reservation>>(`/admin/reservations/${id}/table?tableId=${tableId}`, {}),

  getAvailableTables: (branchId: number, startTime: string, durationMinutes: number, partySize: number, excludeReservationId?: number) => {
    let url = `/admin/reservations/available-tables?branchId=${branchId}&startTime=${startTime}&durationMinutes=${durationMinutes}&partySize=${partySize}`;
    if (excludeReservationId) {
      url += `&excludeReservationId=${excludeReservationId}`;
    }
    return http.get<ApiResponse<DiningTable[]>>(url);
  },
};
