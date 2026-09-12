package com.jmaart.catalog.lead;

import com.jmaart.catalog.common.ApiException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/admin/leads")
@RequiredArgsConstructor
public class AdminLeadController {

    private final LeadRepository leadRepository;

    @GetMapping
    public List<Lead> list() {
        return leadRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public Lead get(@PathVariable String id) {
        return leadRepository.findById(id).orElseThrow(() -> ApiException.notFound("Lead not found"));
    }

    @PutMapping("/{id}")
    public Lead update(@PathVariable String id, @Valid @RequestBody LeadUpdateRequest req) {
        Lead lead = leadRepository.findById(id).orElseThrow(() -> ApiException.notFound("Lead not found"));
        if (req.status() != null) {
            lead.setStatus(req.status());
        }
        if (req.amount() != null) {
            lead.setAmount(req.amount());
        }
        return leadRepository.save(lead);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        if (!leadRepository.existsById(id)) {
            throw ApiException.notFound("Lead not found");
        }
        leadRepository.deleteById(id);
    }

    public record LeadUpdateRequest(
            Lead.Status status,
            BigDecimal amount
    ) {}
}
