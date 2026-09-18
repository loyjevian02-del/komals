package com.komals.catalog.gallery;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/store/gallery")
@RequiredArgsConstructor
public class StoreGalleryController {

    private final GalleryImageRepository galleryImageRepository;

    @GetMapping
    public List<GalleryImage> list() {
        return galleryImageRepository.findAllByActiveTrueOrderByRankAsc();
    }
}
