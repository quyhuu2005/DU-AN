package com.ioc.internship.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDTO {
    private Long id;
    private Long branchId;
    private String name;
    private String unit;
    private Double quantity;
    private Double minStock;
    private String stockStatus; // SUFFICIENT, LOW, OUT_OF_STOCK
    private LocalDateTime expiryDate;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;
}
