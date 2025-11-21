/// <reference types="bun-types" />

import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Хешируем пароли используя Bun.password API (bcrypt для совместимости)
  const adminPassword = await Bun.password.hash("admin123", {
    algorithm: "bcrypt",
    cost: 10,
  });
  const userPassword = await Bun.password.hash("user123", {
    algorithm: "bcrypt",
    cost: 10,
  });

  // Создаем администратора
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // Создаем обычного пользователя
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: userPassword,
      firstName: "John",
      lastName: "Doe",
      role: UserRole.USER,
      isActive: true,
    },
  });

  // Создаем категории тегов
  const tagCategories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "frontend" },
      update: {
        name: "Frontend",
        color: "#3b82f6",
      },
      create: {
        name: "Frontend",
        slug: "frontend",
        color: "#3b82f6",
      },
    }),
    prisma.category.upsert({
      where: { slug: "backend" },
      update: {
        name: "Backend",
        color: "#6366f1",
      },
      create: {
        name: "Backend",
        slug: "backend",
        color: "#6366f1",
      },
    }),
    prisma.category.upsert({
      where: { slug: "theory" },
      update: {
        name: "Theory",
        color: "#10b981",
      },
      create: {
        name: "Theory",
        slug: "theory",
        color: "#10b981",
      },
    }),
  ]);

  const categoryBySlug = Object.fromEntries(
    tagCategories.map((category) => [category.slug, category])
  );

  // Создаем базовые теги
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "javascript" },
      update: {
        name: "JavaScript",
        category: {
          connect: { id: categoryBySlug["frontend"].id },
        },
      },
      create: {
        name: "JavaScript",
        slug: "javascript",
        category: {
          connect: { id: categoryBySlug["frontend"].id },
        },
      },
    }),
    prisma.tag.upsert({
      where: { slug: "react" },
      update: {
        name: "React",
        category: {
          connect: { id: categoryBySlug["frontend"].id },
        },
      },
      create: {
        name: "React",
        slug: "react",
        category: {
          connect: { id: categoryBySlug["frontend"].id },
        },
      },
    }),
    prisma.tag.upsert({
      where: { slug: "algorithms" },
      update: {
        name: "Algorithms",
        category: {
          connect: { id: categoryBySlug["theory"].id },
        },
      },
      create: {
        name: "Algorithms",
        slug: "algorithms",
        category: {
          connect: { id: categoryBySlug["theory"].id },
        },
      },
    }),
    prisma.tag.upsert({
      where: { slug: "system-design" },
      update: {
        name: "System Design",
        category: {
          connect: { id: categoryBySlug["backend"].id },
        },
      },
      create: {
        name: "System Design",
        slug: "system-design",
        category: {
          connect: { id: categoryBySlug["backend"].id },
        },
      },
    }),
  ]);

  // Создаем тестовый вопрос
  const question = await prisma.interviewQuestion.create({
    data: {
      title: "Что такое замыкания в JavaScript?",
      content:
        "Объясните концепцию замыканий в JavaScript. Приведите пример использования.",
      isPublished: true,
      categoryId: categoryBySlug["frontend"].id,
      tags: {
        connect: [{ slug: "javascript" }],
      },
    },
  });

  // Создаем тестовое предложение пользователя
  await prisma.userSubmission.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: "Вопрос о TypeScript",
      content: "Как работают дженерики в TypeScript?",
      status: "PENDING",
      userId: user.id,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`👤 Admin: ${admin.email} (password: admin123)`);
  console.log(`👤 User: ${user.email} (password: user123)`);
  console.log(
    `🏷️  Created ${tags.length} tags in ${tagCategories.length} categories`
  );
  console.log(`❓ Created 1 test question`);
  console.log(`📝 Created 1 test submission`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
