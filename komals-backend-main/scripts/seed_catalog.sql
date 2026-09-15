-- Seed data for Komal's Sweets catalog (category, product, product_image)
-- Schema: category(id, name, slug, description, image, rank, active, created_at, updated_at)
--         product(id, title, description, slug, part_no, price, compare_at_price, unit, active,
--                  category_id, created_at, updated_at)
--         product_image(product_id, url, rank)
-- SEO note: title/description are the only text fields available for on-page SEO copy;
-- there are no dedicated meta_title/meta_description columns in this schema.

-- ===================== CATEGORIES =====================

INSERT INTO category (id, name, slug, description, image, rank, active, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, 'Halwas', 'halwas',
   'Traditional Mangalore Halwa handcrafted by Komal''s Sweets since 1909 — Banana Halwa, Wheat Halwa and Dry Fruit Halwa made with pure ghee, cane sugar and premium dry fruits.',
   NULL, 1, true, now(), now()),
  (gen_random_uuid()::text, 'Mixtures', 'mixtures',
   'Crunchy, lightly spiced Mangalore-style mixtures including Sweet Corn Mixture and Khara Corn Mixture, freshly prepared in small batches.',
   NULL, 2, true, now(), now()),
  (gen_random_uuid()::text, 'Chips & Snacks', 'chips-snacks',
   'Crispy traditional South Indian chips and snacks from Komal''s Sweets — Banana Chips, Jackfruit Chips, Sweet Potato Sonte and Potato Sonte, fried in pure coconut oil.',
   NULL, 3, true, now(), now()),
  (gen_random_uuid()::text, 'Traditional Savouries', 'traditional-savouries',
   'Authentic South Indian savouries including Rice Chakuli, crisp and light with a homemade traditional taste.',
   NULL, 4, true, now(), now()),
  (gen_random_uuid()::text, 'Premium Dry Fruits', 'premium-dry-fruits',
   'Premium roasted and plain cashews from Komal''s Sweets, carefully selected for rich flavour and crunch.',
   NULL, 5, true, now(), now()),
  (gen_random_uuid()::text, 'Traditional Sweets', 'traditional-sweets',
   'Classic Indian sweets from Komal''s Sweets, including Malpuri, made with time-honoured traditional recipes.',
   NULL, 6, true, now(), now());

-- ===================== PRODUCTS =====================

-- Dry Fruit Halwa
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Dry Fruit Halwa',
  'A rich and indulgent traditional halwa made with quality wheat, pure ghee, almonds, pistachios, and carefully selected dry fruits. A delicious combination of rich flavour, chewy texture, and crunchy nuts.',
  'dry-fruit-halwa',
  'DFH-001',
  260.00,
  NULL,
  '250g',
  true,
  (SELECT id FROM category WHERE slug = 'halwas'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'dry-fruit-halwa'), '/images/products/dry-fruit-halwa-1.jpg', 0);

-- Banana Halwa
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Banana Halwa',
  'A traditional Mangalore delicacy prepared from ripe bananas and pure ghee. Carefully cooked to develop its distinctive flavour, smooth texture, and rich traditional character.',
  'banana-halwa',
  'BNH-001',
  190.00,
  NULL,
  '250g',
  true,
  (SELECT id FROM category WHERE slug = 'halwas'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'banana-halwa'), '/images/products/banana-halwa-1.jpg', 0);

-- Wheat Halwa
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Wheat Halwa',
  'A traditional favourite of Komal''s Sweets, prepared using quality wheat and pure ghee. Slow preparation gives it its characteristic rich, soft, and chewy texture with an authentic traditional flavour.',
  'wheat-halwa',
  'WTH-001',
  185.00,
  NULL,
  '250g',
  true,
  (SELECT id FROM category WHERE slug = 'halwas'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'wheat-halwa'), '/images/products/wheat-halwa-1.jpg', 0);

-- Sweet Corn Mixture
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Sweet Corn Mixture',
  'Crunchy, lightly sweetened Mangalore-style mixture made with fried corn flakes, peanuts, dry fruits, sugar powder and salt. Crispy texture, prepared in small batches. 2-month shelf life.',
  'sweet-corn-mixture',
  'SCM-001',
  160.00,
  NULL,
  '200g',
  true,
  (SELECT id FROM category WHERE slug = 'mixtures'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'sweet-corn-mixture'), '/images/products/sweet-corn-mixture-1.jpg', 0);

-- Khara Corn Mixture
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Khara Corn Mixture',
  'Savoury (khara) Mangalore corn mixture with fried corn flakes, peanuts and spices. Crispy, small-batch prepared, shipped fresh daily. 2-month shelf life.',
  'khara-corn-mixture',
  'KCM-001',
  160.00,
  NULL,
  '200g',
  true,
  (SELECT id FROM category WHERE slug = 'mixtures'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'khara-corn-mixture'), '/images/products/khara-corn-mixture-1.jpg', 0);

-- ===================== PRODUCTS: Chips & Snacks =====================

-- Banana Chips
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Banana Chips',
  'Crispy, golden banana chips made from carefully selected raw bananas and fried in pure coconut oil for an authentic traditional flavour and irresistible crunch. A classic South Indian snack, perfect for tea time, celebrations, or anytime snacking.',
  'banana-chips',
  'BNC-001',
  0.00,
  NULL,
  '200g',
  true,
  (SELECT id FROM category WHERE slug = 'chips-snacks'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'banana-chips'), '/images/products/banana-chips-1.jpg', 0);

