package com.ioc.internship.service.impl;

import com.ioc.internship.dto.BranchRevenueDTO;
import com.ioc.internship.entity.BranchEntity;
import com.ioc.internship.entity.OrderEntity;
import com.ioc.internship.repository.BranchRepository;
import com.ioc.internship.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ReportServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private BranchRepository branchRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testGetSystemRevenueByBranch() {
        BranchEntity branch1 = BranchEntity.builder().id(1L).name("Branch 1").build();
        when(branchRepository.findAll()).thenReturn(List.of(branch1));

        OrderEntity order1 = OrderEntity.builder()
                .id(1L)
                .branchId(1L)
                .totalPrice(new BigDecimal("100000"))
                .status("PAID")
                .createdAt(LocalDateTime.now())
                .build();

        when(orderRepository.findAllPaidOrdersByDateRange(any(), any())).thenReturn(List.of(order1));

        List<BranchRevenueDTO> result = reportService.getSystemRevenueByBranch("today");

        assertEquals(1, result.size());
        assertEquals(new BigDecimal("100000"), result.get(0).getRevenue());
        assertEquals(100.0, result.get(0).getPercentage());
    }
}
