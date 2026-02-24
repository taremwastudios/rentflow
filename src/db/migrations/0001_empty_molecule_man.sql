CREATE TABLE `platform_payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`subscription_id` integer,
	`plan_id` integer,
	`amount_usd` real NOT NULL,
	`crypto_amount` real,
	`currency` text NOT NULL,
	`nowpayments_payment_id` text NOT NULL,
	`nowpayments_order_id` text,
	`payment_status` text DEFAULT 'waiting' NOT NULL,
	`pay_address` text,
	`ipn_data` text,
	`payment_url` text,
	`type` text DEFAULT 'subscription' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `platform_payments_nowpayments_payment_id_unique` ON `platform_payments` (`nowpayments_payment_id`);--> statement-breakpoint
CREATE TABLE `subscription_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`price_usd_monthly` real DEFAULT 0 NOT NULL,
	`price_usd_annually` real,
	`setup_fee_usd` real DEFAULT 0 NOT NULL,
	`features` text NOT NULL,
	`property_limit` integer NOT NULL,
	`unit_limit` integer NOT NULL,
	`storage_gb` real DEFAULT 1 NOT NULL,
	`priority_support` integer DEFAULT false NOT NULL,
	`priority_multiplier` real DEFAULT 1 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscription_plans_slug_unique` ON `subscription_plans` (`slug`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`plan_id` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`started_at` integer,
	`expires_at` integer,
	`billing_cycle` text DEFAULT 'monthly' NOT NULL,
	`nowpayments_payment_id` text,
	`auto_renew` integer DEFAULT true NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON UPDATE no action ON DELETE no action
);
