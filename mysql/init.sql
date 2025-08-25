-- MySQL initialization script for Docker
-- This script runs when the MySQL container starts for the first time

-- Ensure UTF8 charset
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create databases if they don't exist
CREATE DATABASE IF NOT EXISTS `boiler_api` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `boiler_api_test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application users if they don't exist
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'app_password';
CREATE USER IF NOT EXISTS 'test_user'@'%' IDENTIFIED BY 'test_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON `boiler_api`.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON `boiler_api_test`.* TO 'test_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

SET FOREIGN_KEY_CHECKS = 1;