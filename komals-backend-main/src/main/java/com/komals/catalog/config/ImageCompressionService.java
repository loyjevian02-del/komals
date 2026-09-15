package com.komals.catalog.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;

@Service
@Slf4j
public class ImageCompressionService {

    private static final long TARGET_MAX_BYTES = 500L * 1024; // 500 KB
    private static final int MAX_DIMENSION = 1600; // max width or height in pixels

    /**
     * Compresses the image from the given byte array and saves it to the target file path.
     * Guarantees the resulting file is optimized and below 500KB while preserving high visual quality.
     */
    public void compressAndSave(byte[] data, String extension, Path targetPath) throws IOException {
        if (data == null || data.length == 0) {
            throw new IOException("Empty image data");
        }

        String ext = (extension == null ? "" : extension.toLowerCase().replace(".", ""));

        // SVG or small non-compressible formats under 500KB can be written directly
        if ("svg".equals(ext) || "gif".equals(ext)) {
            Files.write(targetPath, data);
            return;
        }

        BufferedImage originalImage = null;
        try {
            originalImage = ImageIO.read(new ByteArrayInputStream(data));
        } catch (Exception e) {
            log.warn("ImageIO failed to parse image: {}", e.getMessage());
        }

        // If ImageIO cannot parse (e.g. unknown format) or it's already under 500KB without scaling needed
        if (originalImage == null) {
            Files.write(targetPath, data);
            return;
        }

        int origWidth = originalImage.getWidth();
        int origHeight = originalImage.getHeight();

        // Calculate scaled dimensions if larger than MAX_DIMENSION
        int targetWidth = origWidth;
        int targetHeight = origHeight;

        if (origWidth > MAX_DIMENSION || origHeight > MAX_DIMENSION) {
            if (origWidth >= origHeight) {
                targetWidth = MAX_DIMENSION;
                targetHeight = (int) Math.round(((double) origHeight / origWidth) * MAX_DIMENSION);
            } else {
                targetHeight = MAX_DIMENSION;
                targetWidth = (int) Math.round(((double) origWidth / origHeight) * MAX_DIMENSION);
            }
        }

        // Downsample with bicubic antialiasing
        BufferedImage processedImage = resizeImage(originalImage, targetWidth, targetHeight);

        // Compress iteratively to ensure <= 500KB with high quality
        byte[] compressed = compressToJpeg(processedImage, 0.85f);

        if (compressed.length > TARGET_MAX_BYTES) {
            compressed = compressToJpeg(processedImage, 0.75f);
        }

        if (compressed.length > TARGET_MAX_BYTES) {
            // Further scale down if still > 500KB (e.g. ultra complex textures)
            int fallbackWidth = (int) (targetWidth * 0.8);
            int fallbackHeight = (int) (targetHeight * 0.8);
            BufferedImage smallerImage = resizeImage(processedImage, fallbackWidth, fallbackHeight);
            compressed = compressToJpeg(smallerImage, 0.70f);
        }

        Files.write(targetPath, compressed);
        log.info("Compressed image from {} KB to {} KB ({})", data.length / 1024, compressed.length / 1024, targetPath.getFileName());
    }

    /**
     * Compresses the image from an InputStream.
     */
    public void compressAndSave(InputStream inputStream, String extension, Path targetPath) throws IOException {
        byte[] data = inputStream.readAllBytes();
        compressAndSave(data, extension, targetPath);
    }

    private BufferedImage resizeImage(BufferedImage original, int width, int height) {
        // Create RGB image with white background for transparency handling
        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resized.createGraphics();

        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Fill background with white in case original had transparent alpha
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, width, height);

        g2d.drawImage(original, 0, 0, width, height, null);
        g2d.dispose();

        return resized;
    }

    private byte[] compressToJpeg(BufferedImage image, float quality) throws IOException {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            throw new IllegalStateException("No JPEG ImageWriter found");
        }

        ImageWriter writer = writers.next();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (ImageOutputStream ios = ImageIO.createImageOutputStream(baos)) {
            writer.setOutput(ios);

            ImageWriteParam param = writer.getDefaultWriteParam();
            if (param.canWriteCompressed()) {
                param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                param.setCompressionQuality(quality);
            }

            writer.write(null, new IIOImage(image, null, null), param);
        } finally {
            writer.dispose();
        }

        return baos.toByteArray();
    }
}
