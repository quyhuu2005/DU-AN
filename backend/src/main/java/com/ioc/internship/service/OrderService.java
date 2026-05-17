package com.ioc.internship.service;

import com.ioc.internship.dto.OrderDTO;
import com.ioc.internship.dto.OrderItemDTO;

import java.util.List;

public interface OrderService {
    OrderDTO createOrder(Long branchId, Long tableId, Long staffId);
    OrderDTO getOrderById(Long id);
    OrderDTO getActiveOrderByTable(Long tableId);
    List<OrderDTO> getActiveOrdersByBranch(Long branchId);
    
    OrderDTO addItemToOrder(Long orderId, Long productId, Integer quantity, String note);
    OrderDTO updateItemQuantity(Long itemId, Integer quantity);
    OrderDTO removeItemFromOrder(Long itemId);
    
    OrderDTO checkoutOrder(Long orderId);
}
