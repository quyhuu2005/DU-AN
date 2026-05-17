package com.ioc.internship.service;

import com.ioc.internship.entity.DiningTableEntity;
import java.util.List;

public interface DiningTableService {
    List<DiningTableEntity> getTables(Long branchId);
    DiningTableEntity createTable(DiningTableEntity table);
    DiningTableEntity updateTable(Long id, DiningTableEntity table);
    void deleteTable(Long id);
}
