package com.ioc.internship.service.impl;

import com.ioc.internship.dto.BranchRevenueDTO;
import com.ioc.internship.dto.RevenueReportDTO;
import com.ioc.internship.entity.BranchEntity;
import com.ioc.internship.entity.OrderEntity;
import com.ioc.internship.repository.BranchRepository;
import com.ioc.internship.repository.OrderRepository;
import com.ioc.internship.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final BranchRepository branchRepository;

    @Override
    public RevenueReportDTO getBranchRevenue(Long branchId, String period) {
        LocalDateTime[] range = getDateRange(period);
        List<OrderEntity> orders = orderRepository.findPaidOrdersByBranchAndDateRange(branchId, range[0], range[1]);

        BigDecimal totalRevenue = orders.stream()
                .map(o -> o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<RevenueReportDTO.DataPoint> chartData = buildChartData(orders, period, range[0], range[1]);

        return RevenueReportDTO.builder()
                .totalRevenue(totalRevenue)
                .totalOrders((long) orders.size())
                .chartData(chartData)
                .build();
    }

    @Override
    public List<BranchRevenueDTO> getSystemRevenueByBranch(String period) {
        LocalDateTime[] range = getDateRange(period);
        List<OrderEntity> allOrders = orderRepository.findAllPaidOrdersByDateRange(range[0], range[1]);
        List<BranchEntity> branches = branchRepository.findAll();

        BigDecimal grandTotal = allOrders.stream()
                .map(o -> o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<Long, List<OrderEntity>> byBranch = allOrders.stream()
                .collect(Collectors.groupingBy(OrderEntity::getBranchId));

        return branches.stream().map(branch -> {
            List<OrderEntity> branchOrders = byBranch.getOrDefault(branch.getId(), List.of());
            BigDecimal revenue = branchOrders.stream()
                    .map(o -> o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double pct = grandTotal.compareTo(BigDecimal.ZERO) == 0 ? 0.0
                    : revenue.multiply(BigDecimal.valueOf(100))
                             .divide(grandTotal, 2, RoundingMode.HALF_UP)
                             .doubleValue();

            return BranchRevenueDTO.builder()
                    .branchId(branch.getId())
                    .branchName(branch.getName())
                    .revenue(revenue)
                    .orders((long) branchOrders.size())
                    .percentage(pct)
                    .build();
        }).sorted(Comparator.comparing(BranchRevenueDTO::getRevenue).reversed())
          .collect(Collectors.toList());
    }

    // ── helpers ──

    private LocalDateTime[] getDateRange(String period) {
        LocalDate today = LocalDate.now();
        return switch (period.toLowerCase()) {
            case "today" -> new LocalDateTime[]{
                    today.atStartOfDay(),
                    today.atTime(23, 59, 59)
            };
            case "week" -> new LocalDateTime[]{
                    today.minusDays(today.getDayOfWeek().getValue() - 1).atStartOfDay(),
                    today.atTime(23, 59, 59)
            };
            case "month" -> new LocalDateTime[]{
                    today.withDayOfMonth(1).atStartOfDay(),
                    today.atTime(23, 59, 59)
            };
            case "year" -> new LocalDateTime[]{
                    today.withDayOfYear(1).atStartOfDay(),
                    today.atTime(23, 59, 59)
            };
            default -> new LocalDateTime[]{
                    today.withDayOfMonth(1).atStartOfDay(),
                    today.atTime(23, 59, 59)
            };
        };
    }

    private List<RevenueReportDTO.DataPoint> buildChartData(
            List<OrderEntity> orders, String period,
            LocalDateTime from, LocalDateTime to) {

        return switch (period.toLowerCase()) {
            case "today" -> buildHourlyData(orders);
            case "week"  -> buildDailyData(orders, from, to);
            case "month" -> buildDailyData(orders, from, to);
            case "year"  -> buildMonthlyData(orders);
            default      -> buildDailyData(orders, from, to);
        };
    }

    private List<RevenueReportDTO.DataPoint> buildHourlyData(List<OrderEntity> orders) {
        Map<Integer, List<OrderEntity>> byHour = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().getHour()));

        List<RevenueReportDTO.DataPoint> result = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            List<OrderEntity> hourOrders = byHour.getOrDefault(h, List.of());
            BigDecimal rev = sumRevenue(hourOrders);
            result.add(RevenueReportDTO.DataPoint.builder()
                    .label(String.format("%02d:00", h))
                    .revenue(rev)
                    .orders((long) hourOrders.size())
                    .build());
        }
        return result;
    }

    private List<RevenueReportDTO.DataPoint> buildDailyData(
            List<OrderEntity> orders, LocalDateTime from, LocalDateTime to) {
        Map<LocalDate, List<OrderEntity>> byDay = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().toLocalDate()));

        List<RevenueReportDTO.DataPoint> result = new ArrayList<>();
        LocalDate cur = from.toLocalDate();
        LocalDate end = to.toLocalDate();
        while (!cur.isAfter(end)) {
            List<OrderEntity> dayOrders = byDay.getOrDefault(cur, List.of());
            result.add(RevenueReportDTO.DataPoint.builder()
                    .label("Ngày " + cur.getDayOfMonth())
                    .revenue(sumRevenue(dayOrders))
                    .orders((long) dayOrders.size())
                    .build());
            cur = cur.plusDays(1);
        }
        return result;
    }

    private List<RevenueReportDTO.DataPoint> buildMonthlyData(List<OrderEntity> orders) {
        Map<Integer, List<OrderEntity>> byMonth = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().getMonthValue()));

        List<RevenueReportDTO.DataPoint> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            List<OrderEntity> mOrders = byMonth.getOrDefault(m, List.of());
            result.add(RevenueReportDTO.DataPoint.builder()
                    .label("Tháng " + m)
                    .revenue(sumRevenue(mOrders))
                    .orders((long) mOrders.size())
                    .build());
        }
        return result;
    }

    private BigDecimal sumRevenue(List<OrderEntity> orders) {
        return orders.stream()
                .map(o -> o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
