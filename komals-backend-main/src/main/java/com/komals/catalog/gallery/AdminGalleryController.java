package com.komals.catalog.gallery;

import com.komals.catalog.audit.AuditLogService;
import com.komals.catalog.common.ApiException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/gallery")
@RequiredArgsConstructor
public class AdminGalleryController {

    private final GalleryImageRepository galleryImageRepository;
    private final AuditLogService auditLogService;

    @GetMapping
    public List<GalleryImage> list() {
        return galleryImageRepository.findAllByOrderByRankAsc();
    }

    @GetMapping("/{id}")
    public GalleryImage get(@PathVariable String id) {
        return galleryImageRepository.findById(id).orElseThrow(() -> ApiException.notFound("Gallery image not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GalleryImage create(@Valid @RequestBody GalleryImageRequest req) {
        GalleryImage img = new GalleryImage();
        apply(img, req);
        GalleryImage saved = galleryImageRepository.save(img);
        auditLogService.record("CREATE", "GALLERY_IMAGE", saved.getId(), "Added gallery image");
        return saved;
    }

    @PutMapping("/{id}")
    public GalleryImage update(@PathVariable String id, @Valid @RequestBody GalleryImageRequest req) {
        GalleryImage img = galleryImageRepository.findById(id).orElseThrow(() -> ApiException.notFound("Gallery image not found"));
        apply(img, req);
        GalleryImage saved = galleryImageRepository.save(img);
        auditLogService.record("UPDATE", "GALLERY_IMAGE", saved.getId(), "Updated gallery image");
        return saved;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        galleryImageRepository.findById(id).orElseThrow(() -> ApiException.notFound("Gallery image not found"));
        galleryImageRepository.deleteById(id);
        auditLogService.record("DELETE", "GALLERY_IMAGE", id, "Deleted gallery image");
    }

    private void apply(GalleryImage img, GalleryImageRequest req) {
        img.setImage(req.image() == null ? "" : req.image());
        img.setCaption(req.caption());
        img.setActive(req.active() == null || req.active());
        img.setRank(req.rank() == null ? 0 : req.rank());
    }

    public record GalleryImageRequest(
            String image,
            String caption,
            Boolean active,
            Integer rank
    ) {}
}
