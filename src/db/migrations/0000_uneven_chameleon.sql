CREATE TABLE `business_settings` (
	`business_id` text PRIMARY KEY NOT NULL,
	`auto_followup_enabled` integer DEFAULT true,
	`low_stock_alerts_enabled` integer DEFAULT true,
	`invoice_prefix` text DEFAULT 'INV-',
	`quote_prefix` text DEFAULT 'QT-',
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`whatsapp_number` text NOT NULL,
	`industry` text,
	`timezone` text DEFAULT 'UTC',
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `businesses_whatsapp_number_unique` ON `businesses` (`whatsapp_number`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`name` text NOT NULL,
	`phone_number` text,
	`email` text,
	`address` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'draft',
	`total_amount` real NOT NULL,
	`tax_amount` real DEFAULT 0,
	`shipping_amount` real DEFAULT 0,
	`items` text NOT NULL,
	`notes` text,
	`due_date` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `message_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`sender_phone` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`tokens_used` integer,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` real NOT NULL,
	`currency` text DEFAULT 'USD',
	`stock_quantity` integer DEFAULT 0,
	`low_stock_threshold` integer DEFAULT 5,
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`role` text DEFAULT 'admin',
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);