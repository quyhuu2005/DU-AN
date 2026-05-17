package com.ioc.internship.service;

import com.ioc.internship.entity.CategoryEntity;
import java.util.List;

public interface CategoryService {
    List<CategoryEntity> getAllCategories(String search, String status);
    CategoryEntity getCategoryById(Long id);
    CategoryEntity createCategory(CategoryEntity category);
    CategoryEntity updateCategory(Long id, CategoryEntity category);
    void deleteCategory(Long id);
    void deactivateCategory(Long id);
    void activateCategory(Long id);
}
