package com.komals.catalog.category;

import com.komals.catalog.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "category")
@Getter
@Setter
public class Category extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "text")
    private String description;

    private String image;

    @Column(nullable = false)
    private int rank = 0;

    @Column(nullable = false)
    private boolean active = true;

    /** Shown on the storefront category page as a browsable photo gallery when no products exist yet. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "category_gallery", joinColumns = @JoinColumn(name = "category_id"))
    @Column(name = "url")
    @OrderColumn(name = "rank")
    private List<String> gallery = new ArrayList<>();
}
