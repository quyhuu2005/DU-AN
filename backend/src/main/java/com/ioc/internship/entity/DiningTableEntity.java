package com.ioc.internship.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dining_tables")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiningTableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 50)
    private String zone;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(length = 20)
    private String status = "EMPTY"; // EMPTY, OCCUPIED, RESERVED
}
