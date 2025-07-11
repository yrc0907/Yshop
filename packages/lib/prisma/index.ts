import { PrismaClient } from './../../../generated/prisma/index.d';

declare global {
  namespace globalThis {
    var prismadb: PrismaClient;
  }
}

export const prisma = globalThis.prismadb || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prismadb = prisma;

export default prisma;