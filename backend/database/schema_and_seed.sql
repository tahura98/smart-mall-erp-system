-- ============================================================
-- Smart Mall Database Initialization & Seed Data SQL Dump
-- Database: smart_mall_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS `smart_mall_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smart_mall_db`;

-- Drop tables in order of dependency if re-running
DROP TABLE IF EXISTS `sale_items`;
DROP TABLE IF EXISTS `sales`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `bills`;
DROP TABLE IF EXISTS `shops`;
DROP TABLE IF EXISTS `personal_access_tokens`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `users`;

-- ------------------------------------------------------------
-- Table structure for `users`
-- ------------------------------------------------------------
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL UNIQUE,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','shop_owner') NOT NULL DEFAULT 'shop_owner',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `personal_access_tokens` (Laravel Sanctum)
-- ------------------------------------------------------------
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(191) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `token` varchar(64) NOT NULL UNIQUE,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `shops`
-- ------------------------------------------------------------
CREATE TABLE `shops` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `shop_number` varchar(191) NOT NULL UNIQUE,
  `floor_name` varchar(191) NOT NULL,
  `shop_name` varchar(191) NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `monthly_rent` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shops_owner_id_foreign` (`owner_id`),
  CONSTRAINT `shops_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `bills`
-- ------------------------------------------------------------
CREATE TABLE `bills` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) UNSIGNED NOT NULL,
  `month_year` varchar(191) NOT NULL,
  `rent_amount` decimal(10,2) NOT NULL,
  `utility_bill` decimal(10,2) NOT NULL,
  `status` enum('paid','unpaid','pending') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bills_shop_id_foreign` (`shop_id`),
  CONSTRAINT `bills_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `products`
-- ------------------------------------------------------------
CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `barcode` varchar(191) NOT NULL UNIQUE,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `products_shop_id_foreign` (`shop_id`),
  CONSTRAINT `products_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `sales`
-- ------------------------------------------------------------
CREATE TABLE `sales` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) UNSIGNED NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `invoice_number` varchar(191) NOT NULL UNIQUE,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sales_shop_id_foreign` (`shop_id`),
  CONSTRAINT `sales_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `sale_items`
-- ------------------------------------------------------------
CREATE TABLE `sale_items` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `sale_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sale_items_sale_id_foreign` (`sale_id`),
  KEY `sale_items_product_id_foreign` (`product_id`),
  CONSTRAINT `sale_items_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sale_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed Data: 1 Admin, 3 Shop Owners, 3 Shops, Sample Bills, Products, Sales
-- Password for all accounts: password123 (bcrypt hashed)
-- ============================================================

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Mall Super Admin', 'admin@smartmall.com', '$2y$12$e0NZhM0a.mF6Fj88aP76teYI6d.bO3H11jHkWFzDq0r9yJz1r0a6.', 'admin'),
(2, 'Alex Turner', 'alex@urbanthreads.com', '$2y$12$e0NZhM0a.mF6Fj88aP76teYI6d.bO3H11jHkWFzDq0r9yJz1r0a6.', 'shop_owner'),
(3, 'Elena Rostova', 'elena@apexgadgets.com', '$2y$12$e0NZhM0a.mF6Fj88aP76teYI6d.bO3H11jHkWFzDq0r9yJz1r0a6.', 'shop_owner'),
(4, 'Marcus Chen', 'marcus@brewbites.com', '$2y$12$e0NZhM0a.mF6Fj88aP76teYI6d.bO3H11jHkWFzDq0r9yJz1r0a6.', 'shop_owner');

INSERT INTO `shops` (`id`, `shop_number`, `floor_name`, `shop_name`, `owner_id`, `monthly_rent`) VALUES
(1, 'G-101', 'Ground Floor', 'Urban Threads Boutique', 2, 45000.00),
(2, 'F1-205', 'First Floor', 'Apex Electronics & Tech', 3, 62000.00),
(3, 'F2-310', 'Second Floor', 'Brew & Bites Artisan Cafe', 4, 38000.00);

INSERT INTO `bills` (`id`, `shop_id`, `month_year`, `rent_amount`, `utility_bill`, `status`) VALUES
(1, 1, '2024-09', 45000.00, 4200.00, 'paid'),
(2, 1, '2024-10', 45000.00, 4850.00, 'paid'),
(3, 1, '2024-11', 45000.00, 5100.00, 'pending'),
(4, 2, '2024-09', 62000.00, 7800.00, 'paid'),
(5, 2, '2024-10', 62000.00, 8300.00, 'paid'),
(6, 2, '2024-11', 62000.00, 9100.00, 'unpaid'),
(7, 3, '2024-09', 38000.00, 3200.00, 'paid'),
(8, 3, '2024-10', 38000.00, 3650.00, 'paid'),
(9, 3, '2024-11', 38000.00, 3900.00, 'pending');

INSERT INTO `products` (`id`, `shop_id`, `name`, `barcode`, `price`, `stock`) VALUES
(1, 1, 'Urban Heritage Denim Jacket', '8901234001', 3499.00, 28),
(2, 1, 'Slim-Fit Oxford Cotton Shirt', '8901234002', 1899.00, 45),
(3, 1, 'Classic Tailored Chinos', '8901234003', 2199.00, 32),
(4, 1, 'Genuine Leather Belt', '8901234004', 899.00, 50),
(5, 2, 'Pro Wireless ANC Headphones', '8902345001', 8990.00, 22),
(6, 2, 'Ultra-Fast 65W GaN Charger', '8902345002', 1799.00, 65),
(7, 2, 'Mechanical RGB Gaming Keyboard', '8902345003', 4590.00, 18),
(8, 2, 'Precision Bluetooth Mouse', '8902345004', 1290.00, 40),
(9, 3, 'Single Origin Arabica Beans (500g)', '8903456001', 950.00, 35),
(10, 3, 'Butter Croissant (Pack of 2)', '8903456002', 280.00, 25),
(11, 3, 'Signature Cold Brew Bottle (300ml)', '8903456003', 320.00, 40),
(12, 3, 'Matcha Cream Latte Powder', '8903456004', 680.00, 30);

INSERT INTO `sales` (`id`, `shop_id`, `total_amount`, `invoice_number`) VALUES
(1, 1, 5398.00, 'INV-2024-00101'),
(2, 1, 1899.00, 'INV-2024-00102'),
(3, 2, 10789.00, 'INV-2024-00201'),
(4, 2, 4590.00, 'INV-2024-00202'),
(5, 3, 1230.00, 'INV-2024-00301'),
(6, 3, 950.00, 'INV-2024-00302');

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `quantity`, `unit_price`, `subtotal`) VALUES
(1, 1, 1, 1, 3499.00, 3499.00),
(2, 1, 2, 1, 1899.00, 1899.00),
(3, 2, 2, 1, 1899.00, 1899.00),
(4, 3, 5, 1, 8990.00, 8990.00),
(5, 3, 6, 1, 1799.00, 1799.00),
(6, 4, 7, 1, 4590.00, 4590.00),
(7, 5, 9, 1, 950.00, 950.00),
(8, 5, 10, 1, 280.00, 280.00),
(9, 6, 9, 1, 950.00, 950.00);
