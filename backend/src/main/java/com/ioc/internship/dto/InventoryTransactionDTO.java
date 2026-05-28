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
public class InventoryTransactionDTO {
    private Long id;
    private Long inventoryItemId;
    private String type; // IMPORT, EXPORT
    private Double quantity;
    private String reason;
    private String note;
    private Long performedBy;
    private String performedByName;
    private LocalDateTime createdAt;
}
