package com.ioc.internship.repository;

import com.ioc.internship.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    // Find all by branch and date range
    Page<Reservation> findByBranchIdAndReservedAtBetween(Long branchId, LocalDateTime start, LocalDateTime end, Pageable pageable);
    
    List<Reservation> findByBranchIdAndReservedAtBetween(Long branchId, LocalDateTime start, LocalDateTime end);

    List<Reservation> findByTableIdAndStatusIn(Long tableId, List<String> statuses);

    // Get reservations that overlap with a given time window (for table availability check)
    @Query("SELECT r FROM Reservation r WHERE r.branchId = :branchId AND r.status IN ('PENDING', 'CONFIRMED', 'SEATED') " +
           "AND r.reservedAt < :endTime AND FUNCTION('DATEADD', MINUTE, r.durationMinutes, r.reservedAt) > :startTime")
    List<Reservation> findOverlappingReservations(@Param("branchId") Long branchId, 
                                                  @Param("startTime") LocalDateTime startTime, 
                                                  @Param("endTime") LocalDateTime endTime);
}
