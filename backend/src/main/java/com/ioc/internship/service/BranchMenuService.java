package com.ioc.internship.service;

import com.ioc.internship.entity.BranchMenuEntity;
import java.util.List;

public interface BranchMenuService {
    List<BranchMenuEntity> getBranchMenus(Long branchId, String search, Long categoryId);
    BranchMenuEntity updateLocalPrice(Long id, java.math.BigDecimal localPrice);
    BranchMenuEntity toggleStatus(Long id, boolean isAvailable);
}
