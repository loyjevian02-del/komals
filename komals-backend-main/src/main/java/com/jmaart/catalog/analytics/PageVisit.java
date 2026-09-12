package com.jmaart.catalog.analytics;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "page_visit")
public class PageVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String path;

    @Column(nullable = false)
    private Instant visitedAt = Instant.now();

    public Long getId() { return id; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public Instant getVisitedAt() { return visitedAt; }
}
