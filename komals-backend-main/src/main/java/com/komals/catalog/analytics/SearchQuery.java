package com.komals.catalog.analytics;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "search_query")
public class SearchQuery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String visitorId;

    @Column(nullable = false)
    private String query;

    @Column(nullable = false)
    private Instant searchedAt = Instant.now();

    public Long getId() { return id; }
    public String getVisitorId() { return visitorId; }
    public void setVisitorId(String visitorId) { this.visitorId = visitorId; }
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public Instant getSearchedAt() { return searchedAt; }
}
