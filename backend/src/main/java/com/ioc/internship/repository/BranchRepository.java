package com.ioc.internship.repository;

import com.ioc.internship.entity.BranchEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BranchRepository extends JpaRepository<BranchEntity, Long> {
    List<BranchEntity> findByNameContainingOrPhoneContaining(String name, String phone);
}
