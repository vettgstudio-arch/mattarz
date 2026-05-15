import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("products", () => {
  it("should list products", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    expect(Array.isArray(products)).toBe(true);
  });

  it("should get low stock products", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const lowStock = await caller.products.getLowStock();
    expect(Array.isArray(lowStock)).toBe(true);
  });


});

describe("categories", () => {
  it("should list categories", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.categories.list();
    expect(Array.isArray(categories)).toBe(true);
  });
});

describe("customers", () => {
  it("should list customers", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const customers = await caller.customers.list();
    expect(Array.isArray(customers)).toBe(true);
  });
});

describe("sales", () => {
  it("should list sales", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const sales = await caller.sales.list();
    expect(Array.isArray(sales)).toBe(true);
  });
});

describe("installments", () => {
  it("should list installments", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const installments = await caller.installments.list();
    expect(Array.isArray(installments)).toBe(true);
  });

  it("should get overdue installments", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const overdue = await caller.installments.getOverdue();
    expect(Array.isArray(overdue)).toBe(true);
  });
});

describe("dashboard", () => {
  it("should get dashboard stats", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.dashboard.getStats();
    expect(stats).toBeDefined();
    expect(typeof stats).toBe("object");
  });

  it("should get monthly sales data", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const data = await caller.dashboard.getMonthlySalesData({
      year: 2026,
      month: 5,
    });
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("settings", () => {
  it("should get company settings", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const settings = await caller.settings.getCompany();
    expect(settings).toBeDefined();
  });
});
