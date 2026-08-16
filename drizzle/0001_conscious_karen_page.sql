CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`province` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`postal_code` text DEFAULT '' NOT NULL,
	`unit` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_login_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_customers_email` ON `customers` (`email`);--> statement-breakpoint
CREATE INDEX `idx_customers_phone` ON `customers` (`phone`);--> statement-breakpoint
ALTER TABLE `orders` ADD `customer_id` text REFERENCES customers(id);--> statement-breakpoint
CREATE INDEX `idx_orders_customer_created` ON `orders` (`customer_id`,`created_at`);