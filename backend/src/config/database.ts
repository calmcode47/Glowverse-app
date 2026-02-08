import { PrismaClient } from "@prisma/client";
import env from "@config/env";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.nodeEnv === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "pretty"
  });

if (env.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
