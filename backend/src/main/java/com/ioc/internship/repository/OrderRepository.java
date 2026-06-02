package com.ioc.internship.repository;

import com.ioc.internship.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByBranchId(Long branchId);
    Optional<OrderEntity> findByTableIdAndStatus(Long tableId, String status);
    List<OrderEntity> findByBranchIdAndStatus(Long branchId, String status);
    List<OrderEntity> findByBranchIdAndStatusIn(Long branchId, List<String> statuses);

    // Revenue queries for reporting
    @Query("SELECT o FROM OrderEntity o WHERE o.branchId = :branchId " +
           "AND o.status IN ('PAID', 'COMPLETED') " +
           "AND o.createdAt BETWEEN :from AND :to")
    List<OrderEntity> findPaidOrdersByBranchAndDateRange(
            @Param("branchId") Long branchId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT o FROM OrderEntity o WHERE o.status IN ('PAID', 'COMPLETED') " +
           "AND o.createdAt BETWEEN :from AND :to")
    List<OrderEntity> findAllPaidOrdersByDateRange(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT o FROM OrderEntity o WHERE o.branchId = :branchId " +
           "AND o.status IN ('PAID', 'COMPLETED') " +
           "ORDER BY o.createdAt DESC")
    List<OrderEntity> findCompletedOrdersByBranch(@Param("branchId") Long branchId);

    @Query("SELECT o FROM OrderEntity o WHERE o.status IN ('PAID', 'COMPLETED') " +
           "ORDER BY o.createdAt DESC")
    List<OrderEntity> findAllCompletedOrders();
}
