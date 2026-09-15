package com.komals.catalog.product;

import com.komals.catalog.common.ApiException;
import com.komals.catalog.common.PageResponse;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/store/products")
@RequiredArgsConstructor
public class StoreProductController {

    private final ProductRepository productRepository;

    @GetMapping
    public PageResponse<ProductDTO> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "title,asc") String sort
    ) {
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0].trim();
        Sort.Direction direction = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc"))
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        if (!List.of("title", "price", "createdAt", "partNo").contains(sortField)) {
            sortField = "title";
        }

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)), Sort.by(direction, sortField));

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("active")));

            if (q != null && !q.isBlank()) {
                String searchPattern = "%" + q.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), searchPattern),
                        cb.like(cb.lower(root.get("partNo")), searchPattern),
                        cb.like(cb.lower(cb.coalesce(root.get("description"), "")), searchPattern),
                        cb.like(cb.lower(cb.coalesce(root.get("searchKeywords"), "")), searchPattern),
                        cb.like(cb.lower(cb.coalesce(root.get("category").get("name"), "")), searchPattern)
                ));
            }

            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("category").get("slug")), category.trim().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        return PageResponse.of(productPage.map(ProductDTO::from));
    }

    @GetMapping("/{slug:.+}")
    public ProductDTO get(@PathVariable String slug) {
        String decoded = slug;
        try {
            decoded = URLDecoder.decode(slug, StandardCharsets.UTF_8);
        } catch (Exception ignored) {}

        final String dec = decoded;
        Product product = productRepository.findBySlug(slug)
                .or(() -> productRepository.findBySlug(dec))
                .or(() -> productRepository.findBySlugIgnoreCase(slug))
                .or(() -> productRepository.findBySlugIgnoreCase(dec))
                .or(() -> productRepository.findById(slug))
                .or(() -> productRepository.findById(dec))
                .or(() -> productRepository.findByPartNo(slug))
                .or(() -> productRepository.findByPartNo(dec))
                .orElseThrow(() -> ApiException.notFound("Product not found"));

        return ProductDTO.from(product);
    }
}
