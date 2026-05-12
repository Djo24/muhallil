import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query"] : undefined,
    });
  }
  return globalForPrisma.prisma;
}

const _prisma = getClient();

export { getClient };
export const prisma = _prisma;
