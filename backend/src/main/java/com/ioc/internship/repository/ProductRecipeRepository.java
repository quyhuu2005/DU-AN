package com.ioc.internship.repository;

import com.ioc.internship.entity.ProductRecipeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRecipeRepository extends JpaRepository<ProductRecipeEntity, Long> {
    List<ProductRecipeEntity> findByProductId(Long productId);
}
