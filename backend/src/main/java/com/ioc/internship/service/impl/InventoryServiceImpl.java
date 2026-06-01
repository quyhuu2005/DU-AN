package com.ioc.internship.service.impl;

import com.ioc.internship.dto.InventoryItemDTO;
import com.ioc.internship.dto.InventoryTransactionDTO;
import com.ioc.internship.entity.InventoryItemEntity;
import com.ioc.internship.entity.InventoryTransactionEntity;
import com.ioc.internship.repository.InventoryItemRepository;
import com.ioc.internship.repository.InventoryTransactionRepository;
import com.ioc.internship.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.ioc.internship.common.exception.BusinessRuleException;
import com.ioc.internship.common.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    @Override
    public List<InventoryItemDTO> getInventoryByBranch(Long branchId, String search) {
        List<InventoryItemEntity> items = inventoryItemRepository.findByBranchIdOrderByNameAsc(branchId);
        if (search != null && !search.isBlank()) {
            String kw = search.toLowerCase();
            items = items.stream()
                    .filter(i -> i.getName().toLowerCase().contains(kw))
                    .collect(Collectors.toList());
        }
        return items.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InventoryItemDTO createItem(Long branchId, String name, String unit, Double quantity, Double minStock) {
        if (inventoryItemRepository.existsByBranchIdAndNameIgnoreCase(branchId, name)) {
            throw new BusinessRuleException("Mặt hàng \"" + name + "\" đã tồn tại trong kho của chi nhánh này.");
        }
        InventoryItemEntity item = InventoryItemEntity.builder()
                .branchId(branchId)
                .name(name)
                .unit(unit)
                .quantity(quantity != null ? quantity : 0.0)
                .minStock(minStock != null ? minStock : 0.0)
                .build();
        return toDTO(inventoryItemRepository.save(item));
    }

    @Override
    @Transactional
    public InventoryItemDTO updateItem(Long id, String name, String unit, Double minStock) {
        InventoryItemEntity item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mặt hàng."));
        if (name != null && !name.isBlank()) item.setName(name);
        if (unit != null && !unit.isBlank()) item.setUnit(unit);
        if (minStock != null) item.setMinStock(minStock);
        return toDTO(inventoryItemRepository.save(item));
    }

    @Override
    @Transactional
    public void deleteItem(Long id) {
        inventoryItemRepository.deleteById(id);
    }

    @Override
    @Transactional
    public InventoryItemDTO importStock(Long id, Double quantity, String note, Long performedBy, String performedByName) {
        if (quantity == null || quantity <= 0) {
            throw new BusinessRuleException("Số lượng nhập phải là số dương lớn hơn 0.");
        }
        InventoryItemEntity item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mặt hàng."));
        item.setQuantity(item.getQuantity() + quantity);
        inventoryItemRepository.save(item);

        // Ghi audit trail
        InventoryTransactionEntity tx = InventoryTransactionEntity.builder()
                .inventoryItemId(id)
                .type("IMPORT")
                .quantity(quantity)
                .note(note)
                .performedBy(performedBy)
                .performedByName(performedByName)
                .build();
        inventoryTransactionRepository.save(tx);

        return toDTO(item);
    }

    @Override
    @Transactional
    public InventoryItemDTO exportStock(Long id, Double quantity, String reason, String note, Long performedBy, String performedByName) {
        if (quantity == null || quantity <= 0) {
            throw new BusinessRuleException("Số lượng xuất phải là số dương lớn hơn 0.");
        }
        InventoryItemEntity item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mặt hàng."));
        if (quantity > item.getQuantity()) {
            throw new BusinessRuleException("Số lượng xuất vượt quá tồn kho hiện tại (" + item.getQuantity() + " " + item.getUnit() + "). Vui lòng kiểm tra lại.");
        }
        item.setQuantity(item.getQuantity() - quantity);
        inventoryItemRepository.save(item);

        // Ghi audit trail
        InventoryTransactionEntity tx = InventoryTransactionEntity.builder()
                .inventoryItemId(id)
                .type("EXPORT")
                .quantity(quantity)
                .reason(reason)
                .note(note)
                .performedBy(performedBy)
                .performedByName(performedByName)
                .build();
        inventoryTransactionRepository.save(tx);

        return toDTO(item);
    }

    @Override
    public List<InventoryTransactionDTO> getTransactions(Long inventoryItemId) {
        return inventoryTransactionRepository
                .findByInventoryItemIdOrderByCreatedAtDesc(inventoryItemId)
                .stream().map(this::toTxDTO).collect(Collectors.toList());
    }

    private String computeStockStatus(InventoryItemEntity item) {
        if (item.getQuantity() <= 0) return "OUT_OF_STOCK";
        if (item.getMinStock() != null && item.getMinStock() > 0 && item.getQuantity() <= item.getMinStock()) return "LOW";
        return "SUFFICIENT";
    }

    private InventoryItemDTO toDTO(InventoryItemEntity entity) {
        return InventoryItemDTO.builder()
                .id(entity.getId())
                .branchId(entity.getBranchId())
                .name(entity.getName())
                .unit(entity.getUnit())
                .quantity(entity.getQuantity())
                .minStock(entity.getMinStock())
                .stockStatus(computeStockStatus(entity))
                .expiryDate(entity.getExpiryDate())
                .updatedAt(entity.getUpdatedAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private InventoryTransactionDTO toTxDTO(InventoryTransactionEntity entity) {
        return InventoryTransactionDTO.builder()
                .id(entity.getId())
                .inventoryItemId(entity.getInventoryItemId())
                .type(entity.getType())
                .quantity(entity.getQuantity())
                .reason(entity.getReason())
                .note(entity.getNote())
                .performedBy(entity.getPerformedBy())
                .performedByName(entity.getPerformedByName())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
