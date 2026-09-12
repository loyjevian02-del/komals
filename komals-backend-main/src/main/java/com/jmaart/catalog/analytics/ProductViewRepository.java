package com.jmaart.catalog.analytics;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductViewRepository extends JpaRepository<ProductView, Long> {

    @Query("select v.productId as productId, count(v) as count from ProductView v group by v.productId order by count(v) desc")
    List<ProductCount> topProducts(Pageable pageable);

    interface ProductCount {
        String getProductId();
        long getCount();
    }
}
