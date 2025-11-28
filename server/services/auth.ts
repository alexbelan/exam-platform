import { prisma } from "../utils/prisma";
import { verifyPasswordBun } from "../utils/password";
import {
  validateTelegramWebAppData,
  parseInitData,
  checkChannelSubscription,
} from "../utils/telegram";

/**
 * Авторизация через email/password
 */
export async function emailAuth(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email и пароль обязательны");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Неверный email или пароль");
  }

  if (!user.isActive) {
    throw new Error("Аккаунт заблокирован");
  }

  const isPasswordValid = await verifyPasswordBun(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Неверный email или пароль");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}

/**
 * Авторизация через Telegram
 */
export async function telegramAuth(initData: string) {
  if (!initData) {
    throw new Error("Данные авторизации не предоставлены");
  }

  const isValid = validateTelegramWebAppData(initData);
  if (!isValid) {
    throw new Error("Неверные данные авторизации");
  }

  const userData = parseInitData(initData);

  if (!userData.id) {
    throw new Error("Telegram ID пользователя не найден");
  }

  // Проверка подписки на канал
  const isSubscribed = await checkChannelSubscription(userData.id);
  if (!isSubscribed) {
    throw new Error("Для доступа необходимо подписаться на канал");
  }

  // Ищем пользователя
  let user = await prisma.user.findUnique({
    where: { telegramId: BigInt(userData.id) },
  });

  const isNewUser = !user;

  if (!user) {
    // Регистрация: создаем нового пользователя
    user = await prisma.user.create({
      data: {
        telegramId: BigInt(userData.id),
        telegramUsername: userData.username || null,
        firstName: userData.first_name || null,
        lastName: userData.last_name || null,
        role: "USER",
        isActive: true,
      },
    });

    // Создаем профиль пользователя и статистику обучения
    await Promise.all([
      prisma.userProfile.create({
        data: { userId: user.id },
      }),
      prisma.learningStatistics.create({
        data: { userId: user.id },
      }),
    ]);
  } else {
    // Вход: обновляем данные пользователя
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramUsername: userData.username || user.telegramUsername,
        firstName: userData.first_name || user.firstName,
        lastName: userData.last_name || user.lastName,
      },
    });
  }

  if (!user.isActive) {
    throw new Error("Аккаунт заблокирован");
  }

  return {
    isNewUser,
    user: {
      id: user.id,
      telegramId: user.telegramId?.toString(),
      telegramUsername: user.telegramUsername,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}

/**
 * Получить пользователя по ID из БД
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  return user;
}
