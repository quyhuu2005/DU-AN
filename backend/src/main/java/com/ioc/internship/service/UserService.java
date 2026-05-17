package com.ioc.internship.service;

import com.ioc.internship.entity.UserEntity;
import java.util.List;

public interface UserService {
    List<UserEntity> getAllUsers(String search, String role, Long branchId);
    UserEntity getUserById(Long id);
    UserEntity createUser(UserEntity user);
    UserEntity updateUser(Long id, UserEntity user);
    void deactivateUser(Long id);
    void activateUser(Long id);
    UserEntity findByUsername(String username);
}
