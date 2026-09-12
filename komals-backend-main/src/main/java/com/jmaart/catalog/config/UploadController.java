package com.jmaart.catalog.config;

import com.jmaart.catalog.common.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final ImageCompressionService imageCompressionService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final java.util.Set<String> ALLOWED_TYPES =
            java.util.Set.of("image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml");

    // Allow smartphone camera uploads up to 50MB which will then be compressed below 500KB
    private static final long MAX_FILE_SIZE = 50L * 1024 * 1024;

    @PostMapping
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPEG, PNG, WEBP, GIF or SVG images are allowed");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image must be under 50MB");
        }

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : ".jpg";
        String cleanExt = ext.replaceAll("[^a-zA-Z0-9.]", "").toLowerCase();
        if (cleanExt.isBlank()) cleanExt = ".jpg";

        // Save as .jpg for compressed raster images or keep .svg/.gif
        String outputExt = ("svg".equals(cleanExt.replace(".", "")) || "gif".equals(cleanExt.replace(".", ""))) ? cleanExt : ".jpg";
        String filename = UUID.randomUUID() + outputExt;

        try {
            Path dir = Path.of(uploadDir);
            Files.createDirectories(dir);
            Path target = dir.resolve(filename).normalize();
            imageCompressionService.compressAndSave(file.getBytes(), cleanExt, target);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to compress and store file: " + e.getMessage());
        }

        return Map.of("url", "/uploads/" + filename);
    }
}
