package com.ioc.internship.controller.admin;

import com.ioc.internship.dto.InventoryItemDTO;
import com.ioc.internship.dto.InventoryTransactionDTO;
import com.ioc.internship.service.InventoryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<?> getInventory(
            @PathVariable Long branchId,
            @RequestParam(defaultValue = "") String search) {
        try {
            List<InventoryItemDTO> items = inventoryService.getInventoryByBranch(branchId, search);
            return ResponseEntity.ok(success(items, ""));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @PostMapping("/branch/{branchId}")
    public ResponseEntity<?> createItem(@PathVariable Long branchId, @RequestBody CreateItemReq req) {
        try {
            InventoryItemDTO item = inventoryService.createItem(
                    branchId, req.getName(), req.getUnit(), req.getQuantity(), req.getMinStock());
            return ResponseEntity.ok(success(item, "Thêm mặt hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody UpdateItemReq req) {
        try {
            InventoryItemDTO item = inventoryService.updateItem(id, req.getName(), req.getUnit(), req.getMinStock());
            return ResponseEntity.ok(success(item, "Cập nhật thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            inventoryService.deleteItem(id);
            return ResponseEntity.ok(success(null, "Đã xóa mặt hàng"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/import")
    public ResponseEntity<?> importStock(@PathVariable Long id, @RequestBody StockTxReq req) {
        try {
            InventoryItemDTO item = inventoryService.importStock(
                    id, req.getQuantity(), req.getNote(), req.getPerformedBy(), req.getPerformedByName());
            return ResponseEntity.ok(success(item, "Nhập kho thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/export")
    public ResponseEntity<?> exportStock(@PathVariable Long id, @RequestBody StockTxReq req) {
        try {
            InventoryItemDTO item = inventoryService.exportStock(
                    id, req.getQuantity(), req.getReason(), req.getNote(), req.getPerformedBy(), req.getPerformedByName());
            return ResponseEntity.ok(success(item, "Xuất kho thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<?> getTransactions(@PathVariable Long id) {
        try {
            List<InventoryTransactionDTO> txs = inventoryService.getTransactions(id);
            return ResponseEntity.ok(success(txs, ""));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    private Map<String, Object> success(Object data, String message) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", data);
        res.put("message", message);
        return res;
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", false);
        res.put("message", message);
        return res;
    }

    @Data
    public static class CreateItemReq {
        private String name;
        private String unit;
        private Double quantity;
        private Double minStock;
    }

    @Data
    public static class UpdateItemReq {
        private String name;
        private String unit;
        private Double minStock;
    }

    @Data
    public static class StockTxReq {
        private Double quantity;
        private String reason;
        private String note;
        private Long performedBy;
        private String performedByName;
    }
}
