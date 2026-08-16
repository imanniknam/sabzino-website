CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`full_name` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`phone` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`city` text NOT NULL,
	`subject` text NOT NULL,
	`details` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_inquiries_type_created` ON `inquiries` (`type`,`created_at`);
--> statement-breakpoint
UPDATE `products` SET `name`='گوجه خشک', `category`='سبزی‌های خشک', `description`='ورقه‌های گوجه خشک؛ مناسب پاستا، سالاد و خوراک', `image`='/images/product-1.webp' WHERE `id`='dried-pepper';
--> statement-breakpoint
UPDATE `products` SET `name`='شنبلیله خشک', `category`='سبزی‌های خشک', `description`='عطر اصیل شنبلیله برای خورش و ترکیب‌های خانگی', `image`='/images/product-2.webp' WHERE `id`='kuku-herbs';
--> statement-breakpoint
UPDATE `products` SET `name`='نعناع فلفلی', `category`='سبزی‌های خشک', `description`='خنک، معطر و مناسب دمنوش، نوشیدنی و آشپزی', `image`='/images/product-3.webp' WHERE `id`='ash-herbs';
--> statement-breakpoint
UPDATE `products` SET `name`='ریحان بنفش خشک', `category`='سبزی‌های خشک', `description`='ریحان بنفش خوش‌رنگ با رایحه‌ای گرم و متفاوت', `image`='/images/product-4.webp' WHERE `id`='dolmeh-herbs';
--> statement-breakpoint
UPDATE `products` SET `name`='ترشی فلفل سبز', `category`='چاشنی‌ها و سس‌ها', `description`='فلفل سبز و سیر با طعمی تند و زنده', `image`='/images/product-10.webp' WHERE `id`='green-pepper';
--> statement-breakpoint
UPDATE `products` SET `name`='چاشنی دانه‌دار سبزینو', `category`='چاشنی‌ها و سس‌ها', `description`='ترکیبی بافت‌دار و متفاوت برای مزه‌پردازی', `image`='/images/product-11.webp' WHERE `id`='seed-seasoning';
--> statement-breakpoint
UPDATE `products` SET `name`='ترشی بادمجان', `category`='چاشنی‌ها و سس‌ها', `description`='بادمجان دست‌ساز و پرچاشنی با دستور سبزینو', `image`='/images/product-12.webp' WHERE `id`='eggplant-pickle';
--> statement-breakpoint
UPDATE `products` SET `name`='سس فلفل قرمز', `category`='چاشنی‌ها و سس‌ها', `description`='سس فلفل قرمز تند، دانه‌دار و خوش‌طعم', `image`='/images/product-13.webp' WHERE `id`='red-pepper';
--> statement-breakpoint
INSERT OR IGNORE INTO `products` (`id`,`name`,`category`,`description`,`price`,`image`,`stock`,`is_active`,`is_deleted`) VALUES
('dried-basil','ریحان خشک','سبزی‌های خشک','ریحان خشک معطر برای سس، پاستا و غذاهای روزمره',149000,'/images/product-5.webp',26,1,0),
('dried-savory','مرزه خشک','سبزی‌های خشک','مرزه خوش‌عطر برای حبوبات، ترشی و خوراک‌های ایرانی',146000,'/images/product-6.webp',21,1,0),
('fried-onion-sliced','پیاز سرخ‌شده خلالی','سبزیجات آماده','خلال‌های طلایی و آماده برای آش، کشک بادمجان و تزیین غذا',176000,'/images/product-7.webp',19,1,0),
('fried-onion-majlesi','پیاز سرخ‌شده مجلسی','سبزیجات آماده','پیازداغ خوش‌رنگ و ترد؛ آماده مصرف',182000,'/images/product-8.webp',17,1,0),
('fried-carrot','هویج سرخ‌شده','سبزیجات آماده','هویج خلالی آماده برای غذاهای مجلسی و ترکیبی',178000,'/images/product-9.webp',16,1,0);
