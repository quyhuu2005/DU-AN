package com.ioc.internship.service.impl;

import com.ioc.internship.entity.CategoryEntity;
import com.ioc.internship.repository.CategoryRepository;
import com.ioc.internship.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryEntity> getAllCategories(String search, String status) {
        return categoryRepository.findAll();
    }

    @Override
    public CategoryEntity getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại: " + id));
    }

    @Override
    public CategoryEntity createCategory(CategoryEntity category) {
        if (category.getStatus() == null || category.getStatus().isBlank()) {
            category.setStatus("ACTIVE");
        }
        return categoryRepository.save(category);
    }

    @Override
    public CategoryEntity updateCategory(Long id, CategoryEntity category) {
        CategoryEntity existing = getCategoryById(id);
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        return categoryRepository.save(existing);
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public void deactivateCategory(Long id) {
        CategoryEntity existing = getCategoryById(id);
        existing.setStatus("INACTIVE");
        categoryRepository.save(existing);
    }

    @Override
    public void activateCategory(Long id) {
        CategoryEntity existing = getCategoryById(id);
        existing.setStatus("ACTIVE");
        categoryRepository.save(existing);
    }
}
