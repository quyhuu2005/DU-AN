package com.ioc.internship.controller.admin;

import com.ioc.internship.dto.UserDTO;
import com.ioc.internship.entity.BranchEntity;
import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.service.BranchService;
import com.ioc.internship.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final BranchService branchService;

    private UserDTO toDTO(UserEntity entity) {
        String branchName = "";
        if (entity.getBranch_id() != null) {
            // Optional optimization: fetch branchName (for now, simply mocked or fetched lazily)
            branchName = branchService.getAllBranches("", "").stream()
                    .filter(b -> b.getId().equals(entity.getBranch_id()))
                    .map(BranchEntity::getName)
                    .findFirst().orElse("");
        }
        
        return UserDTO.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .fullName(entity.getFullName())
                .role(entity.getRole())
                .branchId(entity.getBranch_id())
                .branchName(branchName)
                .status(entity.getStatus())
                .build();
    }

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "10") int    size,
            @RequestParam(defaultValue = "")   String search,
            @RequestParam(defaultValue = "")   String role,
            @RequestParam(required = false)    Long   branchId
    ) {
        List<UserEntity> all = userService.getAllUsers(search, role, branchId);

        if (branchId != null) {
            all = all.stream()
                    .filter(u -> branchId.equals(u.getBranch_id()))
                    .collect(Collectors.toList());
        }

        if (!role.isBlank()) {
            all = all.stream()
                    .filter(u -> u.getRole().equalsIgnoreCase(role))
                    .collect(Collectors.toList());
        }

        if (!search.isBlank()) {
            String kw = search.toLowerCase();
            all = all.stream()
                    .filter(u -> u.getUsername().toLowerCase().contains(kw)
                              || (u.getFullName() != null && u.getFullName().toLowerCase().contains(kw)))
                    .collect(Collectors.toList());
        }

        int totalElements = all.size();
        int totalPages    = (int) Math.ceil((double) totalElements / size);
        int from          = Math.min(page * size, totalElements);
        int to            = Math.min(from + size, totalElements);
        List<UserDTO> pageContent = all.subList(from, to).stream().map(this::toDTO).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content",       pageContent);
        response.put("totalElements", totalElements);
        response.put("totalPages",    Math.max(totalPages, 1));
        response.put("page",          page);
        response.put("size",          size);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody UserEntity user) {
        UserEntity created = userService.createUser(user);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data",    toDTO(created));
        response.put("message", "Tạo tài khoản thành công");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UserEntity user) {
        UserEntity updated = userService.updateUser(id, user);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data",    toDTO(updated));
        response.put("message", "Cập nhật tài khoản thành công");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        userService.deactivateUser(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã khóa tài khoản");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Long id) {
        userService.activateUser(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã mở khóa tài khoản");
        return ResponseEntity.ok(response);
    }
}
