package com.ioc.internship.service.impl;

import com.ioc.internship.entity.BranchMenuEntity;
import com.ioc.internship.repository.BranchMenuRepository;
import com.ioc.internship.service.BranchMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BranchMenuServiceImpl implements BranchMenuService {

    private final BranchMenuRepository branchMenuRepository;

    @Override
    public List<BranchMenuEntity> getBranchMenus(Long branchId, String search, Long categoryId) {
        return branchMenuRepository.findByBranchId(branchId);
    }

    @Override
    public BranchMenuEntity updateLocalPrice(Long id, BigDecimal localPrice) {
        BranchMenuEntity existing = branchMenuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu: " + id));
        existing.setLocalPrice(localPrice);
        return branchMenuRepository.save(existing);
    }

    @Override
    public BranchMenuEntity toggleStatus(Long id, boolean isAvailable) {
        BranchMenuEntity existing = branchMenuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu: " + id));
        existing.setIsAvailable(isAvailable);
        return branchMenuRepository.save(existing);
    }
}
