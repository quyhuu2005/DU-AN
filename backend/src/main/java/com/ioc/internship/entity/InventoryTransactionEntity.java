package com.ioc.internship.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inventory_item_id", nullable = false)
    private Long inventoryItemId;

    @Column(nullable = false)
    private String type; // IMPORT, EXPORT

    @Column(nullable = false)
    private Double quantity;

    private String reason; // Tiêu thụ hàng ngày, Hàng hỏng, Điều chỉnh, Khác

    private String note;

    @Column(name = "performed_by")
    private Long performedBy; // user ID

    @Column(name = "performed_by_name")
    private String performedByName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
