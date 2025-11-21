// Утилита для работы с Prisma Client
// Исправляет проблему с импортом CommonJS модуля в ESM контексте
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

// Singleton экземпляр Prisma Client
// Переиспользуем одно подключение для всех запросов
export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
}) as PrismaClient & Record<string, any>;

if (!prisma.tag && prisma.questionTag) {
  prisma.tag = prisma.questionTag;
}
if (!prisma.category && prisma.tagCategory) {
  prisma.category = prisma.tagCategory;
}

// Graceful shutdown
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
