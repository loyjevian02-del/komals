package com.jmaart.catalog.offer;

import com.jmaart.catalog.audit.AuditLogService;
import com.jmaart.catalog.common.ApiException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/admin/offers")
@RequiredArgsConstructor
public class AdminOfferController {

    private final OfferRepository offerRepository;
    private final AuditLogService auditLogService;

    @GetMapping
    public List<Offer> list() {
        return offerRepository.findAllByOrderByRankAsc();
    }

    @GetMapping("/{id}")
    public Offer get(@PathVariable String id) {
        return offerRepository.findById(id).orElseThrow(() -> ApiException.notFound("Offer not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Offer create(@Valid @RequestBody OfferRequest req) {
        Offer offer = new Offer();
        apply(offer, req);
        Offer saved = offerRepository.save(offer);
        auditLogService.record("CREATE", "OFFER", saved.getId(), "Created offer '" + saved.getTitle() + "'");
        return saved;
    }

    @PutMapping("/{id}")
    public Offer update(@PathVariable String id, @Valid @RequestBody OfferRequest req) {
        Offer offer = offerRepository.findById(id).orElseThrow(() -> ApiException.notFound("Offer not found"));
        apply(offer, req);
        Offer saved = offerRepository.save(offer);
        auditLogService.record("UPDATE", "OFFER", saved.getId(), "Updated offer '" + saved.getTitle() + "'");
        return saved;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        Offer offer = offerRepository.findById(id).orElseThrow(() -> ApiException.notFound("Offer not found"));
        offerRepository.deleteById(id);
        auditLogService.record("DELETE", "OFFER", id, "Deleted offer '" + offer.getTitle() + "'");
    }

    private void apply(Offer offer, OfferRequest req) {
        offer.setTitle(req.title() == null ? "" : req.title());
        offer.setDescription(req.description());
        offer.setImage(req.image());
        offer.setBadge(req.badge());
        offer.setShowText(req.showText() != null && req.showText());
        offer.setStartsAt(req.startsAt());
        offer.setEndsAt(req.endsAt());
        offer.setActive(req.active() == null || req.active());
        offer.setRank(req.rank() == null ? 0 : req.rank());
        offer.setDisplayType(req.displayType() == null ? Offer.DisplayType.SCROLLABLE : req.displayType());
    }

    public record OfferRequest(
            String title,
            String description,
            String image,
            String badge,
            Boolean showText,
            Instant startsAt,
            Instant endsAt,
            Boolean active,
            Integer rank,
            Offer.DisplayType displayType
    ) {}
}
