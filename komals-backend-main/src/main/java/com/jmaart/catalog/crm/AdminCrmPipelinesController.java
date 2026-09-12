package com.jmaart.catalog.crm;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Proxies the Pipelines/Deals dashboard endpoints through to wacrm,
 * authenticated with a service API key ({@link WacrmApiClient}) instead
 * of a per-user login. Uses wacrm's `pipelines:manage` scope — one
 * scope covers pipelines/stages/deals read+write here, same pattern as
 * `whatsapp_config:manage` and `templates:manage`. Protected by the
 * same JWT admin auth as every other {@code /admin/**} route (see
 * {@code SecurityConfig}'s {@code /admin/crm/**} rule).
 */
@RestController
@RequestMapping("/admin/crm")
@RequiredArgsConstructor
public class AdminCrmPipelinesController {

    private final WacrmApiClient wacrm;

    @GetMapping("/pipelines")
    public ResponseEntity<String> listPipelines() {
        return toResponse(wacrm.forward("/pipelines", HttpMethod.GET, null));
    }

    @GetMapping("/pipelines/{id}/stages")
    public ResponseEntity<String> listStages(@PathVariable String id) {
        return toResponse(wacrm.forward("/pipelines/" + id + "/stages", HttpMethod.GET, null));
    }

    @GetMapping("/pipelines/{id}/deals")
    public ResponseEntity<String> listDeals(@PathVariable String id) {
        return toResponse(wacrm.forward("/pipelines/" + id + "/deals", HttpMethod.GET, null));
    }

    @PostMapping("/pipelines/{id}/deals")
    public ResponseEntity<String> createDeal(@PathVariable String id, @RequestBody String body) {
        return toResponse(wacrm.forward("/pipelines/" + id + "/deals", HttpMethod.POST, body));
    }

    @PatchMapping("/deals/{id}")
    public ResponseEntity<String> updateDeal(@PathVariable String id, @RequestBody String body) {
        return toResponse(wacrm.forward("/deals/" + id, HttpMethod.PATCH, body));
    }

    @DeleteMapping("/deals/{id}")
    public ResponseEntity<String> deleteDeal(@PathVariable String id) {
        return toResponse(wacrm.forward("/deals/" + id, HttpMethod.DELETE, null));
    }

    private ResponseEntity<String> toResponse(WacrmApiClient.ProxyResponse proxied) {
        return ResponseEntity.status(proxied.status())
                .contentType(MediaType.APPLICATION_JSON)
                .body(proxied.body());
    }
}
