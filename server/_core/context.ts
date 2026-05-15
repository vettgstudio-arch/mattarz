import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: any | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Fixed user: Vitor Mattar (login removed)
  const user = {
    id: 1,
    openId: "vitor-mattar-fixed",
    name: "Vitor Mattar",
    email: "vitor@mattarzinvestimentos.com",
    loginMethod: "fixed",
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString(),
  };

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
