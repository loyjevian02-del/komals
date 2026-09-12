package com.jmaart.catalog.analytics;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "product_view")
public class ProductView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String visitorId;

    @Column(nullable = false)
    private String productId;

    @Column(nullable = false)
    private Instant viewedAt = Instant.now();

    public Long getId() { return id; }
    public String getVisitorId() { return visitorId; }
    public void setVisitorId(String visitorId) { this.visitorId = visitorId; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public Instant getViewedAt() { return viewedAt; }
}
