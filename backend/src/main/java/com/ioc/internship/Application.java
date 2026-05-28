package com.ioc.internship;

import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.annotation.PostConstruct;

import java.util.List;
import java.util.TimeZone;

@SpringBootApplication
public class Application {
    @PostConstruct
    public void init() {
        // Set JVM timezone to Vietnam (GMT+7) to ensure consistency with client
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner migratePasswords(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            List<UserEntity> users = userRepository.findAll();
            for (UserEntity user : users) {
                if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
                    user.setPassword(passwordEncoder.encode(user.getPassword()));
                    userRepository.save(user);
                }
            }
        };
    }
}
