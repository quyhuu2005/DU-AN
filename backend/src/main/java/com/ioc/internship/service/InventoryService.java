package com.ioc.internship.service;

import com.ioc.internship.dto.InventoryItemDTO;
import com.ioc.internship.dto.InventoryTransactionDTO;

import java.util.List;

public interface InventoryService {
    List<InventoryItemDTO> getInventoryByBranch(Long branchId, String search);
    InventoryItemDTO createItem(Long branchId, String name, String unit, Double quantity, Double minStock);
    InventoryItemDTO updateItem(Long id, String name, String unit, Double minStock);
    void deleteItem(Long id);

    InventoryItemDTO importStock(Long id, Double quantity, String note, Long performedBy, String performedByName);
    InventoryItemDTO exportStock(Long id, Double quantity, String reason, String note, Long performedBy, String performedByName);

    List<InventoryTransactionDTO> getTransactions(Long inventoryItemId);
}
