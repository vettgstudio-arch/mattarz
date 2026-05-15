import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= CATEGORIAS (FIXAS) =============
  categories: router({
    list: protectedProcedure.query(async () => {
      return db.getCategories();
    }),
  }),

  // ============= PRODUTOS =============
  products: router({
    list: protectedProcedure.query(async () => {
      return db.getProducts();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProductById(input.id);
      }),
    getByCategory: protectedProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return db.getProductsByCategory(input.categoryId);
      }),
    create: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        purchasePrice: z.string(),
        salePrice: z.string(),
        quantity: z.number().default(0),
        minQuantity: z.number().default(5),
        productType: z.string().optional(),
        model: z.string().optional(),
        ram: z.string().optional(),
        storage: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // If adding initial stock, validate cash on hand
        if (input.quantity > 0 && parseFloat(input.purchasePrice) > 0) {
          const stats = await db.getDashboardStats();
          const cashOnHand = stats.cashOnHand;
          const purchaseCost = parseFloat(input.purchasePrice) * input.quantity;

          if (cashOnHand < purchaseCost) {
            throw new Error(
              `Saldo insuficiente no caixa. Disponível: R$ ${cashOnHand.toFixed(2).replace('.', ',')}, necessário: R$ ${purchaseCost.toFixed(2).replace('.', ',')}. Adicione capital ao caixa antes de cadastrar produtos com estoque inicial.`
            );
          }

          // Register as stock replenishment so cash flow is tracked
          await db.createStockReplenishment({
            productId: 0, // will be set after product creation; we log it separately
            quantity: input.quantity,
            unitCost: input.purchasePrice,
            totalCost: purchaseCost.toFixed(2),
            notes: `Estoque inicial ao cadastrar produto`,
          });
        }
        return db.createProduct(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        categoryId: z.number().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        purchasePrice: z.string().optional(),
        salePrice: z.string().optional(),
        quantity: z.number().optional(),
        minQuantity: z.number().optional(),
        productType: z.string().optional(),
        model: z.string().optional(),
        ram: z.string().optional(),
        storage: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateProduct(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteProduct(input.id);
      }),
    getLowStock: protectedProcedure.query(async () => {
      return db.getLowStockProducts();
    }),
  }),

  // ============= HISTÓRICO DE PREÇOS =============
  priceHistory: router({
    getByProduct: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return db.getPriceHistory(input.productId);
      }),
  }),

  // ============= CLIENTES =============
  customers: router({
    list: protectedProcedure.query(async () => {
      return db.getCustomers();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCustomerById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        whatsapp: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createCustomer(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        whatsapp: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateCustomer(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteCustomer(input.id);
      }),
  }),

  // ============= VENDAS =============
  sales: router({
    list: protectedProcedure.query(async () => {
      return db.getSales();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getSaleById(input.id);
      }),
    getByCustomer: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return db.getSalesByCustomer(input.customerId);
      }),
    getByDateRange: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return db.getSalesByDateRange(input.startDate, input.endDate);
      }),
    create: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        totalAmount: z.string(),
        discount: z.string().default("0"),
        finalAmount: z.string(),
        paymentMethod: z.enum(["cash", "card", "transfer", "installments"]),
        installments: z.number().default(1),
        status: z.enum(["completed", "pending", "cancelled"]).default("completed"),
        notes: z.string().optional(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          unitPrice: z.string(),
          subtotal: z.string(),
        })),
        installmentDates: z.array(z.string()).optional(),
        installmentAmounts: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { items, installmentDates, installmentAmounts, ...saleData } = input;
        const sale = await db.createSale(saleData);
        const saleId = (sale as any).id;
        
        // Create sale items and update product stock
        for (const item of items) {
          await db.createSaleItem({
            saleId,
            ...item,
          });
          
          // Update product stock
          const product = await db.getProductById(item.productId);
          if (product) {
            const newQuantity = Math.max(0, (product.quantity || 0) - item.quantity);
            await db.updateProduct(item.productId, { quantity: newQuantity });
          }
        }

        // Create installments if payment method is installments
        if (input.paymentMethod === "installments" && input.installments >= 1) {
          const defaultAmount = (parseFloat(input.finalAmount) / input.installments).toFixed(2);
          for (let i = 1; i <= input.installments; i++) {
            let dueDate: Date;
            
            // Parse date as LOCAL time (fix: use noon to avoid DST/timezone offset showing day before)
            if (installmentDates && installmentDates[i - 1]) {
              const [year, month, day] = installmentDates[i - 1].split('-').map(Number);
              dueDate = new Date(year, month - 1, day, 12, 0, 0, 0);
            } else {
              dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + (i * 30));
            }

            // Use custom amount per installment if provided
            const amount = (installmentAmounts && installmentAmounts[i - 1])
              ? installmentAmounts[i - 1]
              : defaultAmount;
            
            await db.createInstallment({
              saleId,
              customerId: input.customerId,
              amount,
              installmentNumber: i,
              totalInstallments: input.installments,
              dueDate: dueDate.toISOString(),
              status: "pending",
            });
          }
        }

        return sale;
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["completed", "pending", "cancelled"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateSale(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSale(input.id);
        return { success: true };
      }),
  }),

  // ============= ITENS DE VENDA =============
  saleItems: router({
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number().optional(),
        unitPrice: z.string().optional(),
        subtotal: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateSaleItem(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSaleItem(input.id);
        return { success: true };
      }),
  }),

  // ============= PARCELAS =============
  installments: router({
    list: protectedProcedure.query(async () => {
      return db.getInstallments();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getInstallmentById(input.id);
      }),
    getBySale: protectedProcedure
      .input(z.object({ saleId: z.number() }))
      .query(async ({ input }) => {
        return db.getInstallmentsBySale(input.saleId);
      }),
    getByCustomer: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return db.getInstallmentsByCustomer(input.customerId);
      }),
    getPending: protectedProcedure.query(async () => {
      return db.getPendingInstallments();
    }),
    getOverdue: protectedProcedure.query(async () => {
      return db.getOverdueInstallments();
    }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "paid", "overdue"]),
        paymentMethod: z.enum(["cash", "card", "transfer"]).optional(),
        paidDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateInstallment(id, data);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        dueDate: z.string().optional(),
        amount: z.string().optional(),
        status: z.enum(["pending", "paid", "overdue"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateInstallment(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteInstallment(input.id);
        return { success: true };
      }),
  }),

  // ============= NOTIFICAÇÕES =============
  notifications: router({
    list: protectedProcedure.query(async () => {
      return db.getPaymentNotifications();
    }),
    create: protectedProcedure
      .input(z.object({
        installmentId: z.number(),
        customerId: z.number(),
        type: z.enum(["overdue", "upcoming", "reminder"]),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        return db.createPaymentNotification(input);
      }),
    markAsSent: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.updatePaymentNotification(input.id, {
          sent: true,
          sentAt: new Date(),
        });
      }),
  }),

  // ============= COMPRAS DE REPOSIÇÃO =============
  stockReplenishment: router({
    list: protectedProcedure.query(async () => {
      return db.getStockReplenishments();
    }),
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number(),
        unitCost: z.string(),
        totalCost: z.string(),
        supplier: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Validate cash on hand before purchase
        const stats = await db.getDashboardStats();
        const cashOnHand = stats.cashOnHand;
        const purchaseCost = parseFloat(input.totalCost);

        if (cashOnHand < purchaseCost) {
          throw new Error(
            `Saldo insuficiente no caixa. Disponível: R$ ${cashOnHand.toFixed(2).replace('.', ',')}, necessário: R$ ${purchaseCost.toFixed(2).replace('.', ',')}. Adicione capital ao caixa antes de realizar compras.`
          );
        }

        // Create replenishment record
        await db.createStockReplenishment(input);
        
        // Update product quantity
        const product = await db.getProductById(input.productId);
        if (product) {
          await db.updateProduct(input.productId, {
            quantity: (product.quantity || 0) + input.quantity,
          });
        }

        return { success: true };
      }),
  }),

  // ============= TRANSAÇÕES =============
  transactions: router({
    list: protectedProcedure.query(async () => {
      return db.getTransactions();
    }),
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["capital", "aporte", "retirada"]),
        amount: z.string(),
        description: z.string().optional(),
        date: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createTransaction(input);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteTransaction(input.id);
      }),
  }),

  // ============= CONFIGURAÇÕES =============
  settings: router({
    getCompany: protectedProcedure.query(async () => {
      return db.getCompanySettings();
    }),
    updateCompany: protectedProcedure
      .input(z.object({
        companyName: z.string().optional(),
        cnpj: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        website: z.string().optional(),
        logo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.updateCompanySettings(input);
      }),
  }),

  // ============= DASHBOARD =============
  dashboard: router({
    getReceivedDetails: protectedProcedure.query(async () => {
      return db.getReceivedDetails();
    }),
    getStats: protectedProcedure.query(async () => {
      return db.getDashboardStats();
    }),
    getMonthlySalesData: protectedProcedure
      .input(z.object({
        year: z.number(),
        month: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getMonthlySalesData(input.year, input.month);
      }),
    getUpcomingAndOverdueInstallments: protectedProcedure.query(async () => {
      return db.getUpcomingAndOverdueInstallments();
    }),
    getSalesTodayWithDetails: protectedProcedure.query(async () => {
      return db.getSalesTodayWithDetails();
    }),
    getProfitDetailsToday: protectedProcedure.query(async () => {
      return db.getProfitDetailsToday();
    }),
    getSalesLast7Days: protectedProcedure.query(async () => {
      return db.getSalesLast7Days();
    }),
    getProfitLast7Days: protectedProcedure.query(async () => {
      return db.getProfitLast7Days();
    }),
    getInvestmentDetails: protectedProcedure.query(async () => {
      return db.getInvestmentDetails();
    }),
  }),
});

export type AppRouter = typeof appRouter;
