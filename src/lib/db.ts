import { PrismaClient } from "@prisma/client";

// Next.js dev mode hot-reloads modules on every file save. Without this
// global-caching trick, every reload would create a brand-new PrismaClient
// (and a brand-new DB connection pool), quickly exhausting Postgres'
// connection limit. We stash the client on `globalThis` so it survives
// hot reloads and is reused instead of recreated.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
