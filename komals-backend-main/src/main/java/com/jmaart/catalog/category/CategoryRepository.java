package com.jmaart.catalog.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findAllByOrderByRankAsc();
    List<Category> findAllByActiveTrueOrderByRankAsc();
    Optional<Category> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
