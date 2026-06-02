package com.ioc.internship.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReservationRequest {
    @NotNull(message = "Branch ID is required")
    private Long branchId;
    
    private Long tableId; // Can be null if not assigned yet
    
    @NotBlank(message = "Customer name is required")
    private String customerName;
    
    @NotBlank(message = "Customer phone is required")
    private String customerPhone;
    
    @NotNull(message = "Party size is required")
    private Integer partySize;
    
    @NotNull(message = "Reserved time is required")
    private LocalDateTime reservedAt;
    
    private Integer durationMinutes = 90;
    
    private String note;
}
