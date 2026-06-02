package com.ioc.internship.service;

import com.ioc.internship.dto.ReservationDto;
import com.ioc.internship.dto.ReservationRequest;
import com.ioc.internship.entity.DiningTableEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservationService {
    ReservationDto createReservation(ReservationRequest request, Long createdBy);
    
    ReservationDto updateReservationStatus(Long id, String status);
    
    ReservationDto updateReservation(Long id, ReservationRequest request);
    
    ReservationDto assignTable(Long reservationId, Long tableId);
    
    Page<ReservationDto> getReservationsByDate(Long branchId, LocalDate date, Pageable pageable);
    
    List<ReservationDto> getReservationsByDateList(Long branchId, LocalDate date);
    
    // Check available tables for a specific time and duration
    List<DiningTableEntity> getAvailableTables(Long branchId, LocalDateTime startTime, Integer durationMinutes, Integer partySize, Long excludeReservationId);
}
