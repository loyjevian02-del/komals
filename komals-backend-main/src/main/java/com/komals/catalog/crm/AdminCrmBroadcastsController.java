package com.komals.catalog.crm;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Proxies the Broadcasts dashboard endpoints through to wacrm,
 * authenticated with a service API key ({@link WacrmApiClient}) instead
 * of a per-user login. Uses wacrm's `broadcasts:manage` scope — a
 * dashboard-scoped scope distinct from the public API's
 * `broadcasts:send` (write-only); this controller also needs to list
 * broadcast history. Protected by the same JWT admin auth as every
 * other {@code /admin/**} route (see {@code SecurityConfig}'s
 * {@code /admin/crm/**} rule).
 */
@RestController
@RequestMapping("/admin/crm/broadcasts")
@RequiredArgsConstructor
public class AdminCrmBroadcastsController {

    private final WacrmApiClient wacrm;

    @GetMapping
    public ResponseEntity<String> list() {
        return toResponse(wacrm.forward("/whatsapp/broadcast", HttpMethod.GET, null));
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody String body) {
        return toResponse(wacrm.forward("/whatsapp/broadcast", HttpMethod.POST, body));
    }

    private ResponseEntity<String> toResponse(WacrmApiClient.ProxyResponse proxied) {
        return ResponseEntity.status(proxied.status())
                .contentType(MediaType.APPLICATION_JSON)
                .body(proxied.body());
    }
}
