ALTER TABLE `orders` ADD `payment_authority` text;
--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_ref_id` text;
--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_card_pan` text;
--> statement-breakpoint
ALTER TABLE `orders` ADD `paid_at` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_orders_payment_authority` ON `orders` (`payment_authority`);
