package com.ioc.internship.service;

import com.ioc.internship.dto.BranchRevenueDTO;
import com.ioc.internship.dto.RevenueReportDTO;

import java.util.List;

public interface ReportService {
    /** US-8.1: Manager xem báo cáo doanh thu chi nhánh theo ngày/tuần/tháng/năm */
    RevenueReportDTO getBranchRevenue(Long branchId, String period);

    /** US-8.2: Boss xem tổng hợp doanh thu theo từng chi nhánh trong năm */
    List<BranchRevenueDTO> getSystemRevenueByBranch(String period);
}
