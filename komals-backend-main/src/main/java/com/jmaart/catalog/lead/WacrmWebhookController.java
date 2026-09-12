package com.jmaart.catalog.lead;

import com.jmaart.catalog.common.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/** Receives lead events pushed by wacrm's automation builder (e.g. "on deal moved to Won"). */
@RestController
@RequestMapping("/webhooks/wacrm")
@RequiredArgsConstructor
public class WacrmWebhookController {

    private final LeadRepository leadRepository;

    @Value("${app.wacrm.webhook-secret}")
    private String webhookSecret;

    @PostMapping("/leads")
    @ResponseStatus(HttpStatus.CREATED)
    public Lead receiveLead(
            @RequestHeader(value = "X-Webhook-Secret", required = false) String secret,
            @Valid @RequestBody LeadWebhookRequest req
    ) {
        if (secret == null || !secret.equals(webhookSecret)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "invalid webhook secret");
        }

        Lead lead = (req.waConversationId() != null)
                ? leadRepository.findByWaConversationId(req.waConversationId()).orElseGet(Lead::new)
                : new Lead();

        lead.setCustomerName(req.customerName());
        lead.setCustomerPhone(req.customerPhone());
        lead.setProductId(req.productId());
        lead.setProductTitle(req.productTitle());
        lead.setMessage(req.message());
        lead.setStatus(req.status() == null ? Lead.Status.NEW : req.status());
        lead.setAmount(req.amount());
        lead.setWaConversationId(req.waConversationId());

        return leadRepository.save(lead);
    }

    public record LeadWebhookRequest(
            String customerName,
            @NotBlank String customerPhone,
            String productId,
            String productTitle,
            String message,
            Lead.Status status,
            BigDecimal amount,
            String waConversationId
    ) {}
}
