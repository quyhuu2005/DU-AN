package com.ioc.internship.service.impl;

import com.ioc.internship.dto.ReservationDto;
import com.ioc.internship.dto.ReservationRequest;
import com.ioc.internship.entity.DiningTableEntity;
import com.ioc.internship.entity.Reservation;
import com.ioc.internship.entity.OrderEntity;
import com.ioc.internship.repository.DiningTableRepository;
import com.ioc.internship.repository.ReservationRepository;
import com.ioc.internship.repository.OrderRepository;
import com.ioc.internship.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final DiningTableRepository tableRepository;
    private final OrderRepository orderRepository;

    private ReservationDto mapToDto(Reservation reservation) {
        return ReservationDto.builder()
                .id(reservation.getId())
                .branchId(reservation.getBranchId())
                .tableId(reservation.getTableId())
                .tableName(reservation.getTable() != null ? reservation.getTable().getName() : null)
                .customerName(reservation.getCustomerName())
                .customerPhone(reservation.getCustomerPhone())
                .partySize(reservation.getPartySize())
                .reservedAt(reservation.getReservedAt())
                .durationMinutes(reservation.getDurationMinutes())
                .status(reservation.getStatus())
                .note(reservation.getNote())
                .createdBy(reservation.getCreatedBy())
                .createdAt(reservation.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public ReservationDto createReservation(ReservationRequest request, Long createdBy) {
        // Validate table availability if table is specified
        if (request.getTableId() != null) {
            LocalDateTime endTime = request.getReservedAt().plusMinutes(request.getDurationMinutes());
            List<Reservation> overlapping = reservationRepository.findOverlappingReservations(
                    request.getBranchId(), request.getReservedAt(), endTime);
            
            boolean isTableBooked = overlapping.stream()
                    .anyMatch(r -> request.getTableId().equals(r.getTableId()));
            
            if (isTableBooked) {
                throw new RuntimeException("Bàn đã có người đặt trong khung giờ này.");
            }
            
            // Check if the table is currently occupied by a POS order
            List<OrderEntity> activeOrders = orderRepository.findByBranchIdAndStatusIn(request.getBranchId(), List.of("PENDING", "COOKING", "SERVED"));
            OrderEntity currentOrder = activeOrders.stream()
                    .filter(o -> request.getTableId().equals(o.getTableId()))
                    .findFirst().orElse(null);
                    
            if (currentOrder != null) {
                LocalDateTime orderStartTime = currentOrder.getCreatedAt() != null ? currentOrder.getCreatedAt() : LocalDateTime.now();
                LocalDateTime tableAvailableTime = orderStartTime.plusMinutes(90);
                
                if (request.getReservedAt().isBefore(tableAvailableTime)) {
                    java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
                    throw new RuntimeException("Bàn đang được phục vụ và dự kiến chỉ trống sau " + tableAvailableTime.format(formatter));
                }
            }
            
            // Optionally check capacity
            DiningTableEntity table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));
        }

        Reservation reservation = Reservation.builder()
                .branchId(request.getBranchId())
                .tableId(request.getTableId())
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .partySize(request.getPartySize())
                .reservedAt(request.getReservedAt())
                .durationMinutes(request.getDurationMinutes())
                .note(request.getNote())
                .createdBy(createdBy)
                .status("CONFIRMED") // Default to confirmed when staff creates it
                .build();

        Reservation saved = reservationRepository.save(reservation);
        
        // Update table status if table is assigned
        if (saved.getTableId() != null) {
            DiningTableEntity table = tableRepository.findById(saved.getTableId()).orElse(null);
            if (table != null) {
                recalculateTableStatus(table);
            }
        }
        
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ReservationDto updateReservationStatus(Long id, String status) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        reservation.setStatus(status);
        Reservation saved = reservationRepository.save(reservation);
        
        if (saved.getTableId() != null) {
            DiningTableEntity table = tableRepository.findById(saved.getTableId()).orElse(null);
            if (table != null) {
                recalculateTableStatus(table);
            }
        }
        
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ReservationDto updateReservation(Long id, ReservationRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đặt bàn"));
                
        Long oldTableId = reservation.getTableId();
        Long newTableId = request.getTableId();

        reservation.setCustomerName(request.getCustomerName());
        reservation.setCustomerPhone(request.getCustomerPhone());
        reservation.setPartySize(request.getPartySize());
        reservation.setReservedAt(request.getReservedAt());
        reservation.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 90);
        reservation.setNote(request.getNote());
        
        Reservation saved = reservationRepository.save(reservation);
        
        if (newTableId != null && !newTableId.equals(oldTableId)) {
            return assignTable(saved.getId(), newTableId);
        } else if (newTableId == null && oldTableId != null) {
            DiningTableEntity oldTable = tableRepository.findById(oldTableId).orElse(null);
            saved.setTableId(null);
            saved = reservationRepository.save(saved);
            if (oldTable != null) {
                recalculateTableStatus(oldTable);
            }
        } else if (newTableId != null && newTableId.equals(oldTableId)) {
            DiningTableEntity table = tableRepository.findById(newTableId).orElse(null);
            if (table != null) {
                recalculateTableStatus(table);
            }
        }
        
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ReservationDto assignTable(Long reservationId, Long tableId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        LocalDateTime endTime = reservation.getReservedAt().plusMinutes(reservation.getDurationMinutes());
        List<Reservation> overlapping = reservationRepository.findOverlappingReservations(
                reservation.getBranchId(), reservation.getReservedAt(), endTime);
        
        boolean isTableBooked = overlapping.stream()
                .filter(r -> !r.getId().equals(reservationId))
                .anyMatch(r -> tableId.equals(r.getTableId()));
        
        if (isTableBooked) {
            throw new RuntimeException("Bàn đã có người đặt trong khung giờ này.");
        }
        
        Long oldTableId = reservation.getTableId();
        reservation.setTableId(tableId);
        Reservation saved = reservationRepository.save(reservation);
        
        if (oldTableId != null) {
            DiningTableEntity oldTable = tableRepository.findById(oldTableId).orElse(null);
            if (oldTable != null) {
                recalculateTableStatus(oldTable);
            }
        }
        
        DiningTableEntity newTable = tableRepository.findById(tableId).orElse(null);
        if (newTable != null) {
            recalculateTableStatus(newTable);
        }
        
        return mapToDto(saved);
    }

    @Override
    public Page<ReservationDto> getReservationsByDate(Long branchId, LocalDate date, Pageable pageable) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        return reservationRepository.findByBranchIdAndReservedAtBetween(branchId, startOfDay, endOfDay, pageable)
                .map(this::mapToDto);
    }
    
    @Override
    public List<ReservationDto> getReservationsByDateList(Long branchId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        return reservationRepository.findByBranchIdAndReservedAtBetween(branchId, startOfDay, endOfDay).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<DiningTableEntity> getAvailableTables(Long branchId, LocalDateTime startTime, Integer durationMinutes, Integer partySize, Long excludeReservationId) {
        LocalDateTime endTime = startTime.plusMinutes(durationMinutes);
        
        // 1. Get all booked tables for this period from overlapping reservations
        List<Reservation> overlapping = reservationRepository.findOverlappingReservations(branchId, startTime, endTime);
        Set<Long> bookedTableIds = overlapping.stream()
                .filter(r -> excludeReservationId == null || !r.getId().equals(excludeReservationId))
                .map(Reservation::getTableId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());
        
        // 2. Filter out tables currently occupied by active POS orders that overlap with this period
        List<OrderEntity> activeOrders = orderRepository.findByBranchIdAndStatus(branchId, "PENDING");
        for (OrderEntity order : activeOrders) {
            LocalDateTime orderStart = order.getCreatedAt();
            LocalDateTime orderEnd = orderStart.plusMinutes(90); // default dining duration
            
            // Check overlap: startTime < orderEnd AND endTime > orderStart
            if (startTime.isBefore(orderEnd) && endTime.isAfter(orderStart)) {
                bookedTableIds.add(order.getTableId());
            }
        }
        
        // Find all tables for branch
        List<DiningTableEntity> allTables = tableRepository.findByBranchId(branchId);
        
        // Filter out booked and occupied tables
        return allTables.stream()
                .filter(t -> !bookedTableIds.contains(t.getId()))
                .collect(Collectors.toList());
    }
    
    private void recalculateTableStatus(DiningTableEntity table) {
        if (table == null) return;
        
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        
        // Check if there is an active order (PENDING status) for this table
        boolean hasActiveOrder = orderRepository.findByTableIdAndStatus(table.getId(), "PENDING").isPresent();
        
        // Check if there is a SEATED reservation today (customer is physically present)
        List<Reservation> todayReservations = reservationRepository.findByTableIdAndStatusIn(
                table.getId(), List.of("PENDING", "CONFIRMED", "SEATED"));
        
        boolean hasSeated = todayReservations.stream()
                .anyMatch(r -> "SEATED".equals(r.getStatus())
                        && r.getReservedAt() != null
                        && r.getReservedAt().toLocalDate().equals(today));
        
        // Only mark RESERVED if there's a future reservation today (not already past, and within 2 hours)
        boolean hasUpcoming = todayReservations.stream()
                .anyMatch(r -> ("PENDING".equals(r.getStatus()) || "CONFIRMED".equals(r.getStatus()))
                        && r.getReservedAt() != null
                        && r.getReservedAt().toLocalDate().equals(today)
                        && r.getReservedAt().isAfter(now.minusMinutes(30))
                        && r.getReservedAt().isBefore(now.plusHours(2))); // Only block table 2 hours before
        
        if (hasActiveOrder || hasSeated) {
            table.setStatus("OCCUPIED");
        } else if (hasUpcoming) {
            table.setStatus("RESERVED");
        } else {
            table.setStatus("EMPTY");
        }
        tableRepository.save(table);
    }
}
