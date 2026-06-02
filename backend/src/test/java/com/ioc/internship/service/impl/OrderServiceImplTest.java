package com.ioc.internship.service.impl;

import com.ioc.internship.dto.OrderDTO;
import com.ioc.internship.entity.DiningTableEntity;
import com.ioc.internship.entity.OrderEntity;
import com.ioc.internship.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private DiningTableRepository tableRepository;
    @Mock private BranchMenuRepository branchMenuRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductRecipeRepository productRecipeRepository;
    @Mock private InventoryItemRepository inventoryItemRepository;
    @Mock private InventoryTransactionRepository inventoryTransactionRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private DiningTableEntity mockTable;
    private OrderEntity mockOrder;

    @BeforeEach
    void setUp() {
        mockTable = DiningTableEntity.builder()
                .id(1L)
                .branchId(1L)
                .name("Bàn số 1")
                .status("EMPTY")
                .build();

        mockOrder = OrderEntity.builder()
                .id(100L)
                .branchId(1L)
                .tableId(1L)
                .staffId(2L)
                .status("PENDING")
                .totalPrice(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createOrder_TableEmpty_Success() {
        // Arrange
        when(orderRepository.findByTableIdAndStatus(1L, "PENDING")).thenReturn(Optional.empty());
        when(orderRepository.save(any(OrderEntity.class))).thenReturn(mockOrder);
        when(tableRepository.findById(1L)).thenReturn(Optional.of(mockTable));
        
        // Cần mock các repository phụ trợ để map ra DTO
        when(orderItemRepository.findByOrderId(any())).thenReturn(new ArrayList<>());
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        // Act
        OrderDTO result = orderService.createOrder(1L, 1L, 2L, null);

        // Assert
        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("PENDING", result.getStatus());
        assertEquals("OCCUPIED", mockTable.getStatus());
        
        verify(orderRepository, times(1)).save(any(OrderEntity.class));
        verify(tableRepository, times(1)).save(mockTable);
    }

    @Test
    void createOrder_TableAlreadyOccupied_ThrowsRuntimeException() {
        // Arrange
        when(orderRepository.findByTableIdAndStatus(1L, "PENDING")).thenReturn(Optional.of(mockOrder));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(1L, 1L, 2L, null);
        });

        assertEquals("Bàn này đang có đơn hàng chưa thanh toán.", exception.getMessage());
        verify(orderRepository, never()).save(any(OrderEntity.class));
    }

    @Test
    void checkoutOrder_Success_UpdatesStatusAndFreesTable() {
        // Arrange
        when(orderRepository.findById(100L)).thenReturn(Optional.of(mockOrder));
        when(tableRepository.findById(1L)).thenReturn(Optional.of(mockTable));
        
        when(orderItemRepository.findByOrderId(any())).thenReturn(new ArrayList<>());
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        // Act
        OrderDTO result = orderService.checkoutOrder(100L);

        // Assert
        assertEquals("COMPLETED", mockOrder.getStatus());
        assertEquals("EMPTY", mockTable.getStatus());
        
        verify(orderRepository, times(1)).save(mockOrder);
        verify(tableRepository, times(1)).save(mockTable);
    }

    @Test
    void checkoutOrder_AlreadyCompleted_ThrowsRuntimeException() {
        // Arrange
        mockOrder.setStatus("COMPLETED");
        when(orderRepository.findById(100L)).thenReturn(Optional.of(mockOrder));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.checkoutOrder(100L);
        });

        assertEquals("Đơn hàng này đã được thanh toán.", exception.getMessage());
        verify(orderRepository, never()).save(any());
        verify(tableRepository, never()).save(any());
    }
}
