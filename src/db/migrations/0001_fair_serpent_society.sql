CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`merchant` text NOT NULL,
	`amount` real NOT NULL,
	`tax_amount` real DEFAULT 0,
	`currency` text DEFAULT 'USD',
	`category` text,
	`expense_date` text NOT NULL,
	`image_url` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
