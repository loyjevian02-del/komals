package com.komals.catalog.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySlugIgnoreCase(String slug);

    boolean existsBySlug(String slug);

    Optional<Product> findByPartNo(String partNo);

    Optional<Product> findByPartNoIgnoreCase(String partNo);

    List<Product> findAllByActiveTrueAndCategory_SlugOrderByTitleAsc(String categorySlug);

    boolean existsByActiveTrueAndCategory_Id(String categoryId);

    List<Product> findAllByActiveTrueOrderByTitleAsc();

    @Query("select p from Product p where p.active = true and lower(p.title) like lower(concat('%', :q, '%'))")
    List<Product> search(@Param("q") String query);
}
