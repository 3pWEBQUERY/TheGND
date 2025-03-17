import { PrismaClient } from '@prisma/client';

// PrismaClient ist an Singleton-Instanz gebunden, um zu verhindern, dass mehrere Instanzen erstellt werden
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
