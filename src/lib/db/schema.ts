import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Businesses (Tenants)
export const businesses = sqliteTable('businesses', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    whatsappNumber: text('whatsapp_number').unique().notNull(),
    industry: text('industry'),
    timezone: text('timezone').default('UTC'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// Users (Business Owners/Staff)
export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    businessId: text('business_id').notNull().references(() => businesses.id),
    name: text('name').notNull(),
    email: text('email').unique(),
    role: text('role').default('admin'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// Customers
export const customers = sqliteTable('customers', {
    id: text('id').primaryKey(),
    businessId: text('business_id').notNull().references(() => businesses.id),
    name: text('name').notNull(),
    phoneNumber: text('phone_number'),
    email: text('email'),
    address: text('address'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// Inventory / Products
export const products = sqliteTable('products', {
    id: text('id').primaryKey(),
    businessId: text('business_id').notNull().references(() => businesses.id),
    name: text('name').notNull(),
    description: text('description'),
    price: real('price').notNull(),
    currency: text('currency').default('USD'),
    stockQuantity: integer('stock_quantity').default(0),
    lowStockThreshold: integer('low_stock_threshold').default(5),
    updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// Documents (Quotes and Invoices)
export const documents = sqliteTable('documents', {
    id: text('id').primaryKey(),
    businessId: text('business_id').notNull().references(() => businesses.id),
    customerId: text('customer_id').notNull().references(() => customers.id),
    type: text('type').notNull(), // 'quote' | 'invoice'
    status: text('status').default('draft'), // draft, sent, accepted, declined, paid, void
    totalAmount: real('total_amount').notNull(),
    taxAmount: real('tax_amount').default(0),
    shippingAmount: real('shipping_amount').default(0),
    items: text('items').notNull(), // JSON array of {product_id, name, quantity, price}
    notes: text('notes'),
    dueDate: text('due_date'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// Conversation Logs
export const messageLogs = sqliteTable('message_logs', {
    id: text('id').primaryKey(),
    businessId: text('business_id').notNull().references(() => businesses.id),
    senderPhone: text('sender_phone').notNull(),
    role: text('role').notNull(), // 'user' | 'assistant' | 'system'
    content: text('content').notNull(),
    tokensUsed: integer('tokens_used'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// Settings / Configuration
export const businessSettings = sqliteTable('business_settings', {
    businessId: text('business_id').primaryKey().references(() => businesses.id),
    autoFollowupEnabled: integer('auto_followup_enabled', { mode: 'boolean' }).default(true),
    lowStockAlertsEnabled: integer('low_stock_alerts_enabled', { mode: 'boolean' }).default(true),
    invoicePrefix: text('invoice_prefix').default('INV-'),
    quotePrefix: text('quote_prefix').default('QT-'),
});

// Expenses (Phase 3)
export const expenses = sqliteTable('expenses', {
    id: text('id').primaryKey(),
    businessId: text('business_id').notNull().references(() => businesses.id),
    merchant: text('merchant').notNull(),
    amount: real('amount').notNull(),
    taxAmount: real('tax_amount').default(0),
    currency: text('currency').default('USD'),
    category: text('category'),
    expenseDate: text('expense_date').notNull(),
    imageUrl: text('image_url'),
    notes: text('notes'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// Type exports
export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type MessageLog = typeof messageLogs.$inferSelect;
export type NewMessageLog = typeof messageLogs.$inferInsert;
export type BusinessSettings = typeof businessSettings.$inferSelect;
export type NewBusinessSettings = typeof businessSettings.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
