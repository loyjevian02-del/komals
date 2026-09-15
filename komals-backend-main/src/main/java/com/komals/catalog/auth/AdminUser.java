package com.komals.catalog.auth;

import com.komals.catalog.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "admin_users")
@Getter
@Setter
public class AdminUser extends BaseEntity {

    public enum Role {
        ADMIN,
        PRODUCT_MANAGER,
        WHATSAPP_MANAGER
    }

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role = Role.ADMIN;

    @Column(name = "active")
    private Boolean active = true;

    public Role getRole() {
        return role != null ? role : Role.ADMIN;
    }

    public boolean isActive() {
        return active == null || active;
    }
}
