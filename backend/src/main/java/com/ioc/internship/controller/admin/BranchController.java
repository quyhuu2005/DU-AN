package com.ioc.internship.controller.admin;

import com.ioc.internship.entity.BranchEntity;
import com.ioc.internship.service.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    /**
     * GET /api/branches?page=0&size=10&search=&status=
     * Trả về dạng PaginatedResponse mà frontend mong đợi.
     */
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "10") int    size,
            @RequestParam(defaultValue = "")   String search,
            @RequestParam(defaultValue = "")   String status
    ) {
        List<BranchEntity> all = branchService.getAllBranches(search, status);

        // Lọc theo status nếu có
        if (!status.isBlank()) {
            all = all.stream()
                    .filter(b -> b.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        // Lọc theo search (tên hoặc số điện thoại)
        if (!search.isBlank()) {
            String kw = search.toLowerCase();
            all = all.stream()
                    .filter(b -> b.getName().toLowerCase().contains(kw)
                              || b.getPhone().toLowerCase().contains(kw))
                    .collect(Collectors.toList());
        }

        int totalElements = all.size();
        int totalPages    = (int) Math.ceil((double) totalElements / size);
        int from          = Math.min(page * size, totalElements);
        int to            = Math.min(from + size, totalElements);
        List<BranchEntity> pageContent = all.subList(from, to);

        Map<String, Object> response = new HashMap<>();
        response.put("content",       pageContent);
        response.put("totalElements", totalElements);
        response.put("totalPages",    Math.max(totalPages, 1));
        response.put("page",          page);
        response.put("size",          size);

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/branches
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody BranchEntity branch) {
        BranchEntity created = branchService.createBranch(branch);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data",    created);
        response.put("message", "Thêm chi nhánh thành công");
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/branches/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody BranchEntity branch) {
        BranchEntity updated = branchService.updateBranch(id, branch);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data",    updated);
        response.put("message", "Cập nhật chi nhánh thành công");
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/branches/{id}/deactivate
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        branchService.deactivateBranch(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã ngừng hoạt động chi nhánh");
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/branches/{id}/activate
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Long id) {
        branchService.activateBranch(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã kích hoạt lại chi nhánh");
        return ResponseEntity.ok(response);
    }
}
