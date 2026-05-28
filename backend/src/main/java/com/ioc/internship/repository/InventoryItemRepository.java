package com.ioc.internship.repository;

import com.ioc.internship.entity.InventoryItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItemEntity, Long> {
    List<InventoryItemEntity> findByBranchIdOrderByNameAsc(Long branchId);
    boolean existsByBranchIdAndNameIgnoreCase(Long branchId, String name);
}
