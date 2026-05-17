package com.ioc.internship.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchMenuDTO {
    private Long id;
    private Long branchId;
    private Long productId;
    private String productName;
    private String categoryName;
    private String imageUrl;
    private BigDecimal basePrice;
    private BigDecimal localPrice;
    private Boolean isAvailable;
    private String status;
}
