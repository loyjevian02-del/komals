package com.jmaart.catalog.crm;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Proxies the Contacts dashboard endpoints through to wacrm,
 * authenticated with a service API key ({@link WacrmApiClient}) instead
 * of a per-user login. Reuses wacrm's existing `contacts:read` /
 * `contacts:write` scopes. Protected by the same JWT admin auth as
 * every other {@code /admin/**} route (see {@code SecurityConfig}'s
 * {@code /admin/crm/**} rule).
 */
@RestController
@RequestMapping("/admin/crm/contacts")
@RequiredArgsConstructor
public class AdminCrmContactsController {

    private final WacrmApiClient wacrm;

    @GetMapping
    public ResponseEntity<String> list() {
        return toResponse(wacrm.forward("/contacts", HttpMethod.GET, null));
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody String body) {
        return toResponse(wacrm.forward("/contacts", HttpMethod.POST, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable String id) {
        return toResponse(wacrm.forward("/contacts/" + id, HttpMethod.DELETE, null));
    }

    private ResponseEntity<String> toResponse(WacrmApiClient.ProxyResponse proxied) {
        return ResponseEntity.status(proxied.status())
                .contentType(MediaType.APPLICATION_JSON)
                .body(proxied.body());
    }
}
