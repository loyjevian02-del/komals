package com.komals.catalog.settings;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final SiteSettingsRepository repository;
    private final SiteSettingsService settingsService;

    @GetMapping
    public SiteSettings get() {
        return settingsService.get();
    }

    @PutMapping
    public SiteSettings update(@Valid @RequestBody SettingsRequest req) {
        SiteSettings settings = settingsService.get();
        settings.setSiteName(req.siteName());
        settings.setLogo(req.logo());
        settings.setContactPhone(req.contactPhone());
        settings.setSupportPhone(req.supportPhone());
        settings.setContactEmail(req.contactEmail());
        settings.setAddress(req.address());
        settings.setMapsUrl(req.mapsUrl());
        settings.setWhatsappNumber(req.whatsappNumber());
        settings.setWhatsappCommunityUrl(req.whatsappCommunityUrl());
        settings.setFacebookUrl(req.facebookUrl());
        settings.setInstagramUrl(req.instagramUrl());
        settings.setStoreHours(req.storeHours());
        settings.setStoryEyebrow(req.storyEyebrow());
        settings.setStoryHeading(req.storyHeading());
        settings.setStoryBody(req.storyBody());
        settings.setStoryImage(req.storyImage());
        return repository.save(settings);
    }

    public record SettingsRequest(
            @NotBlank String siteName,
            String logo,
            String contactPhone,
            String supportPhone,
            String contactEmail,
            String address,
            String mapsUrl,
            String whatsappNumber,
            String whatsappCommunityUrl,
            String facebookUrl,
            String instagramUrl,
            String storeHours,
            String storyEyebrow,
            String storyHeading,
            String storyBody,
            String storyImage) {
    }
}
