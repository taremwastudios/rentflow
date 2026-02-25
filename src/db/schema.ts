import { pgSchema, text, integer, doublePrecision, timestamp, boolean, serial } from "drizzle-orm/pg-core";

export const rentflowSchema = pgSchema("rentflow");

// ─── Users (all roles) ───────────────────────────────────────────────────────
export const users = rentflowSchema.table("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("tenant"), // Roles: admin, landlord, tenant
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// ─── Landlord Profiles & Verification ────────────────────────────────────────
export const landlordProfiles = rentflowSchema.table("landlord_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessName: text("business_name"),
  bio: text("bio"),
  location: text("location").notNull().default("Mbarara, Uganda"),
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, under_review, approved, rejected
  verificationNotes: text("verification_notes"),
  nationalIdUrl: text("national_id_url"),
  landTitleUrl: text("land_title_url"),
  registrationDocUrl: text("registration_doc_url"),
  additionalDocsUrl: text("additional_docs_url"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Properties ───────────────────────────────────────────────────────────────
export const properties = rentflowSchema.table("properties", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull().default("Mbarara"),
  district: text("district").notNull().default("Mbarara"),
  country: text("country").notNull().default("Uganda"),
  propertyType: text("property_type").notNull().default("apartment"), // apartment, house, commercial, studio, hostel, other
  totalUnits: integer("total_units").notNull().default(1),
  coverImageUrl: text("cover_image_url"),
  isPublished: boolean("is_published").notNull().default(false),
  templateId: text("template_id").default("default"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// ─── Property Images ──────────────────────────────────────────────────────────
export const propertyImages = rentflowSchema.table("property_images", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Units (individual rentable spaces within a property) ────────────────────
export const units = rentflowSchema.table("units", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  unitNumber: text("unit_number").notNull(),
  floor: integer("floor"),
  bedrooms: integer("bedrooms").notNull().default(1),
  bathrooms: integer("bathrooms").notNull().default(1),
  sizesqft: doublePrecision("size_sqft"),
  monthlyRent: doublePrecision("monthly_rent").notNull(),
  currency: text("currency").notNull().default("UGX"),
  status: text("status").notNull().default("available"), // available, occupied, maintenance, reserved
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Utilities ────────────────────────────────────────────────────────────────
export const utilities = rentflowSchema.table("utilities", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  name: text("name").notNull(), // e.g. "Water", "Electricity", "Garbage"
  chargeType: text("charge_type").notNull().default("fixed"), // fixed, per_unit, included
  amount: doublePrecision("amount").notNull().default(0),
  currency: text("currency").notNull().default("UGX"),
  billingCycle: text("billing_cycle").notNull().default("monthly"), // monthly, quarterly, yearly
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Tenants ──────────────────────────────────────────────────────────────────
export const tenants = rentflowSchema.table("tenants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // optional: tenant may not have account
  landlordId: integer("landlord_id").notNull().references(() => users.id),
  unitId: integer("unit_id").notNull().references(() => units.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  nationalId: text("national_id"),
  emergencyContact: text("emergency_contact"),
  status: text("status").notNull().default("active"), // active, former, pending
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Tenancy Agreements ───────────────────────────────────────────────────────
export const tenancyAgreements = rentflowSchema.table("tenancy_agreements", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  unitId: integer("unit_id").notNull().references(() => units.id),
  landlordId: integer("landlord_id").notNull().references(() => users.id),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }),
  monthlyRent: doublePrecision("monthly_rent").notNull(),
  depositAmount: doublePrecision("deposit_amount").notNull().default(0),
  currency: text("currency").notNull().default("UGX"),
  paymentDueDay: integer("payment_due_day").notNull().default(1), // day of month
  terms: text("terms"), // full agreement text
  status: text("status").notNull().default("draft"), // draft, active, expired, terminated
  signedByTenant: boolean("signed_by_tenant").notNull().default(false),
  signedByLandlord: boolean("signed_by_landlord").notNull().default(false),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Rent Payments ────────────────────────────────────────────────────────────
export const rentPayments = rentflowSchema.table("rent_payments", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  unitId: integer("unit_id").notNull().references(() => units.id),
  landlordId: integer("landlord_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull().default("UGX"),
  paymentDate: timestamp("payment_date", { mode: "date" }),
  dueDate: timestamp("due_date", { mode: "date" }).notNull(),
  periodMonth: integer("period_month").notNull(), // 1-12
  periodYear: integer("period_year").notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, overdue, partial, waived
  paymentMethod: text("payment_method"), // e.g. "Mobile Money", "Cash", "Bank Transfer"
  referenceNumber: text("reference_number"),
  notes: text("notes"),
  lateFee: doublePrecision("late_fee").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Utility Bills ────────────────────────────────────────────────────────────
export const utilityBills = rentflowSchema.table("utility_bills", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  utilityId: integer("utility_id").notNull().references(() => utilities.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull().default("UGX"),
  dueDate: timestamp("due_date", { mode: "date" }).notNull(),
  paidDate: timestamp("paid_date", { mode: "date" }),
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  periodMonth: integer("period_month").notNull(),
  periodYear: integer("period_year").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Reminders / Notifications ────────────────────────────────────────────────
export const reminders = rentflowSchema.table("reminders", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").notNull().references(() => users.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  type: text("type").notNull(), // rent_due, rent_overdue, agreement_expiry, utility_due, custom
  title: text("title").notNull(),
  message: text("message").notNull(),
  scheduledAt: timestamp("scheduled_at", { mode: "date" }).notNull(),
  sentAt: timestamp("sent_at", { mode: "date" }),
  status: text("status").notNull().default("pending"), // pending, sent, failed
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Property Inquiries (from public visitors) ────────────────────────────────
export const inquiries = rentflowSchema.table("inquiries", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  landlordId: integer("landlord_id").notNull().references(() => users.id),
  visitorName: text("visitor_name").notNull(),
  visitorEmail: text("visitor_email"),
  visitorPhone: text("visitor_phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // new, read, replied, closed
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Sessions (simple auth) ───────────────────────────────────────────────────
export const sessions = rentflowSchema.table("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Subscription Plans ──────────────────────────────────────────────────────
export const subscriptionPlans = rentflowSchema.table("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Free", "Starter", "Businessman", "Pro", "Estate"
  slug: text("slug").notNull().unique(), // "free", "starter", "businessman", "pro", "estate"
  description: text("description"),
  priceUsdMonthly: doublePrecision("price_usd_monthly").notNull().default(0),
  priceUsdAnnually: doublePrecision("price_usd_annually"),
  setupFeeUsd: doublePrecision("setup_fee_usd").notNull().default(0),
  features: text("features").notNull(), // JSON array of features
  propertyLimit: integer("property_limit").notNull(), // -1 for unlimited
  unitLimit: integer("unit_limit").notNull(), // -1 for unlimited
  storageGb: doublePrecision("storage_gb").notNull().default(1),
  prioritySupport: boolean("priority_support").notNull().default(false),
  priorityMultiplier: doublePrecision("priority_multiplier").notNull().default(1), // for featured listings
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── User Subscriptions ───────────────────────────────────────────────────────
export const subscriptions = rentflowSchema.table("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: text("status").notNull().default("pending"), // active, expired, cancelled, pending, paused
  startedAt: timestamp("started_at", { mode: "date" }),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  billingCycle: text("billing_cycle").notNull().default("monthly"), // monthly, annually
  nowpaymentsPaymentId: text("nowpayments_payment_id"), // for tracking crypto payments
  autoRenew: boolean("auto_renew").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// ─── Platform Payments (NOWPayments crypto) ───────────────────────────────────
export const platformPayments = rentflowSchema.table("platform_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  planId: integer("plan_id").references(() => subscriptionPlans.id),
  amountUsd: doublePrecision("amount_usd").notNull(),
  cryptoAmount: doublePrecision("crypto_amount"),
  currency: text("currency").notNull(), // crypto currency (BTC, ETH, USDT, etc.)
  nowpaymentsPaymentId: text("nowpayments_payment_id").notNull().unique(),
  nowpaymentsOrderId: text("nowpayments_order_id"),
  paymentStatus: text("payment_status").notNull().default("waiting"), // waiting, confirming, confirmed, finished, failed, expired, refunded
  payAddress: text("pay_address"), // crypto wallet address to pay to
  ipnData: text("ipn_data"), // JSON data from IPN webhook
  paymentUrl: text("payment_url"), // NOWPayments checkout URL
  type: text("type").notNull().default("subscription"), // subscription, setup_fee, upgrade
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});
