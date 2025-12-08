import { prisma } from "../utils/prisma";
import { hashPasswordBun } from "../utils/password";
import type { Prisma, UserRole } from "@prisma/client";

/**
 * Получить список пользователей
 */
export async function getUserList(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: boolean;
}) {
  const { page = 1, limit = 10, search, role, status } = params;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status !== undefined) {
    where.isActive = status === true;
  }

  // Получение пользователей с пагинацией
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            submittedQuestions: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
}

/**
 * Получить пользователя по ID
 */
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      submittedQuestions: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          submittedQuestions: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  return user;
}

/**
 * Создать пользователя
 */
export async function createUser(data: {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  role?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}) {
  const {
    firstName,
    lastName,
    email,
    password,
    role = "USER",
    isActive = true,
    emailVerified = false,
  } = data;

  // Валидация обязательных полей
  if (!email || !password) {
    throw new Error("Email и пароль обязательны");
  }

  // Проверка существования пользователя
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Пользователь с таким email уже существует");
  }

  // Хеширование пароля
  const hashedPassword = await hashPasswordBun(password);

  // Создание пользователя
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      isActive,
      emailVerified,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Создаём профиль пользователя и статистику обучения
  await Promise.all([
    prisma.userProfile.create({
      data: { userId: user.id },
    }),
    prisma.learningStatistics.create({
      data: { userId: user.id },
    }),
  ]);

  return user;
}

/**
 * Обновить пользователя
 */
export async function updateUser(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
  },
) {
  // Проверка существования пользователя
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("Пользователь не найден");
  }

  // Проверка уникальности email (если изменился)
  if (data.email && data.email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailExists) {
      throw new Error("Пользователь с таким email уже существует");
    }
  }

  // Подготовка данных для обновления
  const updateData: Prisma.UserUpdateInput = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    role: data.role as UserRole,
    isActive: data.isActive,
  };

  // Хеширование пароля только если он предоставлен
  if (data.password) {
    updateData.password = await hashPasswordBun(data.password);
  }

  // Обновление пользователя
  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Удалить пользователя
 */
export async function deleteUser(id: string) {
  // Проверка существования пользователя
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("Пользователь не найден");
  }

  // Удаление пользователя (каскадное удаление submissions)
  await prisma.user.delete({
    where: { id },
  });
}

/**
 * Пометить email пользователя как верифицированный
 */
export async function verifyUserEmail(userId: string): Promise<void> {
  // Проверка существования пользователя
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  if (!user.email) {
    throw new Error("У пользователя нет email для верификации");
  }

  // Обновляем статус верификации email
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
    },
  });
}

/**
 * Привязать email и пароль к существующему пользователю
 */
export async function linkEmailToUser(
  userId: string,
  email: string,
  password: string,
): Promise<void> {
  if (!email || !password) {
    throw new Error("Email и пароль обязательны");
  }

  // Проверка существования пользователя
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  // Проверяем, что у пользователя еще нет email
  if (user.email) {
    throw new Error("У пользователя уже есть email");
  }

  // Проверяем, что email не занят другим пользователем
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email уже занят другим пользователем");
  }

  // Хешируем пароль
  const hashedPassword = await hashPasswordBun(password);

  // Обновляем пользователя: добавляем email и пароль, устанавливаем emailVerified: true
  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      password: hashedPassword,
      emailVerified: true,
    },
  });
}
