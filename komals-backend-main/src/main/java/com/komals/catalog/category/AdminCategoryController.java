package com.komals.catalog.category;

import com.komals.catalog.audit.AuditLogService;
import com.komals.catalog.common.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    @GetMapping
    public List<Category> list() {
        return categoryRepository.findAllByOrderByRankAsc();
    }

    @GetMapping("/{id}")
    public Category get(@PathVariable String id) {
        return categoryRepository.findById(id).orElseThrow(() -> ApiException.notFound("Category not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category create(@Valid @RequestBody CategoryRequest req) {
        Category category = new Category();
        apply(category, req);
        Category saved = categoryRepository.save(category);
        auditLogService.record("CREATE", "CATEGORY", saved.getId(), "Created category '" + saved.getName() + "'");
        return saved;
    }

    @PutMapping("/{id}")
    public Category update(@PathVariable String id, @Valid @RequestBody CategoryRequest req) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> ApiException.notFound("Category not found"));
        apply(category, req);
        Category saved = categoryRepository.save(category);
        auditLogService.record("UPDATE", "CATEGORY", saved.getId(), "Updated category '" + saved.getName() + "'");
        return saved;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> ApiException.notFound("Category not found"));
        categoryRepository.deleteById(id);
        auditLogService.record("DELETE", "CATEGORY", id, "Deleted category '" + category.getName() + "'");
    }

    private void apply(Category category, CategoryRequest req) {
        category.setName(req.name());
        category.setSlug(req.slug());
        category.setDescription(req.description());
        category.setImage(req.image());
        category.setRank(req.rank() == null ? 0 : req.rank());
        category.setActive(req.active() == null || req.active());
        category.getGallery().clear();
        if (req.gallery() != null) {
            category.getGallery().addAll(req.gallery());
        }
    }

    public record CategoryRequest(
            @NotBlank String name,
            @NotBlank String slug,
            String description,
            String image,
            Integer rank,
            Boolean active,
            List<String> gallery
    ) {}
}
