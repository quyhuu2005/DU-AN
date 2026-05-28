package com.ioc.internship.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportDTO {
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private List<DataPoint> chartData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataPoint {
        private String label;   // "Ngày 01", "Tuần 1", "Tháng 1"...
        private BigDecimal revenue;
        private Long orders;
    }
}
