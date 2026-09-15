package com.komals.catalog.offer;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/store/offers")
@RequiredArgsConstructor
public class StoreOfferController {

    private final OfferRepository offerRepository;

    @GetMapping
    public List<Offer> list() {
        return offerRepository.findAllByActiveTrueOrderByRankAsc();
    }
}
