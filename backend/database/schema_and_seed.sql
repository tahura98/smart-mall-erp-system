-- ============================================================
-- Total Office Center (TOC) Commercial ERP Database Schema & Seed
-- Commercial Complex & Shopping Mall Management ERP
-- Database: smart_mall_db
-- Currency: Bangladeshi Taka (BDT ৳)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `smart_mall_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smart_mall_db`;

-- Drop tables in reverse order of foreign key dependency
DROP TABLE IF EXISTS `maintenance_tickets`;
DROP TABLE IF EXISTS `parking_logs`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `leases`;
DROP TABLE IF EXISTS `units`;
DROP TABLE IF EXISTS `floors`;
DROP TABLE IF EXISTS `personal_access_tokens`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `users`;

-- ------------------------------------------------------------
-- Table: users
-- Roles: super_admin, accounts_officer, tenant, parking_operator
-- ------------------------------------------------------------
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL UNIQUE,
  `phone` varchar(30) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','accounts_officer','tenant','parking_operator') NOT NULL DEFAULT 'tenant',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: personal_access_tokens (Laravel Sanctum API tokens)
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
-- Table: password_reset_tokens
-- ------------------------------------------------------------
CREATE TABLE `password_reset_tokens` (
  `email` varchar(191) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: sessions
-- ------------------------------------------------------------
CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: floors
-- ------------------------------------------------------------
CREATE TABLE `floors` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `level_name` varchar(100) NOT NULL,
  `zone_type` enum('Shopping Mall','Food Court','Corporate Office','Basement Parking','Rooftop Lounge') NOT NULL,
  `block_code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `floors_level_name_block_code_unique` (`level_name`, `block_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: units
-- ------------------------------------------------------------
CREATE TABLE `units` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `unit_no` varchar(50) NOT NULL UNIQUE,
  `floor_id` bigint(20) UNSIGNED NOT NULL,
  `unit_type` enum('Retail Shop','Office Suite','Kiosk') NOT NULL DEFAULT 'Office Suite',
  `size_sqft` decimal(10,2) NOT NULL,
  `base_rent_bdt` decimal(12,2) NOT NULL,
  `cam_rate_per_sqft` decimal(8,2) NOT NULL DEFAULT 15.00,
  `status` enum('Vacant','Occupied','Maintenance') NOT NULL DEFAULT 'Vacant',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `units_floor_id_status_index` (`floor_id`, `status`),
  CONSTRAINT `fk_units_floor_id` FOREIGN KEY (`floor_id`) REFERENCES `floors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: leases
-- ------------------------------------------------------------
CREATE TABLE `leases` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `agreement_no` varchar(100) NOT NULL UNIQUE,
  `unit_id` bigint(20) UNSIGNED NOT NULL,
  `tenant_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `company_or_shop_name` varchar(191) NOT NULL,
  `proprietor_name` varchar(191) NOT NULL,
  `phone_bd` varchar(30) NOT NULL,
  `trade_license_no` varchar(100) NOT NULL,
  `tin_no` varchar(100) NOT NULL,
  `security_deposit_bdt` decimal(14,2) NOT NULL DEFAULT 0.00,
  `advance_rent_bdt` decimal(14,2) NOT NULL DEFAULT 0.00,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Active','Terminated','Expired','Draft') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `leases_agreement_no_status_index` (`agreement_no`, `status`),
  KEY `leases_unit_id_status_index` (`unit_id`, `status`),
  CONSTRAINT `fk_leases_unit_id` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_leases_tenant_user_id` FOREIGN KEY (`tenant_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: invoices
-- ------------------------------------------------------------
CREATE TABLE `invoices` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(100) NOT NULL UNIQUE,
  `unit_id` bigint(20) UNSIGNED NOT NULL,
  `lease_id` bigint(20) UNSIGNED DEFAULT NULL,
  `billing_month` varchar(50) NOT NULL,
  `rent_amount` decimal(12,2) NOT NULL,
  `cam_charge` decimal(12,2) NOT NULL,
  `prev_meter_unit` decimal(10,2) NOT NULL DEFAULT 0.00,
  `curr_meter_unit` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unit_rate` decimal(8,2) NOT NULL DEFAULT 12.50,
  `electricity_bill` decimal(12,2) NOT NULL DEFAULT 0.00,
  `vat_percentage` decimal(5,2) NOT NULL DEFAULT 5.00,
  `vat_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_payable_bdt` decimal(14,2) NOT NULL,
  `payment_method` enum('Bank Transfer','bKash Corporate','Cash','Cheque') DEFAULT NULL,
  `transaction_reference` varchar(191) DEFAULT NULL,
  `status` enum('Unpaid','Paid','Overdue') NOT NULL DEFAULT 'Unpaid',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invoices_invoice_no_status_index` (`invoice_no`, `status`),
  KEY `invoices_unit_id_billing_month_index` (`unit_id`, `billing_month`),
  CONSTRAINT `fk_invoices_unit_id` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invoices_lease_id` FOREIGN KEY (`lease_id`) REFERENCES `leases` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: parking_logs
-- ------------------------------------------------------------
CREATE TABLE `parking_logs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `token_no` varchar(100) NOT NULL UNIQUE,
  `vehicle_reg_no` varchar(100) NOT NULL,
  `vehicle_type` enum('Car','Bike','SUV') NOT NULL DEFAULT 'Car',
  `basement_zone` varchar(100) NOT NULL,
  `entry_time` timestamp NOT NULL,
  `exit_time` timestamp NULL DEFAULT NULL,
  `fee_bdt` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('Parked','Exited','Lost Token') NOT NULL DEFAULT 'Parked',
  `operator_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parking_logs_token_no_status_index` (`token_no`, `status`),
  KEY `parking_logs_vehicle_reg_no_status_index` (`vehicle_reg_no`, `status`),
  CONSTRAINT `fk_parking_logs_operator_user_id` FOREIGN KEY (`operator_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: maintenance_tickets
-- ------------------------------------------------------------
CREATE TABLE `maintenance_tickets` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_no` varchar(100) NOT NULL UNIQUE,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `tenant_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `issue_category` enum('Central AC','Electrical','Plumbing','Elevator','Security') NOT NULL,
  `description` text NOT NULL,
  `priority` enum('Low','Medium','High','Urgent') NOT NULL DEFAULT 'Medium',
  `status` enum('Open','In Progress','Resolved','Closed') NOT NULL DEFAULT 'Open',
  `resolution_notes` text DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `maintenance_tickets_ticket_no_status_index` (`ticket_no`, `status`),
  KEY `maintenance_tickets_issue_category_priority_index` (`issue_category`, `priority`),
  CONSTRAINT `fk_maintenance_tickets_unit_id` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_maintenance_tickets_tenant_user_id` FOREIGN KEY (`tenant_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA: OFFICIAL SUPER ADMIN ONLY
-- All other operational records must be populated cleanly via UI / API
-- ============================================================
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `is_active`, `created_at`, `updated_at`)
VALUES
  (1, 'TOC Super Admin', 'admin@totalofficecenter.com', '+8801700000000', '$2y$10$AHqZPV.qGBVORHAYpjpuH.tx9lXVNkyxB76pvMGPx5cJtR1Iqbv/y', 'super_admin', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `password`=VALUES(`password`), `role`=VALUES(`role`);
