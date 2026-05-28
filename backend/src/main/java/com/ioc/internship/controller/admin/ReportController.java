package com.ioc.internship.controller.admin;

import com.ioc.internship.dto.BranchRevenueDTO;
import com.ioc.internship.dto.RevenueReportDTO;
import com.ioc.internship.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * US-8.1: Manager xem doanh thu chi nhánh
     * GET /api/reports/branch/{branchId}/revenue?period=today|week|month|year
     */
    @GetMapping("/branch/{branchId}/revenue")
    @PreAuthorize("hasAnyAuthority('BOSS','MANAGER')")
    public ResponseEntity<?> getBranchRevenue(
            @PathVariable Long branchId,
            @RequestParam(defaultValue = "month") String period) {
        try {
            RevenueReportDTO report = reportService.getBranchRevenue(branchId, period);
            return ResponseEntity.ok(success(report, ""));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    /**
     * US-8.2: Boss xem tổng hợp toàn hệ thống
     * GET /api/reports/system/branches?period=year
     */
    @GetMapping("/system/branches")
    @PreAuthorize("hasAuthority('BOSS')")
    public ResponseEntity<?> getSystemRevenueByBranch(
            @RequestParam(defaultValue = "year") String period) {
        try {
            List<BranchRevenueDTO> data = reportService.getSystemRevenueByBranch(period);
            return ResponseEntity.ok(success(data, ""));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    private Map<String, Object> success(Object data, String message) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", data);
        res.put("message", message);
        return res;
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", false);
        res.put("message", message);
        return res;
    }
}
