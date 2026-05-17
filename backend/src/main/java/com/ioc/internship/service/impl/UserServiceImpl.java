package com.ioc.internship.service.impl;

import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public List<UserEntity> getAllUsers(String search, String role, Long branchId) {
        return userRepository.findAll();
    }

    @Override
    public UserEntity getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại: " + id));
    }

    @Override
    public UserEntity createUser(UserEntity user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Email/Username này đã được sử dụng");
        }
        if (user.getStatus() == null) {
            user.setStatus("ACTIVE");
        }
        return userRepository.save(user);
    }

    @Override
    public UserEntity updateUser(Long id, UserEntity user) {
        UserEntity existing = getUserById(id);
        if (!existing.getUsername().equals(user.getUsername())) {
            if (userRepository.findByUsername(user.getUsername()).isPresent()) {
                throw new RuntimeException("Email/Username này đã được sử dụng");
            }
        }
        existing.setUsername(user.getUsername());
        existing.setFullName(user.getFullName());
        existing.setRole(user.getRole());
        existing.setBranch_id(user.getBranch_id());
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            existing.setPassword(user.getPassword());
        }
        return userRepository.save(existing);
    }

    @Override
    public void deactivateUser(Long id) {
        UserEntity existing = getUserById(id);
        existing.setStatus("INACTIVE");
        userRepository.save(existing);
    }

    @Override
    public void activateUser(Long id) {
        UserEntity existing = getUserById(id);
        existing.setStatus("ACTIVE");
        userRepository.save(existing);
    }
    @Override
    public UserEntity findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
}
