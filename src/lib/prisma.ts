import { PrismaClient } from "@prisma/client";

const g = globalThis as any

export function getPrisma(): PrismaClient {
  if (!g.__prisma) {
    g.__prisma = new PrismaClient()
  }
  return g.__prisma
}

export const prisma = getPrisma()
