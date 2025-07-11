import { PrismaClient } from '@prisma/client';

// This workaround ensures Prisma Client initialization happens only once
declare global {
  namespace globalThis {
    var prismadb: PrismaClient | undefined;
  }
}

// Prevent multiple instances of Prisma Client in development
const prismaClientSingleton = () => {
  try {
    return new PrismaClient();
  } catch (e) {
    console.error("Failed to initialize Prisma Client:", e);
    process.exit(1);
  }
};

export const prisma = globalThis.prismadb ?? (globalThis.prismadb = prismaClientSingleton());

// If this is development, add the client to the global object to prevent multiple instances
if (process.env.NODE_ENV !== "production") globalThis.prismadb = prisma;

export default prisma;
