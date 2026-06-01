package com.ioc.internship.service.impl;

import com.ioc.internship.common.exception.BusinessRuleException;
import com.ioc.internship.common.exception.ResourceNotFoundException;
import com.ioc.internship.dto.InventoryItemDTO;
import com.ioc.internship.entity.InventoryItemEntity;
import com.ioc.internship.entity.InventoryTransactionEntity;
import com.ioc.internship.repository.InventoryItemRepository;
import com.ioc.internship.repository.InventoryTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InventoryServiceImplTest {

    @Mock
    private InventoryItemRepository inventoryItemRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private InventoryItemEntity mockItem;

    @BeforeEach
    void setUp() {
        mockItem = InventoryItemEntity.builder()
                .id(1L)
                .branchId(1L)
                .name("Thịt bò")
                .unit("kg")
                .quantity(10.0)
                .minStock(2.0)
                .build();
    }

    @Test
    void exportStock_Success_DecreasesQuantityAndSavesTransaction() {
        // Arrange
        Long itemId = 1L;
        Double exportQty = 3.0;
        when(inventoryItemRepository.findById(itemId)).thenReturn(Optional.of(mockItem));
        when(inventoryItemRepository.save(any(InventoryItemEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        InventoryItemDTO result = inventoryService.exportStock(itemId, exportQty, "Nấu ăn", "Ghi chú", 1L, "Admin");

        // Assert
        assertEquals(7.0, result.getQuantity(), "Quantity should be decreased by 3.0");
        verify(inventoryItemRepository, times(1)).save(mockItem);
        verify(inventoryTransactionRepository, times(1)).save(any(InventoryTransactionEntity.class));
    }

    @Test
    void exportStock_ExceedsCurrentStock_ThrowsBusinessRuleException() {
        // Arrange
        Long itemId = 1L;
        Double exportQty = 15.0; // Current stock is 10.0
        when(inventoryItemRepository.findById(itemId)).thenReturn(Optional.of(mockItem));

        // Act & Assert
        BusinessRuleException exception = assertThrows(BusinessRuleException.class, () -> {
            inventoryService.exportStock(itemId, exportQty, "Nấu ăn", "Ghi chú", 1L, "Admin");
        });

        assertTrue(exception.getMessage().contains("vượt quá tồn kho hiện tại"));
        verify(inventoryItemRepository, never()).save(any());
        verify(inventoryTransactionRepository, never()).save(any());
    }

    @Test
    void exportStock_ItemNotFound_ThrowsResourceNotFoundException() {
        // Arrange
        Long itemId = 99L;
        when(inventoryItemRepository.findById(itemId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            inventoryService.exportStock(itemId, 5.0, "Nấu ăn", "Ghi chú", 1L, "Admin");
        });
    }

    @Test
    void exportStock_NegativeQuantity_ThrowsBusinessRuleException() {
        // Arrange
        Long itemId = 1L;
        
        // Act & Assert
        assertThrows(BusinessRuleException.class, () -> {
            inventoryService.exportStock(itemId, -5.0, "Nấu ăn", "Ghi chú", 1L, "Admin");
        });
    }
}
