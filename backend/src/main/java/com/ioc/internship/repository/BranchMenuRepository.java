package com.ioc.internship.repository;

import com.ioc.internship.entity.BranchMenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchMenuRepository extends JpaRepository<BranchMenuEntity, Long> {
    List<BranchMenuEntity> findByBranchId(Long branchId);
    Optional<BranchMenuEntity> findByBranchIdAndProductId(Long branchId, Long productId);
}
