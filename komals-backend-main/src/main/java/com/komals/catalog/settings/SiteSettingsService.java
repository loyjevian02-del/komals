package com.komals.catalog.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SiteSettingsService {

    private final SiteSettingsRepository repository;

    /** Returns the single settings row, creating it with defaults on first access. */
    public SiteSettings get() {
        return repository.findAll().stream().findFirst().orElseGet(() -> repository.save(new SiteSettings()));
    }
}
