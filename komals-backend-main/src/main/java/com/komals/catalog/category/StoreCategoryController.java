package com.komals.catalog.category;

import com.komals.catalog.common.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/store/categories")
@RequiredArgsConstructor
public class StoreCategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public List<Category> list() {
        return categoryRepository.findAllByActiveTrueOrderByRankAsc();
    }

    @GetMapping("/{slug}")
    public Category get(@PathVariable String slug) {
        return categoryRepository.findBySlug(slug)
                .filter(Category::isActive)
                .orElseThrow(() -> ApiException.notFound("Category not found"));
    }
}
