package com.ioc.internship.controller.admin;

import com.ioc.internship.dto.ReservationRequest;
import com.ioc.internship.service.ReservationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    private Map<String, Object> success(Object data, String message) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", data);
        res.put("message", message);
        return res;
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@Valid @RequestBody ReservationRequest request, HttpServletRequest httpRequest) {
        Long userId = 1L; // Fallback for dev if needed
        return ResponseEntity.ok(success(reservationService.createReservation(request, userId), "Tạo đặt bàn thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReservation(@PathVariable Long id, @Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.ok(success(reservationService.updateReservation(id, request), "Cập nhật thành công"));
    }

    @GetMapping
    public ResponseEntity<?> getReservationsByDate(
            @RequestParam Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(success(reservationService.getReservationsByDateList(branchId, date), "Thành công"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(success(reservationService.updateReservationStatus(id, status), "Cập nhật thành công"));
    }

    @PatchMapping("/{id}/table")
    public ResponseEntity<?> assignTable(@PathVariable Long id, @RequestParam Long tableId) {
        return ResponseEntity.ok(success(reservationService.assignTable(id, tableId), "Xếp bàn thành công"));
    }

    @GetMapping("/available-tables")
    public ResponseEntity<?> getAvailableTables(
            @RequestParam Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(defaultValue = "90") Integer durationMinutes,
            @RequestParam(defaultValue = "1") Integer partySize,
            @RequestParam(required = false) Long excludeReservationId) {
        return ResponseEntity.ok(success(
                reservationService.getAvailableTables(branchId, startTime, durationMinutes, partySize, excludeReservationId),
                "Thành công"
        ));
    }
}
