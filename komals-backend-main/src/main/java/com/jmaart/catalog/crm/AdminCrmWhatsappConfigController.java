package com.jmaart.catalog.crm;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Proxies the WhatsApp Cloud API connection settings (Phone Number ID,
 * access token, Meta App ID/Secret) through to wacrm, authenticated with
 * a service API key ({@link WacrmApiClient}) instead of a per-user
 * login. Protected by the same JWT admin auth as every other
 * {@code /admin/**} route (see {@code SecurityConfig}'s
 * {@code /admin/crm/**} rule — ADMIN and WHATSAPP_MANAGER).
 */
@RestController
@RequestMapping("/admin/crm/whatsapp-config")
@RequiredArgsConstructor
public class AdminCrmWhatsappConfigController {

    private final WacrmApiClient wacrm;

    @GetMapping
    public ResponseEntity<String> get() {
        return toResponse(wacrm.forward("/whatsapp/config", HttpMethod.GET, null));
    }

    @PostMapping
    public ResponseEntity<String> save(@RequestBody String body) {
        return toResponse(wacrm.forward("/whatsapp/config", HttpMethod.POST, body));
    }

    @PatchMapping
    public ResponseEntity<String> patch(@RequestBody String body) {
        return toResponse(wacrm.forward("/whatsapp/config", HttpMethod.PATCH, body));
    }

    @DeleteMapping
    public ResponseEntity<String> delete() {
        return toResponse(wacrm.forward("/whatsapp/config", HttpMethod.DELETE, null));
    }

    private ResponseEntity<String> toResponse(WacrmApiClient.ProxyResponse proxied) {
        return ResponseEntity.status(proxied.status())
                .contentType(MediaType.APPLICATION_JSON)
                .body(proxied.body());
    }
}
