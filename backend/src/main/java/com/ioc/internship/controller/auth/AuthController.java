package com.ioc.internship.controller.auth;

import com.ioc.internship.dto.request.LoginRequest;
import com.ioc.internship.dto.response.LoginResponse;
import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.security.JwtUtils;
import com.ioc.internship.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        UserEntity userEntity = userService.findByUsername(request.getUsername());

        if (userEntity != null && passwordEncoder.matches(request.getPassword(), userEntity.getPassword())) {
            if ("INACTIVE".equals(userEntity.getStatus())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Tài khoản của bạn đã bị khóa.");
                return ResponseEntity.status(403).body(error);
            }

            String token = jwtUtils.generateToken(userEntity.getUsername(), userEntity.getRole(), userEntity.getBranch_id());

            LoginResponse.UserResponse user = LoginResponse.UserResponse.builder()
                    .id(userEntity.getId())
                    .username(userEntity.getUsername())
                    .fullName(userEntity.getFullName())
                    .role(userEntity.getRole())
                    .branchId(userEntity.getBranch_id())
                    .build();

            LoginResponse response = LoginResponse.builder()
                    .token(token)
                    .user(user)
                    .build();

            return ResponseEntity.ok(response);
        }

        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", "Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại.");
        return ResponseEntity.status(401).body(error);
    }
}
