import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  stock: integer("stock").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
  deletedAt: text("deleted_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_products_category_active").on(table.category, table.isActive, table.isDeleted)]);

export const adminCredentials = sqliteTable("admin_credentials", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: text("locked_until"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("idx_admin_credentials_username").on(table.username)]);

export const adminSessions = sqliteTable("admin_sessions", {
  id: text("id").primaryKey(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_admin_sessions_token_hash").on(table.tokenHash),
  index("idx_admin_sessions_expires_at").on(table.expiresAt),
]);

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  province: text("province").notNull().default(""),
  city: text("city").notNull().default(""),
  address: text("address").notNull().default(""),
  postalCode: text("postal_code").notNull().default(""),
  unit: text("unit").notNull().default(""),
  passwordHash: text("password_hash"),
  passwordSalt: text("password_salt"),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: text("locked_until"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: text("last_login_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_customers_email").on(table.email).where(sql`${table.email} <> ''`),
  index("idx_customers_phone").on(table.phone),
]);

export const customerSessions = sqliteTable("customer_sessions", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_customer_sessions_token_hash").on(table.tokenHash),
  index("idx_customer_sessions_customer").on(table.customerId),
  index("idx_customer_sessions_expires").on(table.expiresAt),
]);

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  orderNumber: text("order_number").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  province: text("province").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  postalCode: text("postal_code").notNull(),
  unit: text("unit").notNull().default(""),
  note: text("note").notNull().default(""),
  shippingMethod: text("shipping_method").notNull(),
  paymentMethod: text("payment_method").notNull().default("online"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentAuthority: text("payment_authority"),
  paymentRefId: text("payment_ref_id"),
  paymentCardPan: text("payment_card_pan"),
  paidAt: text("paid_at"),
  status: text("status").notNull().default("pending_payment"),
  subtotal: integer("subtotal").notNull(),
  shippingCost: integer("shipping_cost").notNull(),
  total: integer("total").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_orders_order_number").on(table.orderNumber),
  index("idx_orders_phone_created").on(table.phone, table.createdAt),
  index("idx_orders_customer_created").on(table.customerId, table.createdAt),
  index("idx_orders_status_created").on(table.status, table.createdAt),
  uniqueIndex("idx_orders_payment_authority").on(table.paymentAuthority),
]);

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: integer("line_total").notNull(),
}, (table) => [index("idx_order_items_order_id").on(table.orderId)]);

export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("idx_newsletter_email").on(table.email)]);

export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  fullName: text("full_name").notNull(),
  company: text("company").notNull().default(""),
  phone: text("phone").notNull(),
  email: text("email").notNull().default(""),
  city: text("city").notNull(),
  subject: text("subject").notNull(),
  details: text("details").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_inquiries_type_created").on(table.type, table.createdAt)]);
