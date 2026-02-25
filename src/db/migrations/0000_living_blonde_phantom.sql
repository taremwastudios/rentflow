CREATE TABLE "rentflow"."inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"landlord_id" integer NOT NULL,
	"visitor_name" text NOT NULL,
	"visitor_email" text,
	"visitor_phone" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rentflow"."landlord_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_name" text,
	"bio" text,
	"location" text DEFAULT 'Mbarara, Uganda' NOT NULL,
	"verification_status" text DEFAULT 'pending' NOT NULL,
	"verification_notes" text,
	"national_id_url" text,
	"land_title_url" text,
	"registration_doc_url" text,
	"additional_docs_url" text,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rentflow"."platform_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subscription_id" integer,
	"plan_id" integer,
	"amount_usd" double precision NOT NULL,
	"crypto_amount" double precision,
	"currency" text NOT NULL,
	"nowpayments_payment_id" text NOT NULL,
	"nowpayments_order_id" text,
	"payment_status" text DEFAULT 'waiting' NOT NULL,
	"pay_address" text,
	"ipn_data" text,
	"payment_url" text,
	"type" text DEFAULT 'subscription' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "platform_payments_nowpayments_payment_id_unique" UNIQUE("nowpayments_payment_id")
);
--> statement-breakpoint
CREATE TABLE "rentflow"."properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"landlord_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"address" text NOT NULL,
	"city" text DEFAULT 'Mbarara' NOT NULL,
	"district" text DEFAULT 'Mbarara' NOT NULL,
	"country" text DEFAULT 'Uganda' NOT NULL,
	"property_type" text DEFAULT 'apartment' NOT NULL,
	"total_units" integer DEFAULT 1 NOT NULL,
	"cover_image_url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"template_id" text DEFAULT 'default',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rentflow"."property_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rentflow"."reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"landlord_id" integer NOT NULL,
	"tenant_id" integer,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"sent_at" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rentflow"."rent_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"landlord_id" integer NOT NULL,
	"amount" double precision NOT NULL,
	"currency" text DEFAULT 'UGX' NOT NULL,
	"payment_date" timestamp,
	"due_date" timestamp NOT NULL,
	"period_month" integer NOT NULL,
	"period_year" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"reference_number" text,
	"notes" text,
	"late_fee" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rentflow"."sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rentflow"."subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"price_usd_monthly" double precision DEFAULT 0 NOT NULL,
	"price_usd_annually" double precision,
	"setup_fee_usd" double precision DEFAULT 0 NOT NULL,
	"features" text NOT NULL,
	"property_limit" integer NOT NULL,
	"unit_limit" integer NOT NULL,
	"storage_gb" double precision DEFAULT 1 NOT NULL,
	"priority_support" boolean DEFAULT false NOT NULL,
	"priority_multiplier" double precision DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "subscription_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rentflow"."subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"expires_at" timestamp,
	"billing_cycle" text DEFAULT 'monthly' NOT NULL,
	"nowpayments_payment_id" text,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rentflow"."tenancy_agreements" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"landlord_id" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"monthly_rent" double precision NOT NULL,
	"deposit_amount" double precision DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'UGX' NOT NULL,
	"payment_due_day" integer DEFAULT 1 NOT NULL,
	"terms" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"signed_by_tenant" boolean DEFAULT false NOT NULL,
	"signed_by_landlord" boolean DEFAULT false NOT NULL,
	"document_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rentflow"."tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"landlord_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"national_id" text,
	"emergency_contact" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rentflow"."units" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"unit_number" text NOT NULL,
	"floor" integer,
	"bedrooms" integer DEFAULT 1 NOT NULL,
	"bathrooms" integer DEFAULT 1 NOT NULL,
	"size_sqft" double precision,
	"monthly_rent" double precision NOT NULL,
	"currency" text DEFAULT 'UGX' NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rentflow"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'tenant' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "rentflow"."utilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"name" text NOT NULL,
	"charge_type" text DEFAULT 'fixed' NOT NULL,
	"amount" double precision DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'UGX' NOT NULL,
	"billing_cycle" text DEFAULT 'monthly' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rentflow"."utility_bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"utility_id" integer NOT NULL,
	"amount" double precision NOT NULL,
	"currency" text DEFAULT 'UGX' NOT NULL,
	"due_date" timestamp NOT NULL,
	"paid_date" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"period_month" integer NOT NULL,
	"period_year" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "rentflow"."inquiries" ADD CONSTRAINT "inquiries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "rentflow"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."inquiries" ADD CONSTRAINT "inquiries_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "rentflow"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."landlord_profiles" ADD CONSTRAINT "landlord_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "rentflow"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."landlord_profiles" ADD CONSTRAINT "landlord_profiles_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "rentflow"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."platform_payments" ADD CONSTRAINT "platform_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "rentflow"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."platform_payments" ADD CONSTRAINT "platform_payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "rentflow"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."platform_payments" ADD CONSTRAINT "platform_payments_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "rentflow"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."properties" ADD CONSTRAINT "properties_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "rentflow"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "rentflow"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."reminders" ADD CONSTRAINT "reminders_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "rentflow"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."reminders" ADD CONSTRAINT "reminders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "rentflow"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."rent_payments" ADD CONSTRAINT "rent_payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "rentflow"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."rent_payments" ADD CONSTRAINT "rent_payments_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "rentflow"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."rent_payments" ADD CONSTRAINT "rent_payments_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "rentflow"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "rentflow"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "rentflow"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "rentflow"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."tenancy_agreements" ADD CONSTRAINT "tenancy_agreements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "rentflow"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."tenancy_agreements" ADD CONSTRAINT "tenancy_agreements_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "rentflow"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."tenancy_agreements" ADD CONSTRAINT "tenancy_agreements_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "rentflow"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."tenants" ADD CONSTRAINT "tenants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "rentflow"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."tenants" ADD CONSTRAINT "tenants_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "rentflow"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."tenants" ADD CONSTRAINT "tenants_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "rentflow"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."units" ADD CONSTRAINT "units_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "rentflow"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."utilities" ADD CONSTRAINT "utilities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "rentflow"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."utility_bills" ADD CONSTRAINT "utility_bills_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "rentflow"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentflow"."utility_bills" ADD CONSTRAINT "utility_bills_utility_id_utilities_id_fk" FOREIGN KEY ("utility_id") REFERENCES "rentflow"."utilities"("id") ON DELETE no action ON UPDATE no action;