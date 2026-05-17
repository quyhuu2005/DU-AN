package com.ioc.internship.repository;

import com.ioc.internship.entity.DiningTableEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiningTableRepository extends JpaRepository<DiningTableEntity, Long> {
    List<DiningTableEntity> findByBranchId(Long branchId);
    Optional<DiningTableEntity> findByBranchIdAndName(Long branchId, String name);
}
