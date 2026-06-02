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
public class ReservationDto {
    private Long id;
    private Long branchId;
    private Long tableId;
    private String tableName;
    private String customerName;
    private String customerPhone;
    private Integer partySize;
    private LocalDateTime reservedAt;
    private Integer durationMinutes;
    private String status;
    private String note;
    private Long createdBy;
    private LocalDateTime createdAt;
}
