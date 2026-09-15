package com.komals.catalog.offer;

import com.komals.catalog.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/** A promotional banner/offer shown on the storefront home page. */
@Entity
@Table(name = "offer")
@Getter
@Setter
public class Offer extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    private String image;

    /** Optional badge text, e.g. "20% OFF". */
    private String badge;

    /** Whether title/badge/description render on the storefront, or the image is shown alone. */
    private Boolean showText;

    private Instant startsAt;
    private Instant endsAt;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private int rank = 0;

    /** Whether this offer shows in the single static banner or the auto-scrolling carousel. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DisplayType displayType = DisplayType.SCROLLABLE;

    public enum DisplayType { FIXED, SCROLLABLE }
}
