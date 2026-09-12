package com.jmaart.catalog.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/store/**", "/auth/login", "/uploads/**", "/webhooks/**").permitAll()
                        .requestMatchers("/auth/me").authenticated()

                        // Product management, imports & media uploads: accessible by ADMIN and PRODUCT_MANAGER
                        .requestMatchers(
                                "/admin/products",
                                "/admin/products/**",
                                "/admin/uploads",
                                "/admin/uploads/**"
                        ).hasAnyRole("ADMIN", "PRODUCT_MANAGER")

                        // Categories: GET readable by product manager, mutations restricted to ADMIN
                        .requestMatchers(HttpMethod.GET, "/admin/categories", "/admin/categories/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                        .requestMatchers("/admin/categories", "/admin/categories/**").hasRole("ADMIN")

                        // WhatsApp CRM (leads today; /admin/crm/** proxy endpoints later):
                        // accessible by ADMIN and WHATSAPP_MANAGER
                        .requestMatchers(
                                "/admin/leads",
                                "/admin/leads/**",
                                "/admin/crm/**"
                        ).hasAnyRole("ADMIN", "WHATSAPP_MANAGER")

                        // Administrative operations: restricted to ADMIN
                        .requestMatchers(
                                "/admin/users",
                                "/admin/users/**",
                                "/admin/settings",
                                "/admin/settings/**",
                                "/admin/insights",
                                "/admin/insights/**",
                                "/admin/offers",
                                "/admin/offers/**",
                                "/admin/audit-logs",
                                "/admin/audit-logs/**"
                        ).hasRole("ADMIN")

                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
