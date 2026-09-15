package com.komals.catalog.auth;

import com.komals.catalog.common.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        AdminUser user = repository.findByUsername(req.username())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        if (!user.isActive()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Account has been deactivated. Please contact an admin.");
        }

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        AdminUser.Role role = user.getRole() != null ? user.getRole() : AdminUser.Role.ADMIN;
        String token = jwtService.generate(user.getUsername(), role);
        return new LoginResponse(token, user.getUsername(), role.name());
    }

    @GetMapping("/me")
    public UserProfileResponse me(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        AdminUser user = repository.findByUsername(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        AdminUser.Role role = user.getRole() != null ? user.getRole() : AdminUser.Role.ADMIN;
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                role.name(),
                user.isActive()
        );
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    public record LoginResponse(String token, String username, String role) {}

    public record UserProfileResponse(String id, String username, String role, boolean active) {}
}
