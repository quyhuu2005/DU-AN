package com.ioc.internship.controller.admin;

import com.ioc.internship.dto.OrderDTO;
import com.ioc.internship.dto.OrderItemDTO;
import com.ioc.internship.service.OrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/branch/{branchId}/table/{tableId}/staff/{staffId}")
    public ResponseEntity<?> createOrder(@PathVariable Long branchId, @PathVariable Long tableId, @PathVariable Long staffId) {
        try {
            OrderDTO order = orderService.createOrder(branchId, tableId, staffId);
            return ResponseEntity.ok(success(order, "Đã mở bàn thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @GetMapping("/table/{tableId}/active")
    public ResponseEntity<?> getActiveOrderByTable(@PathVariable Long tableId) {
        OrderDTO order = orderService.getActiveOrderByTable(tableId);
        if (order != null) {
            return ResponseEntity.ok(success(order, ""));
        }
        return ResponseEntity.ok(success(null, "Không có đơn hàng"));
    }

    @GetMapping("/branch/{branchId}/active")
    public ResponseEntity<?> getActiveOrdersByBranch(@PathVariable Long branchId) {
        List<OrderDTO> orders = orderService.getActiveOrdersByBranch(branchId);
        return ResponseEntity.ok(success(orders, ""));
    }

    @PostMapping("/{orderId}/items")
    public ResponseEntity<?> addItem(@PathVariable Long orderId, @RequestBody AddItemReq req) {
        try {
            OrderDTO order = orderService.addItemToOrder(orderId, req.getProductId(), req.getQuantity(), req.getNote());
            return ResponseEntity.ok(success(order, "Đã thêm món"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @PatchMapping("/items/{itemId}/quantity")
    public ResponseEntity<?> updateQuantity(@PathVariable Long itemId, @RequestBody UpdateQuantityReq req) {
        try {
            OrderDTO order = orderService.updateItemQuantity(itemId, req.getQuantity());
            return ResponseEntity.ok(success(order, "Đã cập nhật số lượng"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable Long itemId) {
        try {
            OrderDTO order = orderService.removeItemFromOrder(itemId);
            return ResponseEntity.ok(success(order, "Đã xóa món"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/checkout")
    public ResponseEntity<?> checkout(@PathVariable Long orderId) {
        try {
            OrderDTO order = orderService.checkoutOrder(orderId);
            return ResponseEntity.ok(success(order, "Thanh toán thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    /** Lịch sử đơn hàng đã hoàn tất của chi nhánh */
    @GetMapping("/branch/{branchId}/history")
    public ResponseEntity<?> getOrderHistory(@PathVariable Long branchId) {
        try {
            List<OrderDTO> orders = orderService.getCompletedOrdersByBranch(branchId);
            return ResponseEntity.ok(success(orders, ""));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    /** KDS: Lấy danh sách món đang chờ chế biến tại chi nhánh */
    @GetMapping("/branch/{branchId}/kds")
    public ResponseEntity<?> getKdsItems(@PathVariable Long branchId) {
        try {
            List<OrderItemDTO> items = orderService.getKdsItems(branchId);
            return ResponseEntity.ok(success(items, ""));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }

    /** KDS: Cập nhật trạng thái chế biến của một món ăn */
    @PatchMapping("/items/{itemId}/status")
    public ResponseEntity<?> updateItemStatus(@PathVariable Long itemId, @RequestBody UpdateStatusReq req) {
        try {
            OrderItemDTO item = orderService.updateItemStatus(itemId, req.getStatus());
            return ResponseEntity.ok(success(item, "Cập nhật trạng thái thành công"));
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
    public static class AddItemReq {
        private Long productId;
        private Integer quantity;
        private String note;
    }

    @Data
    public static class UpdateQuantityReq {
        private Integer quantity;
    }

    @Data
    public static class UpdateStatusReq {
        private String status;
    }
}
