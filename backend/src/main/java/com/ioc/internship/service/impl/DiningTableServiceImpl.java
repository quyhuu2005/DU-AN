package com.ioc.internship.service.impl;

import com.ioc.internship.entity.DiningTableEntity;
import com.ioc.internship.repository.DiningTableRepository;
import com.ioc.internship.service.DiningTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiningTableServiceImpl implements DiningTableService {

    private final DiningTableRepository tableRepository;

    @Override
    public List<DiningTableEntity> getTables(Long branchId) {
        return tableRepository.findByBranchId(branchId);
    }

    @Override
    public DiningTableEntity createTable(DiningTableEntity table) {
        if (tableRepository.findByBranchIdAndName(table.getBranchId(), table.getName()).isPresent()) {
            throw new RuntimeException("Tên bàn này đã có tại chi nhánh");
        }
        if (table.getStatus() == null || table.getStatus().isBlank()) {
            table.setStatus("EMPTY");
        }
        return tableRepository.save(table);
    }

    @Override
    public DiningTableEntity updateTable(Long id, DiningTableEntity table) {
        DiningTableEntity existing = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));
        if (!existing.getName().equals(table.getName())) {
            if (tableRepository.findByBranchIdAndName(existing.getBranchId(), table.getName()).isPresent()) {
                throw new RuntimeException("Tên bàn này đã có tại chi nhánh");
            }
        }
        existing.setName(table.getName());
        existing.setCapacity(table.getCapacity());
        if (table.getZone() != null) {
            existing.setZone(table.getZone());
        }
        return tableRepository.save(existing);
    }

    @Override
    public void deleteTable(Long id) {
        DiningTableEntity existing = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));
        if ("OCCUPIED".equalsIgnoreCase(existing.getStatus())) {
            throw new RuntimeException("Không thể xóa bàn đang có khách");
        }
        tableRepository.deleteById(id);
    }
}
