package com.ioc.internship.service.impl;

import com.ioc.internship.entity.BranchEntity;
import com.ioc.internship.repository.BranchRepository;
import com.ioc.internship.service.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;

    @Override
    public List<BranchEntity> getAllBranches(String search, String status) {
        return branchRepository.findAll();
    }

    @Override
    public BranchEntity createBranch(BranchEntity branch) {
        branch.setStatus("ACTIVE");
        return branchRepository.save(branch);
    }

    @Override
    public BranchEntity updateBranch(Long id, BranchEntity branch) {
        BranchEntity existing = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chi nhánh không tồn tại: " + id));
        existing.setName(branch.getName());
        existing.setAddress(branch.getAddress());
        existing.setPhone(branch.getPhone());
        return branchRepository.save(existing);
    }

    @Override
    public void deactivateBranch(Long id) {
        BranchEntity existing = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chi nhánh không tồn tại: " + id));
        existing.setStatus("INACTIVE");
        branchRepository.save(existing);
    }

    @Override
    public void activateBranch(Long id) {
        BranchEntity existing = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chi nhánh không tồn tại: " + id));
        existing.setStatus("ACTIVE");
        branchRepository.save(existing);
    }
}
