package com.ioc.internship.service.impl;

import com.ioc.internship.dto.OrderDTO;
import com.ioc.internship.dto.OrderItemDTO;
import com.ioc.internship.entity.*;
import com.ioc.internship.repository.*;
import com.ioc.internship.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final DiningTableRepository tableRepository;
    private final BranchMenuRepository branchMenuRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductRecipeRepository productRecipeRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    @Override
    @Transactional
    public OrderDTO createOrder(Long branchId, Long tableId, Long staffId) {
        // Check if table is already occupied
        if (orderRepository.findByTableIdAndStatus(tableId, "PENDING").isPresent()) {
            throw new RuntimeException("Bàn này đang có đơn hàng chưa thanh toán.");
        }

        OrderEntity order = OrderEntity.builder()
                .branchId(branchId)
                .tableId(tableId)
                .staffId(staffId)
                .status("PENDING")
                .totalPrice(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .build();
        
        OrderEntity saved = orderRepository.save(order);

        // Update table status
        DiningTableEntity table = tableRepository.findById(tableId).orElseThrow();
        table.setStatus("OCCUPIED");
        tableRepository.save(table);

        return toDTO(saved);
    }

    @Override
    public OrderDTO getOrderById(Long id) {
        return toDTO(orderRepository.findById(id).orElseThrow());
    }

    @Override
    public OrderDTO getActiveOrderByTable(Long tableId) {
        return orderRepository.findByTableIdAndStatus(tableId, "PENDING")
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    public List<OrderDTO> getActiveOrdersByBranch(Long branchId) {
        return orderRepository.findByBranchIdAndStatus(branchId, "PENDING")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getCompletedOrdersByBranch(Long branchId) {
        return orderRepository.findCompletedOrdersByBranch(branchId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDTO addItemToOrder(Long orderId, Long productId, Integer quantity, String note) {
        OrderEntity order = orderRepository.findById(orderId).orElseThrow();
        if ("COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng đã thanh toán, không thể thêm món.");
        }

        BranchMenuEntity menu = branchMenuRepository.findByBranchId(order.getBranchId())
                .stream().filter(m -> m.getProductId().equals(productId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Món không tồn tại trong thực đơn chi nhánh."));
        
        if (menu.getIsAvailable() != null && !menu.getIsAvailable()) {
            throw new RuntimeException("Món này đã hết.");
        }

        BigDecimal price = menu.getLocalPrice() != null ? menu.getLocalPrice() : BigDecimal.ZERO;
        
        // Check if item already exists in order
        List<OrderItemEntity> items = orderItemRepository.findByOrderId(orderId);
        OrderItemEntity existingItem = items.stream()
                .filter(i -> i.getProductId().equals(productId) && (note == null || note.equals(i.getNote())))
                .findFirst().orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            orderItemRepository.save(existingItem);
        } else {
            OrderItemEntity newItem = OrderItemEntity.builder()
                    .orderId(orderId)
                    .productId(productId)
                    .quantity(quantity)
                    .price(price)
                    .note(note)
                    .status("PENDING")
                    .build();
            orderItemRepository.save(newItem);
        }

        updateOrderTotal(order);
        return toDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO updateItemQuantity(Long itemId, Integer quantity) {
        OrderItemEntity item = orderItemRepository.findById(itemId).orElseThrow();
        OrderEntity order = orderRepository.findById(item.getOrderId()).orElseThrow();
        
        if ("COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng đã thanh toán, không thể sửa món.");
        }

        if (quantity <= 0) {
            orderItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            orderItemRepository.save(item);
        }

        updateOrderTotal(order);
        return toDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO removeItemFromOrder(Long itemId) {
        OrderItemEntity item = orderItemRepository.findById(itemId).orElseThrow();
        OrderEntity order = orderRepository.findById(item.getOrderId()).orElseThrow();
        
        if ("COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng đã thanh toán, không thể xóa món.");
        }

        orderItemRepository.delete(item);
        updateOrderTotal(order);
        return toDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO checkoutOrder(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId).orElseThrow();
        if ("COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng này đã được thanh toán.");
        }

        order.setStatus("COMPLETED");
        orderRepository.save(order);

        // Update table status back to EMPTY
        DiningTableEntity table = tableRepository.findById(order.getTableId()).orElseThrow();
        table.setStatus("EMPTY");
        tableRepository.save(table);

        return toDTO(order);
    }

    private void updateOrderTotal(OrderEntity order) {
        List<OrderItemEntity> items = orderItemRepository.findByOrderId(order.getId());
        BigDecimal total = items.stream()
                .map(i -> i.getPrice().multiply(new BigDecimal(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalPrice(total);
        orderRepository.save(order);
    }

    private OrderDTO toDTO(OrderEntity entity) {
        String tableName = tableRepository.findById(entity.getTableId()).map(DiningTableEntity::getName).orElse("");
        String staffName = userRepository.findById(entity.getStaffId()).map(UserEntity::getFullName).orElse("");
        
        List<OrderItemDTO> itemDTOs = orderItemRepository.findByOrderId(entity.getId()).stream().map(i -> {
            String productName = productRepository.findById(i.getProductId()).map(ProductEntity::getName).orElse("");
            return OrderItemDTO.builder()
                    .id(i.getId())
                    .orderId(i.getOrderId())
                    .productId(i.getProductId())
                    .productName(productName)
                    .quantity(i.getQuantity())
                    .price(i.getPrice())
                    .note(i.getNote())
                    .status(i.getStatus())
                    .tableId(entity.getTableId())
                    .tableName(tableName)
                    .orderCreatedAt(entity.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        return OrderDTO.builder()
                .id(entity.getId())
                .branchId(entity.getBranchId())
                .tableId(entity.getTableId())
                .tableName(tableName)
                .staffId(entity.getStaffId())
                .staffName(staffName)
                .totalPrice(entity.getTotalPrice())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .items(itemDTOs)
                .build();
    }

    @Override
    public List<OrderItemDTO> getKdsItems(Long branchId) {
        return orderItemRepository.findKdsItems(branchId).stream().map(i -> {
            String productName = productRepository.findById(i.getProductId()).map(ProductEntity::getName).orElse("");
            OrderEntity order = orderRepository.findById(i.getOrderId()).orElse(null);
            String tableName = order != null ? tableRepository.findById(order.getTableId()).map(DiningTableEntity::getName).orElse("") : "";
            return OrderItemDTO.builder()
                    .id(i.getId())
                    .orderId(i.getOrderId())
                    .productId(i.getProductId())
                    .productName(productName)
                    .quantity(i.getQuantity())
                    .price(i.getPrice())
                    .note(i.getNote())
                    .status(i.getStatus())
                    .tableId(order != null ? order.getTableId() : null)
                    .tableName(tableName)
                    .orderCreatedAt(order != null ? order.getCreatedAt() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderItemDTO updateItemStatus(Long itemId, String status) {
        OrderItemEntity item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn"));
        // Validate status transition
        List<String> validStatuses = List.of("PENDING", "COOKING", "READY", "SERVED");
        if (!validStatuses.contains(status)) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + status);
        }
        
        // Auto-deduct inventory when item becomes READY
        if ("READY".equals(status) && !"READY".equals(item.getStatus()) && !"SERVED".equals(item.getStatus())) {
            OrderEntity order = orderRepository.findById(item.getOrderId()).orElseThrow();
            List<ProductRecipeEntity> recipes = productRecipeRepository.findByProductId(item.getProductId());
            for (ProductRecipeEntity recipe : recipes) {
                InventoryItemEntity invItem = inventoryItemRepository.findByBranchIdOrderByNameAsc(order.getBranchId())
                        .stream().filter(inv -> inv.getName().equalsIgnoreCase(recipe.getIngredientName()))
                        .findFirst().orElse(null);
                
                if (invItem != null) {
                    double deductAmount = recipe.getQuantityRequired() * item.getQuantity();
                    invItem.setQuantity(invItem.getQuantity() - deductAmount);
                    inventoryItemRepository.save(invItem);
                    
                    InventoryTransactionEntity tx = InventoryTransactionEntity.builder()
                            .inventoryItemId(invItem.getId())
                            .type("EXPORT")
                            .quantity(deductAmount)
                            .reason("Chế biến món: " + productRepository.findById(item.getProductId()).map(ProductEntity::getName).orElse(""))
                            .createdAt(LocalDateTime.now())
                            .build();
                    inventoryTransactionRepository.save(tx);
                }
            }
        }

        item.setStatus(status);
        OrderItemEntity saved = orderItemRepository.save(item);
        String productName = productRepository.findById(saved.getProductId()).map(ProductEntity::getName).orElse("");
        OrderEntity order = orderRepository.findById(saved.getOrderId()).orElse(null);
        String tableName = order != null ? tableRepository.findById(order.getTableId()).map(DiningTableEntity::getName).orElse("") : "";
        return OrderItemDTO.builder()
                .id(saved.getId())
                .orderId(saved.getOrderId())
                .productId(saved.getProductId())
                .productName(productName)
                .quantity(saved.getQuantity())
                .price(saved.getPrice())
                .note(saved.getNote())
                .status(saved.getStatus())
                .tableId(order != null ? order.getTableId() : null)
                .tableName(tableName)
                .orderCreatedAt(order != null ? order.getCreatedAt() : null)
                .build();
    }
}
