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
public class BranchRevenueDTO {
    private Long branchId;
    private String branchName;
    private BigDecimal revenue;
    private Long orders;
    private double percentage;
}
