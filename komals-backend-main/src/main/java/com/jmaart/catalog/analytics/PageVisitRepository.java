package com.jmaart.catalog.analytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;

public interface PageVisitRepository extends JpaRepository<PageVisit, Long> {
    long count();

    @Query("select count(v) from PageVisit v where v.visitedAt >= :since")
    long countSince(Instant since);
}
