package com.ioc.internship.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "table_id")
    private Long tableId;

    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "reservation_id")
    private Long reservationId; // linked reservation if order was opened from a RESERVED table

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Column(nullable = false)
    private String status; // PENDING, COOKING, SERVED, PAID, CANCELLED

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
        if (totalPrice == null) totalPrice = BigDecimal.ZERO;
    }
}
