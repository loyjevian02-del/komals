package com.jmaart.catalog.product;

import java.math.BigDecimal;
import java.util.List;

public record ProductDTO(
        String id,
        String title,
        String description,
        String slug,
        String partNo,
        BigDecimal price,
        BigDecimal compareAtPrice,
        String unit,
        boolean active,
        String categoryId,
        String categoryName,
        String categorySlug,
        List<String> images
) {
    public static ProductDTO from(Product p) {
        return new ProductDTO(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                p.getSlug(),
                p.getPartNo(),
                p.getPrice(),
                p.getCompareAtPrice(),
                p.getUnit(),
                p.isActive(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getCategory() != null ? p.getCategory().getSlug() : null,
                p.getImages()
        );
    }
}
