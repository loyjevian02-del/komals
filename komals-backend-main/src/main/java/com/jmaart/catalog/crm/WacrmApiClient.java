package com.jmaart.catalog.crm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

/**
 * Server-to-server client for wacrm (the WhatsApp CRM), authenticated
 * with a service API key — never a per-user login. This is the ONLY
 * thing in jmart that talks to wacrm directly; jmart-admin only ever
 * calls jmart-backend's {@code /admin/crm/**} controllers, which use
 * this client underneath. Keeps wacrm invisible to the client, per the
 * integration's core requirement.
 */
@Component
public class WacrmApiClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.wacrm.base-url}")
    private String baseUrl;

    @Value("${app.wacrm.api-key}")
    private String apiKey;

    /** Raw JSON in, raw JSON out — this is a transparent proxy, not a typed client. */
    public ProxyResponse forward(String path, HttpMethod method, String jsonBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + path, method, entity, String.class);
            return new ProxyResponse(response.getStatusCode().value(), response.getBody());
        } catch (HttpStatusCodeException ex) {
            // wacrm's own error responses (400/401/403/404/...) — pass the
            // status and body straight through so jmart-admin sees the
            // real error message, not a generic 500.
            return new ProxyResponse(ex.getStatusCode().value(), ex.getResponseBodyAsString());
        }
    }

    public record ProxyResponse(int status, String body) {}
}
