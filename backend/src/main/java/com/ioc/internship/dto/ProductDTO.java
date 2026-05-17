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
public class ProductDTO {
    private Long id;
    private String name;
    private Long categoryId;
    private String categoryName;
    private BigDecimal basePrice;
    private String description;
    private String imageUrl;
    private boolean hasOrders;
}
