CREATE TABLE `admin_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`failed_attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_admin_credentials_username` ON `admin_credentials` (`username`);--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_admin_sessions_token_hash` ON `admin_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_admin_sessions_expires_at` ON `admin_sessions` (`expires_at`);--> statement-breakpoint
DROP INDEX `idx_products_category_active`;--> statement-breakpoint
ALTER TABLE `products` ADD `is_deleted` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `deleted_at` text;--> statement-breakpoint
CREATE INDEX `idx_products_category_active` ON `products` (`category`,`is_active`,`is_deleted`);