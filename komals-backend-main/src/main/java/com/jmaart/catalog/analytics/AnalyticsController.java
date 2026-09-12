package com.jmaart.catalog.analytics;

import com.jmaart.catalog.product.Product;
import com.jmaart.catalog.product.ProductRepository;
import com.jmaart.catalog.category.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AnalyticsController {

    private final PageVisitRepository pageVisitRepository;
    private final SearchQueryRepository searchQueryRepository;
    private final ProductViewRepository productViewRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    /** Called by the storefront on each page view. Fire-and-forget, no auth needed. */
    @PostMapping("/store/analytics/visit")
    public void recordVisit(@RequestBody Map<String, String> body) {
        PageVisit visit = new PageVisit();
        visit.setPath(body.getOrDefault("path", "/"));
        pageVisitRepository.save(visit);
    }

    /** Called by the storefront when a customer submits a search. */
    @PostMapping("/store/analytics/search")
    public void recordSearch(@RequestHeader(value = "X-Visitor-Id", required = false) String visitorId,
                              @RequestBody Map<String, String> body) {
        String q = body.getOrDefault("query", "").trim();
        if (q.isEmpty() || visitorId == null || visitorId.isBlank()) return;
        SearchQuery search = new SearchQuery();
        search.setVisitorId(visitorId);
        search.setQuery(q);
        searchQueryRepository.save(search);
    }

    /** Called by the storefront when a customer opens a product detail page. */
    @PostMapping("/store/analytics/product-view")
    public void recordProductView(@RequestHeader(value = "X-Visitor-Id", required = false) String visitorId,
                                   @RequestBody Map<String, String> body) {
        String productId = body.getOrDefault("productId", "");
        if (productId.isEmpty() || visitorId == null || visitorId.isBlank()) return;
        ProductView view = new ProductView();
        view.setVisitorId(visitorId);
        view.setProductId(productId);
        productViewRepository.save(view);
    }

    @GetMapping("/admin/analytics/summary")
    public Map<String, Object> summary() {
        Instant since24h = Instant.now().minus(1, ChronoUnit.DAYS);
        Instant since7d = Instant.now().minus(7, ChronoUnit.DAYS);
        return Map.of(
                "totalVisits", pageVisitRepository.count(),
                "visitsLast24h", pageVisitRepository.countSince(since24h),
                "visitsLast7d", pageVisitRepository.countSince(since7d),
                "totalProducts", productRepository.count(),
                "totalCategories", categoryRepository.count()
        );
    }

    /** Most-searched terms across all visitors, highest count first. */
    @GetMapping("/admin/analytics/top-searches")
    public List<SearchQueryRepository.QueryCount> topSearches() {
        return searchQueryRepository.topQueries(PageRequest.of(0, 20));
    }

    /** A single visitor's search history, most recent first. */
    @GetMapping("/admin/analytics/visitors/{visitorId}/searches")
    public List<SearchQuery> visitorSearches(@PathVariable String visitorId) {
        return searchQueryRepository.findAllByVisitorIdOrderBySearchedAtDesc(visitorId);
    }

    /** Most-viewed products across all visitors, highest view count first. */
    @GetMapping("/admin/analytics/top-products")
    public List<Map<String, Object>> topProducts() {
        return productViewRepository.topProducts(PageRequest.of(0, 20)).stream()
                .map(row -> {
                    Product product = productRepository.findById(row.getProductId()).orElse(null);
                    return Map.<String, Object>of(
                            "productId", row.getProductId(),
                            "title", product != null ? product.getTitle() : "(deleted product)",
                            "views", row.getCount()
                    );
                })
                .toList();
    }
}
