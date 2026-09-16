package com.komals.catalog.settings;

import com.komals.catalog.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** Singleton row holding site-wide branding and contact info, editable from the admin panel. */
@Entity
@Table(name = "site_settings")
@Getter
@Setter
public class SiteSettings extends BaseEntity {

    @Column(nullable = false)
    private String siteName = "Jayalakshmi Hyper Market";

    private String logo;

    private String contactPhone;
    private String supportPhone;
    private String contactEmail;

    @Column(columnDefinition = "text")
    private String address;

    private String mapsUrl;

    private String whatsappNumber;
    private String whatsappCommunityUrl;
    private String facebookUrl;
    private String instagramUrl;

    @Column(columnDefinition = "text")
    private String storeHours;

    private String storyEyebrow;
    private String storyHeading;

    @Column(columnDefinition = "text")
    private String storyBody;
    private String storyImage;

    /** Full HTML body of the Terms & Conditions page, editable from the admin panel. */
    @Column(columnDefinition = "text")
    private String termsContent;

    /** Full HTML body of the Privacy Policy page, editable from the admin panel. */
    @Column(columnDefinition = "text")
    private String privacyContent;
}
