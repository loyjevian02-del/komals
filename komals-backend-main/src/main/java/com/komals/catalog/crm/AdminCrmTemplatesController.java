package com.komals.catalog.crm;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Proxies the Templates dashboard endpoints (list/sync/submit/delete)
 * through to wacrm, authenticated with a service API key
 * ({@link WacrmApiClient}) instead of a per-user login. Uses wacrm's
 * `templates:manage` scope — one scope covers the whole lifecycle here,
 * same as `whatsapp_config:manage` covers all of Config. Protected by
 * the same JWT admin auth as every other {@code /admin/**} route (see
 * {@code SecurityConfig}'s {@code /admin/crm/**} rule).
 */
@RestController
@RequestMapping("/admin/crm/templates")
@RequiredArgsConstructor
public class AdminCrmTemplatesController {

    private final WacrmApiClient wacrm;

    @GetMapping
    public ResponseEntity<String> list() {
        return toResponse(wacrm.forward("/whatsapp/templates", HttpMethod.GET, null));
    }

    @PostMapping("/sync")
    public ResponseEntity<String> sync() {
        return toResponse(wacrm.forward("/whatsapp/templates/sync", HttpMethod.POST, null));
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submit(@RequestBody String body) {
        return toResponse(wacrm.forward("/whatsapp/templates/submit", HttpMethod.POST, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable String id) {
        return toResponse(wacrm.forward("/whatsapp/templates/" + id, HttpMethod.DELETE, null));
    }

    private ResponseEntity<String> toResponse(WacrmApiClient.ProxyResponse proxied) {
        return ResponseEntity.status(proxied.status())
                .contentType(MediaType.APPLICATION_JSON)
                .body(proxied.body());
    }
}
