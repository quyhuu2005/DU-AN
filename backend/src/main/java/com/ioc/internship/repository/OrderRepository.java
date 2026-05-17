package com.ioc.internship.repository;

import com.ioc.internship.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByBranchId(Long branchId);
    Optional<OrderEntity> findByTableIdAndStatus(Long tableId, String status);
    List<OrderEntity> findByBranchIdAndStatus(Long branchId, String status);
}
