package com.jmaart.catalog.product;

import com.jmaart.catalog.category.Category;
import com.jmaart.catalog.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product")
@Getter
@Setter
public class Product extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false, unique = true)
    private String slug;

    /** Product/part number from the supplier catalog. Unique; also used as the image filename base for bulk image import. */
    @Column(name = "part_no", nullable = false, unique = true)
    private String partNo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /** Optional strike-through price to show a discount. */
    @Column(name = "compare_at_price", precision = 10, scale = 2)
    private BigDecimal compareAtPrice;

    private String unit;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_image", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "url")
    @OrderColumn(name = "rank")
    private List<String> images = new ArrayList<>();
}
