import { prisma } from "../utils/prisma";
import { verifyPasswordBun } from "../utils/password";

export default defineEventHandler(async (event) => {
  console.log("Login API called with method:", event.method);

  // Проверяем, что это POST запрос
  if (event.method !== "POST") {
    console.log("Method not allowed:", event.method);
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    console.log("Attempting to read request body...");
    // Получаем данные из тела запроса
    const { email, password } = await readBody(event);
    console.log("Request body received:", {
      email,
      password: password ? "***" : undefined,
    });
    // Валидация входных данных
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email и пароль обязательны",
      });
    }

    // Ищем пользователя по email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Неверный email или пароль",
      });
    }

    // Проверяем активность пользователя
    if (!user.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: "Аккаунт заблокирован",
      });
    }

    // Проверяем пароль
    const isPasswordValid = await verifyPasswordBun(password, user.password);

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: "Неверный email или пароль",
      });
    }

    console.log("API user", user);

    // Создаем сессию пользователя
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      loggedInAt: new Date(),
    });

    console.log("API user in session", user);

    // Возвращаем успешный ответ
    return {
      success: true,
      message: "Успешная авторизация",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  } catch (error: any) {
    // Если это уже наша ошибка, просто пробрасываем её
    if (error.statusCode) {
      throw error;
    }

    // Логируем неожиданные ошибки
    console.error("Login error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Внутренняя ошибка сервера",
    });
  }
});
