package com.komals.catalog.auth;

import com.komals.catalog.common.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<UserResponse> listUsers() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest req) {
        String username = req.username().trim();
        if (repository.existsByUsername(username)) {
            throw new ApiException(HttpStatus.CONFLICT, "Username already exists");
        }

        AdminUser user = new AdminUser();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole(req.role() != null ? req.role() : AdminUser.Role.PRODUCT_MANAGER);
        user.setActive(req.active() != null ? req.active() : true);

        return toResponse(repository.save(user));
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest req
    ) {
        AdminUser user = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (req.role() != null) {
            user.setRole(req.role());
        }

        if (req.active() != null) {
            user.setActive(req.active());
        }

        if (req.password() != null && !req.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(req.password()));
        }

        return toResponse(repository.save(user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String id, Authentication auth) {
        AdminUser user = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (auth != null && auth.getName() != null && auth.getName().equals(user.getUsername())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot delete your own account");
        }

        repository.delete(user);
    }

    private UserResponse toResponse(AdminUser user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public record CreateUserRequest(
            @NotBlank String username,
            @NotBlank String password,
            AdminUser.Role role,
            Boolean active
    ) {}

    public record UpdateUserRequest(
            AdminUser.Role role,
            Boolean active,
            String password
    ) {}

    public record UserResponse(
            String id,
            String username,
            AdminUser.Role role,
            boolean active,
            Instant createdAt,
            Instant updatedAt
    ) {}
}
