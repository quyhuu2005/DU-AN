import { http } from './http';

export interface DataPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface RevenueReport {
  totalRevenue: number;
  totalOrders: number;
  chartData: DataPoint[];
}

export interface BranchRevenue {
  branchId: number;
  branchName: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export type ReportPeriod = 'today' | 'week' | 'month' | 'year';

export const reportService = {
  getBranchRevenue: (branchId: number, period: ReportPeriod) =>
    http.get<{ success: boolean; data: RevenueReport }>(
      `/reports/branch/${branchId}/revenue?period=${period}`
    ),

  getSystemRevenueByBranch: (period: ReportPeriod) =>
    http.get<{ success: boolean; data: BranchRevenue[] }>(
      `/reports/system/branches?period=${period}`
    ),
};
