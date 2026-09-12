package com.jmaart.catalog.lead;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeadRepository extends JpaRepository<Lead, String> {
    List<Lead> findAllByOrderByCreatedAtDesc();
    Optional<Lead> findByWaConversationId(String waConversationId);
}