-- Jackfruit Chips
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Jackfruit Chips',
  'Thinly sliced jackfruit prepared and fried to a crisp, golden perfection. Naturally aromatic and delightfully crunchy, these traditional jackfruit chips are a perfect snack for every occasion.',
  'jackfruit-chips',
  'JFC-001',
  0.00,
  NULL,
  '200g',
  true,
  (SELECT id FROM category WHERE slug = 'chips-snacks'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'jackfruit-chips'), '/images/products/jackfruit-chips-1.jpg', 0);

-- Sweet Potato Sonte
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Sweet Potato Sonte',
  'Crispy sweet potato slices prepared from quality sweet potatoes and fried to perfection. A delicious traditional snack with a satisfying crunch and distinctive sweet potato flavour.',
  'sweet-potato-sonte',
  'SPS-001',
  0.00,
  NULL,
  '200g',
  true,
  (SELECT id FROM category WHERE slug = 'chips-snacks'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'sweet-potato-sonte'), '/images/products/sweet-potato-sonte-1.jpg', 0);

-- Potato Sonte
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Potato Sonte',
  'Thin, crispy potato slices seasoned and fried to perfection. Crunchy, savoury, and delicious, making them an ideal snack for family gatherings and everyday enjoyment.',
  'potato-sonte',
  'PTS-001',
  0.00,
  NULL,
  '200g',
  true,
  (SELECT id FROM category WHERE slug = 'chips-snacks'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'potato-sonte'), '/images/products/potato-sonte-1.jpg', 0);

-- ===================== PRODUCTS: Traditional Savouries =====================

-- Rice Chakuli
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Rice Chakuli',
  'Traditional rice chakuli prepared using quality rice and carefully selected ingredients. Crisp, light, and crunchy with an authentic homemade taste, making it a favourite South Indian savoury snack.',
  'rice-chakuli',
  'RCK-001',
  0.00,
  NULL,
  '200g',
  true,
  (SELECT id FROM category WHERE slug = 'traditional-savouries'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'rice-chakuli'), '/images/products/rice-chakuli-1.jpg', 0);

-- Rice Chakkuli
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Rice Chakkuli',
  'A classic South Indian savoury made from a traditional rice-based recipe and fried until perfectly crisp. Light, crunchy, and flavourful, it is perfect for festive occasions, gatherings, and everyday snacking.',
  'rice-chakkuli',
  'RCK-002',
  0.00,
  NULL,
  '200g',
  true,
  (SELECT id FROM category WHERE slug = 'traditional-savouries'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'rice-chakkuli'), '/images/products/rice-chakkuli-1.jpg', 0);

-- ===================== PRODUCTS: Premium Dry Fruits =====================

-- Cashews - Salted
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Cashews – Salted',
  'Premium quality cashews carefully roasted and lightly seasoned to deliver a delicious crunch and rich, buttery flavour. Perfect for snacking, entertaining guests, or festive occasions.',
  'cashews-salted',
  'CSH-001',
  0.00,
  NULL,
  '200g',
  true,
  (SELECT id FROM category WHERE slug = 'premium-dry-fruits'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'cashews-salted'), '/images/products/cashews-salted-1.jpg', 0);

-- Cashews - Plain
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Cashews – Plain',
  'Carefully selected premium cashews with a naturally rich, buttery flavour and satisfying crunch. A timeless dry-fruit favourite for everyday snacking and special occasions.',
  'cashews-plain',
  'CSH-002',
  0.00,
  NULL,
  '200g',
  true,
  (SELECT id FROM category WHERE slug = 'premium-dry-fruits'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'cashews-plain'), '/images/products/cashews-plain-1.jpg', 0);

-- ===================== PRODUCTS: Traditional Sweets =====================

-- Malpuri
INSERT INTO product (id, title, description, slug, part_no, price, compare_at_price, unit, active, category_id, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'Malpuri',
  'A traditional Indian sweet prepared using a time-honoured recipe and cooked to a beautiful golden finish. Soft, rich, and aromatic, Malpuri is a delightful choice for celebrations and special occasions.',
  'malpuri',
  'MLP-001',
  0.00,
  NULL,
  '250g',
  true,
  (SELECT id FROM category WHERE slug = 'traditional-sweets'),
  now(), now()
);

INSERT INTO product_image (product_id, url, rank)
VALUES ((SELECT id FROM product WHERE slug = 'malpuri'), '/images/products/malpuri-1.jpg', 0);

-- ===================== HOME PAGE STORY SECTION =====================
-- site_settings is a singleton row (created lazily by SiteSettingsService.get()).
-- Update it if it already exists; otherwise insert the row with story fields set.

UPDATE site_settings
SET story_eyebrow = 'Our Story',
    story_heading = 'A Legacy of Sweet Moments',
    story_body = 'Komal''s Sweet Palace has been a part of your celebrations for generations. From our humble beginnings to today, we continue to craft sweets that bring people together — because every moment deserves something sweet.',
    updated_at = now();

INSERT INTO site_settings (id, site_name, story_eyebrow, story_heading, story_body, created_at, updated_at)
SELECT gen_random_uuid()::text, 'Komal''s Sweet Palace', 'Our Story', 'A Legacy of Sweet Moments',
       'Komal''s Sweet Palace has been a part of your celebrations for generations. From our humble beginnings to today, we continue to craft sweets that bring people together — because every moment deserves something sweet.',
       now(), now()
WHERE NOT EXISTS (SELECT 1 FROM site_settings);
