package com.ioc.internship.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_recipes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRecipeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "ingredient_name", nullable = false)
    private String ingredientName;

    @Column(name = "quantity_required", nullable = false)
    private Double quantityRequired;

    @Column(nullable = false)
    private String unit;
}
