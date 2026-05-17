package com.ioc.internship.service;

import com.ioc.internship.entity.BranchEntity;
import java.util.List;

public interface BranchService {
    List<BranchEntity> getAllBranches(String search, String status);
    BranchEntity createBranch(BranchEntity branch);
    BranchEntity updateBranch(Long id, BranchEntity branch);
    void deactivateBranch(Long id);
    void activateBranch(Long id);
}
