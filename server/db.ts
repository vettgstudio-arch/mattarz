import fs from "fs";
import path from "path";

// ============= JSON FILE DATABASE =============
// Armazenamento em arquivos JSON - funciona em qualquer sistema sem instalar nada

const DATA_DIR = path.resolve(process.cwd(), "data");

interface DataStore {
  users: any[];
  products: any[];
  priceHistory: any[];
  customers: any[];
  sales: any[];
  saleItems: any[];
  installments: any[];
  stockReplenishment: any[];
  paymentNotifications: any[];
  transactions: any[];
  companySettings: any | null;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`📁 [BANCO DE DADOS] Pasta de dados criada em: ${DATA_DIR}`);
  }
}

function getFilePath(collection: string): string {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection<T>(collection: string): T[] {
  ensureDataDir();
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCollection<T>(collection: string, data: T[]): void {
  ensureDataDir();
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function getNextId(collection: string): number {
  const items = readCollection<any>(collection);
  if (items.length === 0) return 1;
  return Math.max(...items.map((i: any) => i.id || 0)) + 1;
}

function readSingleObject<T>(collection: string): T | null {
  ensureDataDir();
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed || null;
  } catch {
    return null;
  }
}

function writeSingleObject<T>(collection: string, data: T): void {
  ensureDataDir();
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Initialize
export async function getDb() {
  ensureDataDir();
  console.log(`📁 [BANCO DE DADOS] Usando armazenamento local em: ${DATA_DIR}`);
  return true;
}

// Ensure DB is initialized on first use
let _initialized = false;
async function ensureInit() {
  if (!_initialized) {
    ensureDataDir();
    _initialized = true;
    console.log(`✅ [BANCO DE DADOS] Armazenamento local inicializado em: ${DATA_DIR}`);
  }
}

// ============= USERS =============

export async function upsertUser(user: any): Promise<void> {
  await ensureInit();
  if (!user.openId) throw new Error("User openId is required");
  
  const users = readCollection<any>("users");
  const idx = users.findIndex((u: any) => u.openId === user.openId);
  
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...user, updatedAt: new Date().toISOString() };
  } else {
    users.push({
      id: getNextId("users"),
      ...user,
      role: user.role || "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSignedIn: user.lastSignedIn || new Date().toISOString(),
    });
  }
  writeCollection("users", users);
}

export async function getUserByOpenId(openId: string) {
  await ensureInit();
  const users = readCollection<any>("users");
  return users.find((u: any) => u.openId === openId) || undefined;
}

// ============= CATEGORIAS (FIXAS) =============

const FIXED_CATEGORIES = [
  { id: 1, name: "Celular" },
  { id: 2, name: "Fone" },
  { id: 3, name: "Carregador" },
  { id: 4, name: "Notebook" },
  { id: 5, name: "Outros" },
];

export async function getCategories() {
  return FIXED_CATEGORIES;
}

// ============= PRODUTOS =============

export async function getProducts() {
  await ensureInit();
  const items = readCollection<any>("products");
  return items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getProductById(id: number) {
  await ensureInit();
  const items = readCollection<any>("products");
  return items.find((p: any) => p.id === id) || null;
}

export async function getProductsByCategory(categoryId: number) {
  await ensureInit();
  const items = readCollection<any>("products");
  return items.filter((p: any) => p.categoryId === categoryId);
}

export async function createProduct(data: any) {
  await ensureInit();
  const items = readCollection<any>("products");
  const newItem = {
    id: getNextId("products"),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(newItem);
  writeCollection("products", items);
  return newItem;
}

export async function updateProduct(id: number, data: any) {
  await ensureInit();
  const items = readCollection<any>("products");
  const idx = items.findIndex((p: any) => p.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
    writeCollection("products", items);
  }
  return items[idx] || null;
}

export async function deleteProduct(id: number) {
  await ensureInit();
  const items = readCollection<any>("products");
  const filtered = items.filter((p: any) => p.id !== id);
  writeCollection("products", filtered);
}

export async function getLowStockProducts() {
  await ensureInit();
  const items = readCollection<any>("products");
  return items.filter((p: any) => (p.quantity || 0) <= (p.minQuantity || 5));
}

// ============= HISTÓRICO DE PREÇOS =============

export async function getPriceHistory(productId: number) {
  await ensureInit();
  const items = readCollection<any>("priceHistory");
  return items
    .filter((h: any) => h.productId === productId)
    .sort((a: any, b: any) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
}

export async function addPriceHistory(productId: number, oldPrice: string, newPrice: string) {
  await ensureInit();
  const items = readCollection<any>("priceHistory");
  const newItem = {
    id: getNextId("priceHistory"),
    productId,
    oldPrice,
    newPrice,
    changedAt: new Date().toISOString(),
  };
  items.push(newItem);
  writeCollection("priceHistory", items);
  return newItem;
}

// ============= CLIENTES =============

export async function getCustomers() {
  await ensureInit();
  const items = readCollection<any>("customers");
  return items.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
}

export async function getCustomerById(id: number) {
  await ensureInit();
  const items = readCollection<any>("customers");
  return items.find((c: any) => c.id === id) || null;
}

export async function createCustomer(data: any) {
  await ensureInit();
  const items = readCollection<any>("customers");
  const newItem = {
    id: getNextId("customers"),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(newItem);
  writeCollection("customers", items);
  return newItem;
}

export async function updateCustomer(id: number, data: any) {
  await ensureInit();
  const items = readCollection<any>("customers");
  const idx = items.findIndex((c: any) => c.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
    writeCollection("customers", items);
  }
  return items[idx] || null;
}

export async function deleteCustomer(id: number) {
  await ensureInit();
  const items = readCollection<any>("customers");
  const filtered = items.filter((c: any) => c.id !== id);
  writeCollection("customers", filtered);
}

// ============= VENDAS =============

export async function getSales(limit?: number, offset?: number) {
  await ensureInit();
  let items = readCollection<any>("sales");
  items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (offset) items = items.slice(offset);
  if (limit) items = items.slice(0, limit);
  return items;
}

export async function getSaleById(id: number) {
  await ensureInit();
  const items = readCollection<any>("sales");
  return items.find((s: any) => s.id === id) || null;
}

export async function getSalesByCustomer(customerId: number) {
  await ensureInit();
  const items = readCollection<any>("sales");
  return items
    .filter((s: any) => s.customerId === customerId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getSalesByDateRange(startDate: Date, endDate: Date) {
  await ensureInit();
  const items = readCollection<any>("sales");
  return items
    .filter((s: any) => {
      const d = new Date(s.createdAt);
      return d >= startDate && d <= endDate;
    })
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createSale(data: any) {
  await ensureInit();
  const items = readCollection<any>("sales");
  const newItem = {
    id: getNextId("sales"),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(newItem);
  writeCollection("sales", items);
  return newItem;
}

export async function updateSale(id: number, data: any) {
  await ensureInit();
  const items = readCollection<any>("sales");
  const idx = items.findIndex((s: any) => s.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
    writeCollection("sales", items);
  }
  return items[idx] || null;
}

export async function deleteSale(id: number) {
  await ensureInit();
  const sales = readCollection<any>("sales");
  const saleItems = readCollection<any>("saleItems");
  const installments = readCollection<any>("installments");
  const products = readCollection<any>("products");
  
  // Restore product stock before deleting
  const itemsToRestore = saleItems.filter((i: any) => i.saleId === id);
  for (const item of itemsToRestore) {
    const productIdx = products.findIndex((p: any) => p.id === item.productId);
    if (productIdx >= 0) {
      products[productIdx] = {
        ...products[productIdx],
        quantity: (products[productIdx].quantity || 0) + (item.quantity || 0),
        updatedAt: new Date().toISOString(),
      };
    }
  }
  writeCollection("products", products);

  // Delete sale
  const filteredSales = sales.filter((s: any) => s.id !== id);
  writeCollection("sales", filteredSales);
  
  // Delete sale items
  const filteredItems = saleItems.filter((i: any) => i.saleId !== id);
  writeCollection("saleItems", filteredItems);
  
  // Delete installments
  const filteredInstallments = installments.filter((i: any) => i.saleId !== id);
  writeCollection("installments", filteredInstallments);
}

// ============= ITENS DE VENDA =============

export async function getSaleItems(saleId: number) {
  await ensureInit();
  const items = readCollection<any>("saleItems");
  return items.filter((i: any) => i.saleId === saleId);
}

export async function createSaleItem(data: any) {
  await ensureInit();
  const items = readCollection<any>("saleItems");
  const newItem = {
    id: getNextId("saleItems"),
    ...data,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  writeCollection("saleItems", items);
  return newItem;
}

export async function updateSaleItem(id: number, data: any) {
  await ensureInit();
  const items = readCollection<any>("saleItems");
  const idx = items.findIndex((i: any) => i.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
    writeCollection("saleItems", items);
  }
  return items[idx] || null;
}

export async function deleteSaleItem(id: number) {
  await ensureInit();
  const items = readCollection<any>("saleItems");
  const filtered = items.filter((i: any) => i.id !== id);
  writeCollection("saleItems", filtered);
}

// ============= PARCELAS =============

export async function getInstallments(limit?: number, offset?: number) {
  await ensureInit();
  let items = readCollection<any>("installments");
  items.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  if (offset) items = items.slice(offset);
  if (limit) items = items.slice(0, limit);
  return items;
}

export async function getInstallmentById(id: number) {
  await ensureInit();
  const items = readCollection<any>("installments");
  return items.find((i: any) => i.id === id) || null;
}

export async function getInstallmentsBySale(saleId: number) {
  await ensureInit();
  const items = readCollection<any>("installments");
  return items
    .filter((i: any) => i.saleId === saleId)
    .sort((a: any, b: any) => (a.installmentNumber || 0) - (b.installmentNumber || 0));
}

export async function getInstallmentsByCustomer(customerId: number) {
  await ensureInit();
  const items = readCollection<any>("installments");
  return items
    .filter((i: any) => i.customerId === customerId)
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export async function getPendingInstallments() {
  await ensureInit();
  const items = readCollection<any>("installments");
  return items
    .filter((i: any) => i.status === "pending")
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export async function getOverdueInstallments() {
  await ensureInit();
  const now = new Date();
  const items = readCollection<any>("installments");
  return items
    .filter((i: any) => i.status === "pending" && new Date(i.dueDate) <= now)
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export async function createInstallment(data: any) {
  await ensureInit();
  const items = readCollection<any>("installments");
  const newItem = {
    id: getNextId("installments"),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(newItem);
  writeCollection("installments", items);
  return newItem;
}

export async function updateInstallment(id: number, data: any) {
  await ensureInit();
  const items = readCollection<any>("installments");
  const idx = items.findIndex((i: any) => i.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
    writeCollection("installments", items);
  }
  return items[idx] || null;
}

export async function deleteInstallment(id: number) {
  await ensureInit();
  const items = readCollection<any>("installments");
  const filtered = items.filter((i: any) => i.id !== id);
  writeCollection("installments", filtered);
}

// ============= NOTIFICAÇÕES =============

export async function getPaymentNotifications() {
  await ensureInit();
  const items = readCollection<any>("paymentNotifications");
  return items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createPaymentNotification(data: any) {
  await ensureInit();
  const items = readCollection<any>("paymentNotifications");
  const newItem = {
    id: getNextId("paymentNotifications"),
    ...data,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  writeCollection("paymentNotifications", items);
  return newItem;
}

export async function updatePaymentNotification(id: number, data: any) {
  await ensureInit();
  const items = readCollection<any>("paymentNotifications");
  const idx = items.findIndex((n: any) => n.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...data };
    writeCollection("paymentNotifications", items);
  }
  return items[idx] || null;
}

// ============= COMPRAS DE REPOSIÇÃO =============

export async function getStockReplenishments() {
  await ensureInit();
  const items = readCollection<any>("stockReplenishment");
  return items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createStockReplenishment(data: any) {
  await ensureInit();
  const items = readCollection<any>("stockReplenishment");
  const newItem = {
    id: getNextId("stockReplenishment"),
    ...data,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  writeCollection("stockReplenishment", items);
  return newItem;
}

// ============= TRANSAÇÕES (CAPITAL/CAIXA) =============

export async function getTransactions() {
  await ensureInit();
  const items = readCollection<any>("transactions");
  return items.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createTransaction(data: any) {
  await ensureInit();
  const items = readCollection<any>("transactions");
  const newItem = {
    id: getNextId("transactions"),
    ...data,
    date: data.date || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  writeCollection("transactions", items);
  return newItem;
}

export async function deleteTransaction(id: number) {
  await ensureInit();
  const items = readCollection<any>("transactions");
  const filtered = items.filter((t: any) => t.id !== id);
  writeCollection("transactions", filtered);
}

// ============= CONFIGURAÇÕES =============

export async function getCompanySettings() {
  await ensureInit();
  return readSingleObject<any>("companySettings");
}

export async function updateCompanySettings(data: any) {
  await ensureInit();
  const existing = await getCompanySettings();
  const updated = {
    id: existing?.id || 1,
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeSingleObject("companySettings", updated);
  return updated;
}

// ============= DASHBOARD STATS =============

export async function getDashboardStats() {
  await ensureInit();

  const allSales = readCollection<any>("sales");
  const allTransactions = readCollection<any>("transactions");
  const allReplenishments = readCollection<any>("stockReplenishment");
  const allInstallments = readCollection<any>("installments");
  const allProducts = readCollection<any>("products");

  // 1. Total Investido (Capital Inicial + Aportes)
  const totalInvested = allTransactions
    .filter((t: any) => t.type === "capital" || t.type === "aporte")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || "0"), 0);

  // 2. Total Retirado
  const totalWithdrawn = allTransactions
    .filter((t: any) => t.type === "retirada")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || "0"), 0);

  // 3. Total Gasto em Compras (Estoque)
  // Nota: Consideramos o custo de todas as reposições + custo inicial dos produtos cadastrados
  const totalReplenishmentCost = allReplenishments
    .reduce((sum: number, r: any) => sum + parseFloat(r.totalCost || "0"), 0);
  
  // 4. Total Recebido (Vendas à vista + Parcelas pagas)
  const receivedFromSales = allSales
    .filter((s: any) => s.paymentMethod !== "installments")
    .reduce((sum: number, sale: any) => sum + parseFloat(sale.finalAmount || "0"), 0);
  
  const receivedFromInstallments = allInstallments
    .filter((i: any) => i.status === "paid")
    .reduce((sum: number, i: any) => sum + parseFloat(i.amount || "0"), 0);
  
  const totalReceived = receivedFromSales + receivedFromInstallments;

  // 5. Dinheiro no Caixa
  // Caixa = (Investimentos) + (Recebidos) - (Compras de Estoque) - (Retiradas)
  const cashOnHand = totalInvested + totalReceived - totalReplenishmentCost - totalWithdrawn;

  // 6. Lucro Total (Baseado em vendas realizadas)
  let totalRevenue = 0;
  let totalCostOfGoodsSold = 0;
  
  for (const sale of allSales) {
    const items = await getSaleItems(sale.id);
    totalRevenue += parseFloat(sale.finalAmount || "0");
    
    for (const item of items) {
      const product = await getProductById(item.productId);
      totalCostOfGoodsSold += parseFloat(product?.purchasePrice || "0") * item.quantity;
    }
  }
  const totalProfit = totalRevenue - totalCostOfGoodsSold;

  // 7. Outras métricas
  const totalProducts = allProducts.length;
  const lowStockProducts = allProducts.filter((p: any) => (p.quantity || 0) <= (p.minQuantity || 5)).length;
  
  const pendingInstallments = allInstallments.filter((i: any) => i.status === "pending");
  const totalReceivable = pendingInstallments
    .reduce((sum: number, i: any) => sum + parseFloat(i.amount || "0"), 0);
  const pendingInstallmentsCount = pendingInstallments.length;

  // totalToReceive = sum of finalAmount of all installment sales (regardless of paid status)
  const totalToReceive = allSales
    .filter((s: any) => s.paymentMethod === "installments")
    .reduce((sum: number, sale: any) => sum + parseFloat(sale.finalAmount || "0"), 0);

  return {
    totalInvested,
    totalWithdrawn,
    totalReceived,
    cashOnHand,
    totalProfit,
    totalRevenue,
    totalProducts,
    lowStockProducts,
    totalReceivable,
    pendingInstallmentsCount,
    totalToReceive,
    totalReplenishmentCost,
  };
}

export async function getReceivedDetails() {
  await ensureInit();
  
  const allSales = readCollection<any>("sales");
  const allInstallments = readCollection<any>("installments");
  
  // Vendas à vista recebidas
  const cashSales = allSales
    .filter((s: any) => s.paymentMethod !== "installments")
    .map((s: any) => ({
      type: "cash",
      saleId: s.id,
      amount: parseFloat(s.finalAmount || "0"),
      paymentMethod: s.paymentMethod,
      date: s.createdAt,
    }));
  
  // Parcelas pagas
  const paidInstallments = allInstallments
    .filter((i: any) => i.status === "paid")
    .map((i: any) => ({
      type: "installment",
      installmentId: i.id,
      saleId: i.saleId,
      amount: parseFloat(i.amount || "0"),
      installmentNumber: i.installmentNumber,
      totalInstallments: i.totalInstallments,
      paidDate: i.paidDate,
    }));
  
  const totalReceived = [...cashSales, ...paidInstallments]
    .reduce((sum: number, item: any) => sum + item.amount, 0);
  
  return {
    totalReceived,
    items: [...cashSales, ...paidInstallments],
  };
}

export async function getInvestmentDetails() {
  await ensureInit();
  const allProducts = readCollection<any>("products");
  const allReplenishments = readCollection<any>("stockReplenishment");
  
  // Current stock value (products with quantity > 0)
  const stockItems = allProducts
    .filter((p: any) => (p.quantity || 0) > 0)
    .map((p: any) => ({
      productId: p.id,
      productName: p.name,
      quantity: p.quantity,
      unitCost: p.purchasePrice,
      totalCost: parseFloat(p.purchasePrice || "0") * (p.quantity || 0),
      date: p.createdAt,
      type: "stock",
    }))
    .sort((a: any, b: any) => b.totalCost - a.totalCost);

  // Total capital deployed in stock purchases (all replenishments)
  const totalReplenishmentCost = allReplenishments
    .reduce((sum: number, r: any) => sum + parseFloat(r.totalCost || "0"), 0);

  // Total current stock value
  const totalStockValue = stockItems.reduce((sum: number, item: any) => sum + item.totalCost, 0);

  // Also compute total cost of sold goods (capital already converted to sales)
  const allSales = readCollection<any>("sales");
  let totalCOGS = 0;
  for (const sale of allSales) {
    const items = readCollection<any>("saleItems").filter((i: any) => i.saleId === sale.id);
    for (const item of items) {
      const product = allProducts.find((p: any) => p.id === item.productId);
      totalCOGS += parseFloat(product?.purchasePrice || "0") * (item.quantity || 0);
    }
  }

  return {
    totalInvestment: totalStockValue,
    totalReplenishmentCost,
    totalCOGS,
    items: stockItems,
  };
}

export async function getMonthlySalesData(year: number, month: number) {
  await ensureInit();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const allSales = readCollection<any>("sales");
  return allSales
    .filter((s: any) => {
      const d = new Date(s.createdAt);
      return d >= startDate && d <= endDate;
    })
    .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// ============= NOTIFICAÇÕES DE VENCIMENTO =============

export async function getUpcomingAndOverdueInstallments() {
  await ensureInit();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const allInstallments = readCollection<any>("installments");
  return allInstallments
    .filter((i: any) => {
      const status = i.status;
      const dueDate = new Date(i.dueDate);
      return (status === "pending" || status === "overdue") && dueDate <= thirtyDaysFromNow;
    })
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

// ============= DETALHES DE VENDAS DO DIA =============

export async function getSalesTodayWithDetails() {
  await ensureInit();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const allSales = readCollection<any>("sales");
  const salesToday = allSales
    .filter((s: any) => {
      const d = new Date(s.createdAt);
      return d >= today && d < tomorrow;
    })
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const enrichedSales = await Promise.all(
    salesToday.map(async (sale: any) => {
      const items = await getSaleItems(sale.id);
      const customer = await getCustomerById(sale.customerId);
      const installments_list = await getInstallmentsBySale(sale.id);
      return {
        ...sale,
        items,
        customer,
        installments_list,
      };
    })
  );

  return enrichedSales;
}

// ============= LUCRO DETALHADO DO DIA =============

export async function getProfitDetailsToday() {
  await ensureInit();

  // Returns ALL sales (not just today) for full profit analysis
  const allSales = readCollection<any>("sales");
  const sortedSales = [...allSales].sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const details = await Promise.all(
    sortedSales.map(async (sale: any) => {
      const items = await getSaleItems(sale.id);
      const customer = await getCustomerById(sale.customerId);
      
      let totalCost = 0;
      const itemDetails = await Promise.all(
        items.map(async (item: any) => {
          const product = await getProductById(item.productId);
          const itemCost = parseFloat(product?.purchasePrice || "0") * item.quantity;
          totalCost += itemCost;
          
          return {
            ...item,
            productName: product?.name,
            purchasePricePerUnit: product?.purchasePrice,
            itemCost,
            profit: parseFloat(item.subtotal || "0") - itemCost,
          };
        })
      );

      const totalProfit = parseFloat(sale.finalAmount || "0") - totalCost;

      return {
        saleId: sale.id,
        customer,
        totalRevenue: parseFloat(sale.finalAmount || "0"),
        totalCost,
        totalProfit,
        discount: parseFloat(sale.discount || "0"),
        items: itemDetails,
        paymentMethod: sale.paymentMethod,
        createdAt: sale.createdAt,
      };
    })
  );

  return {
    totalSales: details.length,
    totalRevenue: details.reduce((sum: number, d: any) => sum + d.totalRevenue, 0),
    totalCost: details.reduce((sum: number, d: any) => sum + d.totalCost, 0),
    totalProfit: details.reduce((sum: number, d: any) => sum + d.totalProfit, 0),
    sales: details,
  };
}

// ============= GRÁFICO DE VENDAS ÚLTIMOS 7 DIAS =============

export async function getSalesLast7Days() {
  await ensureInit();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 7 dias incluindo hoje

  const allSales = readCollection<any>("sales");
  
  // Criar mapa de dias
  const salesByDay: { [key: string]: number } = {};
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(date.getDate() + i);
    const dateStr = date.toLocaleDateString("pt-BR");
    salesByDay[dateStr] = 0;
  }

  // Agrupar vendas por dia
  allSales.forEach((sale: any) => {
    const saleDate = new Date(sale.createdAt);
    saleDate.setHours(0, 0, 0, 0);
    
    if (saleDate >= sevenDaysAgo && saleDate <= today) {
      const dateStr = saleDate.toLocaleDateString("pt-BR");
      salesByDay[dateStr] += parseFloat(sale.finalAmount || "0");
    }
  });

  // Converter para array ordenado
  return Object.entries(salesByDay).map(([day, sales]) => ({
    day,
    sales: parseFloat(sales.toFixed(2)),
  }));
}

// ============= GRÁFICO DE LUCRO ÚLTIMOS 7 DIAS =============

export async function getProfitLast7Days() {
  await ensureInit();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const allSales = readCollection<any>("sales");
  
  // Criar mapa de dias
  const profitByDay: { [key: string]: { custo: number; lucro: number } } = {};
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(date.getDate() + i);
    const dateStr = date.toLocaleDateString("pt-BR");
    profitByDay[dateStr] = { custo: 0, lucro: 0 };
  }

  // Calcular lucro por dia
  await Promise.all(
    allSales.map(async (sale: any) => {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0);
      
      if (saleDate >= sevenDaysAgo && saleDate <= today) {
        const dateStr = saleDate.toLocaleDateString("pt-BR");
        const items = await getSaleItems(sale.id);
        
        let totalCost = 0;
        for (const item of items) {
          const product = await getProductById(item.productId);
          const itemCost = parseFloat(product?.purchasePrice || "0") * item.quantity;
          totalCost += itemCost;
        }
        
        const revenue = parseFloat(sale.finalAmount || "0");
        const profit = revenue - totalCost;
        
        profitByDay[dateStr].custo += totalCost;
        profitByDay[dateStr].lucro += profit;
      }
    })
  );

  // Converter para array ordenado
  return Object.entries(profitByDay).map(([month, data]) => ({
    month,
    custo: parseFloat(data.custo.toFixed(2)),
    lucro: parseFloat(data.lucro.toFixed(2)),
  }));
}
