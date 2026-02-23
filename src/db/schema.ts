import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ─── Users (all roles) ───────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "landlord", "tenant"] }).notNull().default("tenant"),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Landlord Profiles & Verification ────────────────────────────────────────
export const landlordProfiles = sqliteTable("landlord_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  businessName: text("business_name"),
  bio: text("bio"),
  location: text("location").notNull().default("Mbarara, Uganda"),
  verificationStatus: text("verification_status", {
    enum: ["pending", "under_review", "approved", "rejected"],
  }).notNull().default("pending"),
  verificationNotes: text("verification_notes"),
  nationalIdUrl: text("national_id_url"),
  landTitleUrl: text("land_title_url"),
  registrationDocUrl: text("registration_doc_url"),
  additionalDocsUrl: text("additional_docs_url"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Properties ───────────────────────────────────────────────────────────────
export const properties = sqliteTable("properties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  landlordId: integer("landlord_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull().default("Mbarara"),
  district: text("district").notNull().default("Mbarara"),
  country: text("country").notNull().default("Uganda"),
  propertyType: text("property_type", {
    enum: ["apartment", "house", "commercial", "studio", "hostel", "other"],
  }).notNull().default("apartment"),
  totalUnits: integer("total_units").notNull().default(1),
  coverImageUrl: text("cover_image_url"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  templateId: text("template_id").default("default"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Property Images ──────────────────────────────────────────────────────────
export const propertyImages = sqliteTable("property_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Units (individual rentable spaces within a property) ────────────────────
export const units = sqliteTable("units", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  unitNumber: text("unit_number").notNull(),
  floor: integer("floor"),
  bedrooms: integer("bedrooms").notNull().default(1),
  bathrooms: integer("bathrooms").notNull().default(1),
  sizesqft: real("size_sqft"),
  monthlyRent: real("monthly_rent").notNull(),
  currency: text("currency").notNull().default("UGX"),
  status: text("status", {
    enum: ["available", "occupied", "maintenance", "reserved"],
  }).notNull().default("available"),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Utilities ────────────────────────────────────────────────────────────────
export const utilities = sqliteTable("utilities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  name: text("name").notNull(), // e.g. "Water", "Electricity", "Garbage"
  chargeType: text("charge_type", { enum: ["fixed", "per_unit", "included"] }).notNull().default("fixed"),
  amount: real("amount").notNull().default(0),
  currency: text("currency").notNull().default("UGX"),
  billingCycle: text("billing_cycle", { enum: ["monthly", "quarterly", "yearly"] }).notNull().default("monthly"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Tenants ──────────────────────────────────────────────────────────────────
export const tenants = sqliteTable("tenants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id), // optional: tenant may not have account
  landlordId: integer("landlord_id").notNull().references(() => users.id),
  unitId: integer("unit_id").notNull().references(() => units.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  nationalId: text("national_id"),
  emergencyContact: text("emergency_contact"),
  status: text("status", { enum: ["active", "former", "pending"] }).notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Tenancy Agreements ───────────────────────────────────────────────────────
export const tenancyAgreements = sqliteTable("tenancy_agreements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  unitId: integer("unit_id").notNull().references(() => units.id),
  landlordId: integer("landlord_id").notNull().references(() => users.id),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }),
  monthlyRent: real("monthly_rent").notNull(),
  depositAmount: real("deposit_amount").notNull().default(0),
  currency: text("currency").notNull().default("UGX"),
  paymentDueDay: integer("payment_due_day").notNull().default(1), // day of month
  terms: text("terms"), // full agreement text
  status: text("status", {
    enum: ["draft", "active", "expired", "terminated"],
  }).notNull().default("draft"),
  signedByTenant: integer("signed_by_tenant", { mode: "boolean" }).notNull().default(false),
  signedByLandlord: integer("signed_by_landlord", { mode: "boolean" }).notNull().default(false),
  documentUrl: text("document_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Rent Payments ────────────────────────────────────────────────────────────
export const rentPayments = sqliteTable("rent_payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  unitId: integer("unit_id").notNull().references(() => units.id),
  landlordId: integer("landlord_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("UGX"),
  paymentDate: integer("payment_date", { mode: "timestamp" }),
  dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
  periodMonth: integer("period_month").notNull(), // 1-12
  periodYear: integer("period_year").notNull(),
  status: text("status", {
    enum: ["pending", "paid", "overdue", "partial", "waived"],
  }).notNull().default("pending"),
  paymentMethod: text("payment_method"), // e.g. "Mobile Money", "Cash", "Bank Transfer"
  referenceNumber: text("reference_number"),
  notes: text("notes"),
  lateFee: real("late_fee").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Utility Bills ────────────────────────────────────────────────────────────
export const utilityBills = sqliteTable("utility_bills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  utilityId: integer("utility_id").notNull().references(() => utilities.id),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("UGX"),
  dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
  paidDate: integer("paid_date", { mode: "timestamp" }),
  status: text("status", { enum: ["pending", "paid", "overdue"] }).notNull().default("pending"),
  periodMonth: integer("period_month").notNull(),
  periodYear: integer("period_year").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Reminders / Notifications ────────────────────────────────────────────────
export const reminders = sqliteTable("reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  landlordId: integer("landlord_id").notNull().references(() => users.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  type: text("type", {
    enum: ["rent_due", "rent_overdue", "agreement_expiry", "utility_due", "custom"],
  }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }).notNull(),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  status: text("status", { enum: ["pending", "sent", "failed"] }).notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Property Inquiries (from public visitors) ────────────────────────────────
export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  landlordId: integer("landlord_id").notNull().references(() => users.id),
  visitorName: text("visitor_name").notNull(),
  visitorEmail: text("visitor_email"),
  visitorPhone: text("visitor_phone").notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: ["new", "read", "replied", "closed"] }).notNull().default("new"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Sessions (simple auth) ───────────────────────────────────────────────────
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
