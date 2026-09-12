package com.jmaart.catalog.analytics;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SearchQueryRepository extends JpaRepository<SearchQuery, Long> {

    List<SearchQuery> findAllByVisitorIdOrderBySearchedAtDesc(String visitorId);

    @Query("select s.query as query, count(s) as count from SearchQuery s group by s.query order by count(s) desc")
    List<QueryCount> topQueries(Pageable pageable);

    interface QueryCount {
        String getQuery();
        long getCount();
    }
}
