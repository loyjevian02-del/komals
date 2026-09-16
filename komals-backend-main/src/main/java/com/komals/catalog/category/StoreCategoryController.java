package com.komals.catalog.category;

import com.komals.catalog.common.ApiException;
import com.komals.catalog.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/store/categories")
@RequiredArgsConstructor
public class StoreCategoryController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @GetMapping
    public List<Category> list() {
        return categoryRepository.findAllByActiveTrueOrderByRankAsc().stream()
                .filter(c -> productRepository.existsByActiveTrueAndCategory_Id(c.getId()))
                .toList();
    }

    @GetMapping("/{slug}")
    public Category get(@PathVariable String slug) {
        return categoryRepository.findBySlug(slug)
                .filter(Category::isActive)
                .orElseThrow(() -> ApiException.notFound("Category not found"));
    }
}
