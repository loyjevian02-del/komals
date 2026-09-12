package com.jmaart.catalog.crm;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Proxies the Inbox/Conversations dashboard endpoints through to wacrm,
 * authenticated with a service API key ({@link WacrmApiClient}) instead
 * of a per-user login. Reuses wacrm's existing `conversations:read` /
 * `messages:send` scopes — same permission meaning as the public
 * `/api/v1` endpoints, just a different (dashboard-shaped) response.
 * Protected by the same JWT admin auth as every other {@code /admin/**}
 * route (see {@code SecurityConfig}'s {@code /admin/crm/**} rule).
 */
@RestController
@RequestMapping("/admin/crm")
@RequiredArgsConstructor
public class AdminCrmConversationsController {

    private final WacrmApiClient wacrm;

    @GetMapping("/conversations")
    public ResponseEntity<String> listConversations() {
        return toResponse(wacrm.forward("/conversations", HttpMethod.GET, null));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<String> listMessages(@PathVariable String id) {
        return toResponse(wacrm.forward("/conversations/" + id + "/messages", HttpMethod.GET, null));
    }

    @PostMapping("/messages/send")
    public ResponseEntity<String> sendMessage(@RequestBody String body) {
        return toResponse(wacrm.forward("/whatsapp/send", HttpMethod.POST, body));
    }

    private ResponseEntity<String> toResponse(WacrmApiClient.ProxyResponse proxied) {
        return ResponseEntity.status(proxied.status())
                .contentType(MediaType.APPLICATION_JSON)
                .body(proxied.body());
    }
}
