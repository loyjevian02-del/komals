package com.jmaart.catalog.offer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, String> {
    List<Offer> findAllByOrderByRankAsc();
    List<Offer> findAllByActiveTrueOrderByRankAsc();
}
