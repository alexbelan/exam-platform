/// <reference types="bun-types" />

import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Получаем данные администратора из переменных окружения
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPasswordPlain = process.env.ADMIN_PASSWORD || "admin123";
  const adminFirstName = process.env.ADMIN_FIRST_NAME || "Admin";
  const adminLastName = process.env.ADMIN_LAST_NAME || "User";

  // Хешируем пароль администратора используя Bun.password API (bcrypt для совместимости)
  const adminPassword = await Bun.password.hash(adminPasswordPlain, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // Создаем администратора
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      firstName: adminFirstName,
      lastName: adminLastName,
      role: UserRole.ADMIN,
      isActive: true,
      // Обновляем пароль только если он указан в env
      ...(process.env.ADMIN_PASSWORD && { password: adminPassword }),
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // Создаем профиль для администратора
  await prisma.userProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
    },
  });

  // Создаем статистику для администратора (после создания профиля)
  await prisma.learningStatistics.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`👤 Admin: ${admin.email} (password: ${adminPasswordPlain})`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
