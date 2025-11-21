import { prisma } from "../../utils/prisma";
import { hashPasswordBun } from "../../utils/password";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      firstName,
      lastName,
      email,
      password,
      role = "USER",
      isActive = true,
    } = body;

    // Валидация обязательных полей
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email и пароль обязательны",
      });
    }

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: "Пользователь с таким email уже существует",
      });
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

    return {
      success: true,
      user,
      message: "Пользователь успешно создан",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при создании пользователя",
    });
  }
});
