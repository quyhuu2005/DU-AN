package com.ioc.internship.controller.admin;

import com.ioc.internship.dto.BranchMenuDTO;
import com.ioc.internship.entity.BranchMenuEntity;
import com.ioc.internship.service.BranchMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/branch-menus")
@RequiredArgsConstructor
public class BranchMenuController {

    private final BranchMenuService branchMenuService;

    private BranchMenuDTO toDTO(BranchMenuEntity entity) {
        return BranchMenuDTO.builder()
                .id(entity.getId())
                .branchId(entity.getBranchId())
                .productId(entity.getProductId())
                .productName(entity.getProduct() != null ? entity.getProduct().getName() : "")
                .categoryName(entity.getProduct() != null && entity.getProduct().getCategory() != null ? entity.getProduct().getCategory().getName() : "")
                .imageUrl(entity.getProduct() != null ? entity.getProduct().getImageUrl() : "")
                .basePrice(entity.getProduct() != null ? entity.getProduct().getBasePrice() : BigDecimal.ZERO)
                .localPrice(entity.getLocalPrice() != null ? entity.getLocalPrice() : (entity.getProduct() != null ? entity.getProduct().getBasePrice() : BigDecimal.ZERO))
                .isAvailable(entity.getIsAvailable())
                .status(entity.getStatus())
                .build();
    }

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "10") int    size,
            @RequestParam(defaultValue = "")   String search,
            @RequestParam(required = false)    Long   categoryId,
            @RequestParam                      Long   branchId
    ) {
        List<BranchMenuEntity> all = branchMenuService.getBranchMenus(branchId, search, categoryId);

        // Lọc category
        if (categoryId != null) {
            all = all.stream()
                    .filter(m -> m.getProduct() != null && categoryId.equals(m.getProduct().getCategoryId()))
                    .collect(Collectors.toList());
        }

        // Lọc search
        if (!search.isBlank()) {
            String kw = search.toLowerCase();
            all = all.stream()
                    .filter(m -> m.getProduct() != null && m.getProduct().getName().toLowerCase().contains(kw))
                    .collect(Collectors.toList());
        }

        int totalElements = all.size();
        int totalPages    = (int) Math.ceil((double) totalElements / size);
        int from          = Math.min(page * size, totalElements);
        int to            = Math.min(from + size, totalElements);
        List<BranchMenuDTO> pageContent = all.subList(from, to).stream().map(this::toDTO).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content",       pageContent);
        response.put("totalElements", totalElements);
        response.put("totalPages",    Math.max(totalPages, 1));
        response.put("page",          page);
        response.put("size",          size);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/price")
    public ResponseEntity<?> updatePrice(@PathVariable Long id, @RequestBody Map<String, BigDecimal> body) {
        BranchMenuEntity updated = branchMenuService.updateLocalPrice(id, body.get("localPrice"));
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data",    toDTO(updated));
        response.put("message", "Cập nhật giá thành công");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        BranchMenuEntity updated = branchMenuService.toggleStatus(id, body.get("isAvailable"));
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data",    toDTO(updated));
        response.put("message", "Cập nhật trạng thái thành công");
        return ResponseEntity.ok(response);
    }
}
