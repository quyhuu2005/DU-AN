package com.ioc.internship.service.impl;

import com.ioc.internship.entity.BranchEntity;
import com.ioc.internship.entity.BranchMenuEntity;
import com.ioc.internship.entity.ProductEntity;
import com.ioc.internship.repository.BranchMenuRepository;
import com.ioc.internship.repository.BranchRepository;
import com.ioc.internship.repository.ProductRepository;
import com.ioc.internship.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BranchRepository branchRepository;
    private final BranchMenuRepository branchMenuRepository;

    @Override
    public List<ProductEntity> getAllProducts(String search, Long categoryId) {
        return productRepository.findAll();
    }

    @Override
    public ProductEntity getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Món ăn không tồn tại: " + id));
    }

    @Override
    public ProductEntity createProduct(ProductEntity product) {
        if (product.getStatus() == null || product.getStatus().isBlank()) {
            product.setStatus("ACTIVE");
        }
        ProductEntity savedProduct = productRepository.save(product);

        // Auto-assign this product to all branches
        List<BranchEntity> branches = branchRepository.findAll();
        for (BranchEntity branch : branches) {
            BranchMenuEntity bm = new BranchMenuEntity();
            bm.setBranchId(branch.getId());
            bm.setProductId(savedProduct.getId());
            bm.setLocalPrice(savedProduct.getBasePrice());
            bm.setIsAvailable(true);
            bm.setStatus("ACTIVE");
            branchMenuRepository.save(bm);
        }

        return savedProduct;
    }

    @Override
    public ProductEntity updateProduct(Long id, ProductEntity product) {
        ProductEntity existing = getProductById(id);
        existing.setName(product.getName());
        existing.setCategoryId(product.getCategoryId());
        existing.setBasePrice(product.getBasePrice());
        existing.setDescription(product.getDescription());
        if (product.getImageUrl() != null) {
            existing.setImageUrl(product.getImageUrl());
        }
        return productRepository.save(existing);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
