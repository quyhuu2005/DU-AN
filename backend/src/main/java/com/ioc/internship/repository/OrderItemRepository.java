package com.ioc.internship.repository;

import com.ioc.internship.entity.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
    List<OrderItemEntity> findByOrderId(Long orderId);

    // KDS: Lấy tất cả order items chưa hoàn thành của chi nhánh (join với orders)
    @Query("SELECT i FROM OrderItemEntity i " +
           "JOIN OrderEntity o ON i.orderId = o.id " +
           "WHERE o.branchId = :branchId " +
           "AND o.status IN ('PENDING', 'COMPLETED') " +
           "AND i.status IN ('PENDING', 'COOKING') " +
           "ORDER BY i.id ASC")
    List<OrderItemEntity> findKdsItems(@Param("branchId") Long branchId);
}
