CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`property_id` integer NOT NULL,
	`landlord_id` integer NOT NULL,
	`visitor_name` text NOT NULL,
	`visitor_email` text,
	`visitor_phone` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`landlord_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `landlord_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`business_name` text,
	`bio` text,
	`location` text DEFAULT 'Mbarara, Uganda' NOT NULL,
	`verification_status` text DEFAULT 'pending' NOT NULL,
	`verification_notes` text,
	`national_id_url` text,
	`land_title_url` text,
	`registration_doc_url` text,
	`additional_docs_url` text,
	`reviewed_by` integer,
	`reviewed_at` integer,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`landlord_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`address` text NOT NULL,
	`city` text DEFAULT 'Mbarara' NOT NULL,
	`district` text DEFAULT 'Mbarara' NOT NULL,
	`country` text DEFAULT 'Uganda' NOT NULL,
	`property_type` text DEFAULT 'apartment' NOT NULL,
	`total_units` integer DEFAULT 1 NOT NULL,
	`cover_image_url` text,
	`is_published` integer DEFAULT false NOT NULL,
	`template_id` text DEFAULT 'default',
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`landlord_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `property_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`property_id` integer NOT NULL,
	`image_url` text NOT NULL,
	`caption` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`landlord_id` integer NOT NULL,
	`tenant_id` integer,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`scheduled_at` integer NOT NULL,
	`sent_at` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`landlord_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rent_payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer NOT NULL,
	`unit_id` integer NOT NULL,
	`landlord_id` integer NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'UGX' NOT NULL,
	`payment_date` integer,
	`due_date` integer NOT NULL,
	`period_month` integer NOT NULL,
	`period_year` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text,
	`reference_number` text,
	`notes` text,
	`late_fee` real DEFAULT 0 NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`landlord_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tenancy_agreements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer NOT NULL,
	`unit_id` integer NOT NULL,
	`landlord_id` integer NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`monthly_rent` real NOT NULL,
	`deposit_amount` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'UGX' NOT NULL,
	`payment_due_day` integer DEFAULT 1 NOT NULL,
	`terms` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`signed_by_tenant` integer DEFAULT false NOT NULL,
	`signed_by_landlord` integer DEFAULT false NOT NULL,
	`document_url` text,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`landlord_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`landlord_id` integer NOT NULL,
	`unit_id` integer NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text,
	`phone` text NOT NULL,
	`national_id` text,
	`emergency_contact` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`landlord_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`property_id` integer NOT NULL,
	`unit_number` text NOT NULL,
	`floor` integer,
	`bedrooms` integer DEFAULT 1 NOT NULL,
	`bathrooms` integer DEFAULT 1 NOT NULL,
	`size_sqft` real,
	`monthly_rent` real NOT NULL,
	`currency` text DEFAULT 'UGX' NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`description` text,
	`created_at` integer,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'tenant' NOT NULL,
	`avatar_url` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `utilities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`property_id` integer NOT NULL,
	`name` text NOT NULL,
	`charge_type` text DEFAULT 'fixed' NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'UGX' NOT NULL,
	`billing_cycle` text DEFAULT 'monthly' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `utility_bills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` integer NOT NULL,
	`utility_id` integer NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'UGX' NOT NULL,
	`due_date` integer NOT NULL,
	`paid_date` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`period_month` integer NOT NULL,
	`period_year` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`utility_id`) REFERENCES `utilities`(`id`) ON UPDATE no action ON DELETE no action
);
