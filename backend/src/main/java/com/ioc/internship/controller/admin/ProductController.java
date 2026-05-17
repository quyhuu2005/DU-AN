package com.ioc.internship.controller.admin;

import com.ioc.internship.dto.ProductDTO;
import com.ioc.internship.entity.ProductEntity;
import com.ioc.internship.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    private ProductDTO toDTO(ProductEntity entity) {
        return ProductDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .categoryId(entity.getCategoryId())
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : "")
                .basePrice(entity.getBasePrice())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .hasOrders(false) // Mock hasOrders for now
                .build();
    }

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "10") int    size,
            @RequestParam(defaultValue = "")   String search,
            @RequestParam(required = false)    Long   categoryId
    ) {
        List<ProductEntity> all = productService.getAllProducts(search, categoryId);

        // Filter by categoryId
        if (categoryId != null) {
            all = all.stream()
                    .filter(p -> categoryId.equals(p.getCategoryId()))
                    .collect(Collectors.toList());
        }

        // Filter by search
        if (!search.isBlank()) {
            String kw = search.toLowerCase();
            all = all.stream()
                    .filter(p -> p.getName().toLowerCase().contains(kw)
                              || (p.getDescription() != null && p.getDescription().toLowerCase().contains(kw)))
                    .collect(Collectors.toList());
        }

        int totalElements = all.size();
        int totalPages    = (int) Math.ceil((double) totalElements / size);
        int from          = Math.min(page * size, totalElements);
        int to            = Math.min(from + size, totalElements);
        List<ProductDTO> pageContent = all.subList(from, to).stream().map(this::toDTO).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content",       pageContent);
        response.put("totalElements", totalElements);
        response.put("totalPages",    Math.max(totalPages, 1));
        response.put("page",          page);
        response.put("size",          size);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProductEntity product) {
        ProductEntity created = productService.createProduct(product);
        
        // Cần re-fetch để có relations cho DTO
        ProductEntity saved = productService.getProductById(created.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data",    toDTO(saved));
        response.put("message", "Thêm món ăn thành công");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ProductEntity product) {
        ProductEntity updated = productService.updateProduct(id, product);
        
        // Re-fetch 
        ProductEntity saved = productService.getProductById(updated.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data",    toDTO(saved));
        response.put("message", "Cập nhật món ăn thành công");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", null);
        response.put("message", "Đã xóa món ăn");
        return ResponseEntity.ok(response);
    }
}
