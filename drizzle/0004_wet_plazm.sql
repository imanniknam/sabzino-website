DROP INDEX `idx_customers_email`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_customers_email` ON `customers` (`email`) WHERE "customers"."email" <> '';