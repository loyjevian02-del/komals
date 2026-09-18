package com.komals.catalog.gallery;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GalleryImageRepository extends JpaRepository<GalleryImage, String> {
    List<GalleryImage> findAllByOrderByRankAsc();
    List<GalleryImage> findAllByActiveTrueOrderByRankAsc();
}
