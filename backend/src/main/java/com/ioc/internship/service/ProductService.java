package com.ioc.internship.service;

import com.ioc.internship.entity.ProductEntity;
import java.util.List;

public interface ProductService {
    List<ProductEntity> getAllProducts(String search, Long categoryId);
    ProductEntity getProductById(Long id);
    ProductEntity createProduct(ProductEntity product);
    ProductEntity updateProduct(Long id, ProductEntity product);
    void deleteProduct(Long id);
}
