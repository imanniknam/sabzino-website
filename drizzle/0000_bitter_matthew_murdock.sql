CREATE TABLE `newsletter_subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_newsletter_email` ON `newsletter_subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`unit_price` integer NOT NULL,
	`quantity` integer NOT NULL,
	`line_total` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_order_items_order_id` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`province` text NOT NULL,
	`city` text NOT NULL,
	`address` text NOT NULL,
	`postal_code` text NOT NULL,
	`unit` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`shipping_method` text NOT NULL,
	`payment_method` text DEFAULT 'online' NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`status` text DEFAULT 'pending_payment' NOT NULL,
	`subtotal` integer NOT NULL,
	`shipping_cost` integer NOT NULL,
	`total` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_orders_order_number` ON `orders` (`order_number`);--> statement-breakpoint
CREATE INDEX `idx_orders_phone_created` ON `orders` (`phone`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_orders_status_created` ON `orders` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`price` integer NOT NULL,
	`image` text NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_products_category_active` ON `products` (`category`,`is_active`);