package com.ioc.internship.controller.admin;

import com.ioc.internship.dto.CategoryDTO;
import com.ioc.internship.entity.CategoryEntity;
import com.ioc.internship.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final com.ioc.internship.repository.ProductRepository productRepository;

    private CategoryDTO toDTO(CategoryEntity entity) {
        int count = productRepository.findByCategoryId(entity.getId()).size();
        return CategoryDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .itemCount(count)
                .build();
    }

    /**
     * GET /api/categories
     */
    @GetMapping
    public ResponseEntity<?> getAll() {
        List<CategoryEntity> all = categoryService.getAllCategories("", "");
        List<CategoryDTO> dtos = all.stream().map(this::toDTO).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", dtos);
        response.put("message", "Thành công");

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/categories
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody CategoryEntity category) {
        CategoryEntity created = categoryService.createCategory(category);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", toDTO(created));
        response.put("message", "Thêm danh mục thành công");
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/categories/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CategoryEntity category) {
        CategoryEntity updated = categoryService.updateCategory(id, category);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", toDTO(updated));
        response.put("message", "Cập nhật danh mục thành công");
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/categories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", null);
        response.put("message", "Đã xóa danh mục");
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/categories/{id}/deactivate
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        categoryService.deactivateCategory(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã vô hiệu hóa danh mục");
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/categories/{id}/activate
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Long id) {
        categoryService.activateCategory(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã kích hoạt danh mục");
        return ResponseEntity.ok(response);
    }
}
