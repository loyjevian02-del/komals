package com.jmaart.catalog.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class AdminUserSeeder implements CommandLineRunner {

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-username:}")
    private String defaultUsername;

    @Value("${app.admin.default-password:}")
    private String defaultPassword;

    @Override
    public void run(String... args) {
        if (defaultUsername.isBlank() || defaultPassword.isBlank()) {
            return;
        }
        if (repository.existsByUsername(defaultUsername)) {
            return;
        }
        AdminUser user = new AdminUser();
        user.setUsername(defaultUsername);
        user.setPasswordHash(passwordEncoder.encode(defaultPassword));
        user.setRole(AdminUser.Role.ADMIN);
        user.setActive(true);
        repository.save(user);
    }
}
