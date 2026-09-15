package com.komals.catalog.product;

import com.komals.catalog.audit.AuditLogService;
import com.komals.catalog.category.Category;
import com.komals.catalog.category.CategoryRepository;
import com.komals.catalog.common.ApiException;
import com.komals.catalog.config.ImageCompressionService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/** Bulk product import from an Excel sheet, and bulk product image import from a ZIP matched by part number. */
@RestController
@RequestMapping("/admin/products/import")
@RequiredArgsConstructor
public class AdminProductImportController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ImageCompressionService imageCompressionService;
    private final AuditLogService auditLogService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Canonical field -> accepted excel header aliases. Aliases are matched after normalization
     * (lowercase, spaces/underscores/hyphens stripped), so "Item Description", "item_description"
     * and "itemdescription" all resolve to ITEM_DESCRIPTION.
     */
    private static final Map<String, List<String>> HEADER_ALIASES = Map.of(
            "partno", List.of("productno", "barcode"),
            "title", List.of("productname", "itemdescription", "description"),
            "mop", List.of("mop", "salesprice"),
            "mrp", List.of("mrp"),
            "category", List.of("category"),
            "unit", List.of("baseuom")
    );

    private static final List<String> REQUIRED_FIELDS =
            List.of("partno", "title", "mop", "mrp", "category");

    private static final Set<String> ALLOWED_IMAGE_EXT =
            Set.of("jpg", "jpeg", "png", "webp", "gif");

    @PostMapping("/excel")
    public ImportReport importExcel(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        List<String> errors = new ArrayList<>();
        int created = 0;
        int updated = 0;

        try (InputStream in = file.getInputStream(); Workbook workbook = WorkbookFactory.create(in)) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Sheet has no header row");
            }

            // normalized alias -> canonical field name, e.g. "barcode" -> "partno"
            Map<String, String> aliasToField = new HashMap<>();
            HEADER_ALIASES.forEach((field, aliases) -> aliases.forEach(alias -> aliasToField.put(alias, field)));

            Map<String, Integer> columnIndex = new HashMap<>();
            for (Cell cell : headerRow) {
                String normalized = normalizeHeader(cellText(cell));
                String field = aliasToField.get(normalized);
                if (field != null) columnIndex.put(field, cell.getColumnIndex());
            }
            List<String> missing = REQUIRED_FIELDS.stream().filter(h -> !columnIndex.containsKey(h)).toList();
            if (!missing.isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Missing required columns: " + String.join(", ", missing));
            }

            for (int r = sheet.getFirstRowNum() + 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null || isBlankRow(row)) continue;

                String partNo = cellText(row.getCell(columnIndex.get("partno"))).trim();
                String name = cellText(row.getCell(columnIndex.get("title"))).trim();
                String mop = cellText(row.getCell(columnIndex.get("mop"))).trim();
                String mrp = cellText(row.getCell(columnIndex.get("mrp"))).trim();
                String categoryName = cellText(row.getCell(columnIndex.get("category"))).trim();
                String description = columnIndex.containsKey("description")
                        ? cellText(row.getCell(columnIndex.get("description"))).trim()
                        : "";
                String unit = columnIndex.containsKey("unit")
                        ? cellText(row.getCell(columnIndex.get("unit"))).trim()
                        : "";

                int excelRowNum = r + 1;
                if (partNo.isEmpty() || name.isEmpty() || mop.isEmpty() || categoryName.isEmpty()) {
                    errors.add("Row " + excelRowNum + ": Product No, Product Name, MOP and Category are required");
                    continue;
                }

                try {
                    BigDecimal price;
                    BigDecimal compareAtPrice = null;
                    try {
                        price = new BigDecimal(mop);
                        if (!mrp.isEmpty()) compareAtPrice = new BigDecimal(mrp);
                    } catch (NumberFormatException e) {
                        errors.add("Row " + excelRowNum + ": MOP/MRP must be numeric");
                        continue;
                    }

                    Category category = findOrCreateCategory(categoryName);

                    Optional<Product> existing = productRepository.findByPartNo(partNo);
                    Product product = existing.orElseGet(Product::new);
                    product.setPartNo(partNo);
                    product.setTitle(name);
                    product.setDescription(description);
                    product.setPrice(price);
                    product.setCompareAtPrice(compareAtPrice);
                    product.setCategory(category);
                    if (!unit.isEmpty()) product.setUnit(unit);
                    if (product.getSlug() == null || product.getSlug().isBlank()) {
                        product.setSlug(uniqueSlug(slugify(name), product.getId()));
                    }

                    productRepository.save(product);
                    if (existing.isPresent()) updated++; else created++;
                } catch (Exception e) {
                    errors.add("Row " + excelRowNum + ": " + e.getMessage());
                }
            }
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Could not read the Excel file");
        }

        auditLogService.record("IMPORT_EXCEL", "PRODUCT", null,
                "Imported products from Excel: " + created + " created, " + updated + " updated"
                        + (errors.isEmpty() ? "" : ", " + errors.size() + " error(s)"));

        return new ImportReport(created, updated, errors);
    }

    @PostMapping("/images")
    public ImageImportReport importImages(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        int matched = 0;
        List<String> unmatched = new ArrayList<>();

        try (ZipInputStream zip = new ZipInputStream(file.getInputStream())) {
            Path dir = Path.of(uploadDir);
            Files.createDirectories(dir);

            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if (entry.isDirectory()) continue;

                String entryName = Path.of(entry.getName()).getFileName().toString();
                int dot = entryName.lastIndexOf('.');
                if (dot <= 0) continue;
                String base = entryName.substring(0, dot);
                String ext = entryName.substring(dot + 1).toLowerCase();
                if (!ALLOWED_IMAGE_EXT.contains(ext)) continue;

                Optional<Product> match = productRepository.findByPartNoIgnoreCase(base);
                if (match.isEmpty()) {
                    unmatched.add(entryName);
                    continue;
                }

                byte[] imageBytes = zip.readAllBytes();
                String outputExt = ("svg".equals(ext) || "gif".equals(ext)) ? "." + ext : ".jpg";
                String filename = UUID.randomUUID() + outputExt;
                Path target = dir.resolve(filename).normalize();

                imageCompressionService.compressAndSave(imageBytes, ext, target);

                Product product = match.get();
                List<String> images = new ArrayList<>(product.getImages());
                images.add(0, "/uploads/" + filename);
                product.setImages(images);
                productRepository.save(product);
                matched++;
            }
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Could not read or process the ZIP file: " + e.getMessage());
        }

        auditLogService.record("IMPORT_IMAGES", "PRODUCT", null,
                "Imported images from ZIP: " + matched + " matched"
                        + (unmatched.isEmpty() ? "" : ", " + unmatched.size() + " unmatched"));

        return new ImageImportReport(matched, unmatched);
    }

    private Category findOrCreateCategory(String name) {
        String cleanName = stripChinaPrefix(name);
        String slug = slugify(cleanName);
        return categoryRepository.findBySlug(slug).orElseGet(() -> {
            Category category = new Category();
            category.setName(cleanName);
            category.setSlug(slug);
            return categoryRepository.save(category);
        });
    }

    /** "China Gadgets" -> "Gadgets": excel data prefixes some category names with a supplier origin. */
    private String stripChinaPrefix(String name) {
        String stripped = name.trim().replaceFirst("(?i)^china\\s+", "");
        return stripped.isBlank() ? name.trim() : stripped;
    }

    /** Lowercase, strip spaces/underscores/hyphens, so "Base UOM", "base_uom" and "BaseUOM" all match. */
    private String normalizeHeader(String header) {
        return header.trim().toLowerCase().replaceAll("[\\s_-]+", "");
    }

    private String slugify(String text) {
        String slug = text.toLowerCase().trim().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return slug.isEmpty() ? "item" : slug;
    }

    private String uniqueSlug(String base, String excludeId) {
        String slug = base;
        int n = 1;
        while (productRepository.findBySlug(slug).filter(p -> !p.getId().equals(excludeId)).isPresent()) {
            slug = base + "-" + (++n);
        }
        return slug;
    }

    private boolean isBlankRow(Row row) {
        for (Cell cell : row) {
            if (!cellText(cell).isBlank()) return false;
        }
        return true;
    }

    private String cellText(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                double value = cell.getNumericCellValue();
                yield value == Math.floor(value) ? String.valueOf((long) value) : String.valueOf(value);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    public record ImportReport(int created, int updated, List<String> errors) {}

    public record ImageImportReport(int matched, List<String> unmatched) {}
}
