package com.ioc.internship.repository;

import com.ioc.internship.entity.InventoryTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransactionEntity, Long> {
    List<InventoryTransactionEntity> findByInventoryItemIdOrderByCreatedAtDesc(Long inventoryItemId);
}
