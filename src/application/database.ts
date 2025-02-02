import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: Bun.env.DEV_ENV === "development" ? ["query"] : [],
});
