package com.komals.catalog.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/store/settings")
@RequiredArgsConstructor
public class StoreSettingsController {

    private final SiteSettingsService settingsService;

    @GetMapping
    public SiteSettings get() {
        return settingsService.get();
    }
}
