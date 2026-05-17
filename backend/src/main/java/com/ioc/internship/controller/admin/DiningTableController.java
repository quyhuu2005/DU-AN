package com.ioc.internship.controller.admin;

import com.ioc.internship.entity.DiningTableEntity;
import com.ioc.internship.service.DiningTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dining-tables")
@RequiredArgsConstructor
public class DiningTableController {

    private final DiningTableService tableService;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam Long branchId) {
        List<DiningTableEntity> all = tableService.getTables(branchId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", all);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody DiningTableEntity table) {
        DiningTableEntity created = tableService.createTable(table);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", created);
        response.put("message", "Thêm bàn thành công");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody DiningTableEntity table) {
        DiningTableEntity updated = tableService.updateTable(id, table);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updated);
        response.put("message", "Cập nhật bàn thành công");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        tableService.deleteTable(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", null);
        response.put("message", "Đã xóa bàn");
        return ResponseEntity.ok(response);
    }
}
