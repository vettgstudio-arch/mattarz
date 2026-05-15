import { 
  integer, 
  sqliteTable, 
  text,
  real
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updatedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastSignedIn: text("lastSignedIn").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categorias de produtos (fixas no sistema)
 */
export const productCategories = sqliteTable("product_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updatedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = typeof productCategories.$inferInsert;

/**
 * Produtos com informações de estoque e preços
 */
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").unique(),
  purchasePrice: text("purchase_price").notNull(),
  salePrice: text("sale_price").notNull(),
  quantity: integer("quantity").default(0).notNull(),
  minQuantity: integer("min_quantity").default(5).notNull(),
  productType: text("product_type"),
  model: text("model"),
  ram: text("ram"),
  storage: text("storage"),
  imageUrl: text("image_url"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updatedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Histórico de alterações de preço
 */
export const priceHistory = sqliteTable("price_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  oldPrice: text("old_price").notNull(),
  newPrice: text("new_price").notNull(),
  changedAt: text("changed_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

/**
 * Clientes
 */
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  cpf: text("cpf").unique(),
  notes: text("notes"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updatedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Vendas
 */
export const sales = sqliteTable("sales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull(),
  totalAmount: text("total_amount").notNull(),
  discount: text("discount").default("0").notNull(),
  finalAmount: text("final_amount").notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, card, transfer, installments
  installments: integer("installments").default(1).notNull(),
  status: text("status").default("completed").notNull(), // completed, pending, cancelled
  notes: text("notes"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updatedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * Itens de venda (produtos vendidos em cada venda)
 */
export const saleItems = sqliteTable("sale_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saleId: integer("sale_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unit_price").notNull(),
  subtotal: text("subtotal").notNull(),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = typeof saleItems.$inferInsert;

/**
 * Parcelas/Contas a Receber
 */
export const installments = sqliteTable("installments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saleId: integer("sale_id").notNull(),
  customerId: integer("customer_id").notNull(),
  amount: text("amount").notNull(),
  installmentNumber: integer("installment_number").notNull(),
  totalInstallments: integer("total_installments").notNull(),
  dueDate: text("due_date").notNull(),
  paidDate: text("paid_date"),
  status: text("status").default("pending").notNull(), // pending, paid, overdue
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updatedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Installment = typeof installments.$inferSelect;
export type InsertInstallment = typeof installments.$inferInsert;

/**
 * Compras de reposição de estoque
 */
export const stockReplenishment = sqliteTable("stock_replenishment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: text("unit_cost").notNull(),
  totalCost: text("total_cost").notNull(),
  supplier: text("supplier"),
  notes: text("notes"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type StockReplenishment = typeof stockReplenishment.$inferSelect;
export type InsertStockReplenishment = typeof stockReplenishment.$inferInsert;

/**
 * Notificações de cobrança
 */
export const paymentNotifications = sqliteTable("payment_notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  installmentId: integer("installment_id").notNull(),
  customerId: integer("customer_id").notNull(),
  type: text("type").notNull(), // overdue, upcoming, reminder
  message: text("message").notNull(),
  sent: integer("sent", { mode: "boolean" }).default(false).notNull(),
  sentAt: text("sent_at"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type PaymentNotification = typeof paymentNotifications.$inferSelect;
export type InsertPaymentNotification = typeof paymentNotifications.$inferInsert;

/**
 * Configurações da empresa
 */
export const companySettings = sqliteTable("company_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyName: text("company_name").notNull(),
  cnpj: text("cnpj"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  website: text("website"),
  logo: text("logo"),
  updatedAt: text("updatedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = typeof companySettings.$inferInsert;
