package com.jmaart.catalog.product;

import com.jmaart.catalog.audit.AuditLogService;
import com.jmaart.catalog.category.Category;
import com.jmaart.catalog.category.CategoryRepository;
import com.jmaart.catalog.common.ApiException;
import com.jmaart.catalog.common.PageResponse;
import jakarta.persistence.criteria.Predicate;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    @GetMapping
    public PageResponse<ProductDTO> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0].trim();
        Sort.Direction direction = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        // Map allowed sort fields to prevent invalid property errors
        if (!List.of("createdAt", "updatedAt", "title", "price", "partNo").contains(sortField)) {
            sortField = "createdAt";
        }

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)), Sort.by(direction, sortField));

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                String searchPattern = "%" + q.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), searchPattern),
                        cb.like(cb.lower(root.get("partNo")), searchPattern)
                ));
            }

            if (categoryId != null && !categoryId.isBlank()) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId.trim()));
            }

            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        Page<ProductDTO> dtoPage = productPage.map(ProductDTO::from);

        return PageResponse.of(dtoPage);
    }

    @GetMapping("/{id}")
    public ProductDTO get(@PathVariable String id) {
        return ProductDTO.from(productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found")));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDTO create(@Valid @RequestBody ProductRequest req) {
        Product product = new Product();
        apply(product, req);
        Product saved = productRepository.save(product);
        auditLogService.record("CREATE", "PRODUCT", saved.getId(), "Created product '" + saved.getTitle() + "'");
        return ProductDTO.from(saved);
    }

    @PutMapping("/{id}")
    public ProductDTO update(@PathVariable String id, @Valid @RequestBody ProductRequest req) {
        Product product = productRepository.findById(id).orElseThrow(() -> ApiException.notFound("Product not found"));
        List<String> oldImages = new ArrayList<>(product.getImages());
        apply(product, req);
        Product saved = productRepository.save(product);

        List<String> newImages = saved.getImages();
        List<String> added = new ArrayList<>(newImages);
        added.removeAll(oldImages);
        List<String> removed = new ArrayList<>(oldImages);
        removed.removeAll(newImages);
        if (!added.isEmpty()) {
            auditLogService.record("ADD_IMAGE", "PRODUCT", saved.getId(),
                    "Added " + added.size() + " image(s) to '" + saved.getTitle() + "'");
        }
        if (!removed.isEmpty()) {
            auditLogService.record("DELETE_IMAGE", "PRODUCT", saved.getId(),
                    "Removed " + removed.size() + " image(s) from '" + saved.getTitle() + "'");
        }
        auditLogService.record("UPDATE", "PRODUCT", saved.getId(), "Updated product '" + saved.getTitle() + "'");
        return ProductDTO.from(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        Product product = productRepository.findById(id).orElseThrow(() -> ApiException.notFound("Product not found"));
        productRepository.deleteById(id);
        auditLogService.record("DELETE", "PRODUCT", id, "Deleted product '" + product.getTitle() + "'");
    }

    private void apply(Product product, ProductRequest req) {
        product.setTitle(req.title());
        product.setDescription(req.description());
        product.setSlug(req.slug());
        product.setPartNo(req.partNo() == null ? null : req.partNo().trim());
        product.setPrice(req.price());
        product.setCompareAtPrice(req.compareAtPrice());
        product.setUnit(req.unit());
        product.setActive(req.active() == null || req.active());
        product.setImages(req.images() == null ? List.of() : req.images());
        if (req.categoryId() != null) {
            Category category = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> ApiException.notFound("Category not found"));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }
    }

    public record ProductRequest(
            @NotBlank String title,
            String description,
            @NotBlank String slug,
            @NotBlank String partNo,
            @NotNull @PositiveOrZero BigDecimal price,
            BigDecimal compareAtPrice,
            String unit,
            Boolean active,
            String categoryId,
            List<String> images
    ) {}
}
