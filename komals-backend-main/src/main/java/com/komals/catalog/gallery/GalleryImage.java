package com.komals.catalog.gallery;

import com.komals.catalog.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** A single photo shown in the storefront's gallery/mosaic section. */
@Entity
@Table(name = "gallery_image")
@Getter
@Setter
public class GalleryImage extends BaseEntity {

    @Column(nullable = false)
    private String image;

    private String caption;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private int rank = 0;
}
