CREATE TABLE `customer_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_customer_sessions_token_hash` ON `customer_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_customer_sessions_customer` ON `customer_sessions` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_customer_sessions_expires` ON `customer_sessions` (`expires_at`);--> statement-breakpoint
ALTER TABLE `customers` ADD `password_hash` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `password_salt` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `failed_attempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` ADD `locked_until` text;