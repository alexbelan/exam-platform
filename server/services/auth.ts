import { prisma } from "../utils/prisma";
import { verifyPasswordBun, hashPasswordBun } from "../utils/password";
import {
  validateTelegramWebAppData,
  parseInitData,
  checkChannelSubscription,
} from "../utils/telegram";
import { TokenType } from "@prisma/client";
import { createToken, verifyToken, markTokenAsUsed } from "./tokens";
import {
  sendVerificationCode,
  sendPasswordResetCode as sendPasswordResetEmail,
  sendEmailChangeCode,
} from "./email";
import { generateVerificationCode } from "../utils/verification";

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

// ============================================
// ФУНКЦИИ РЕГИСТРАЦИИ И ВХОДА С КОДАМИ
// ============================================

/**
 * Отправить код регистрации на email
 */
export async function sendRegistrationCode(
  email: string,
  firstName?: string,
  lastName?: string,
): Promise<void> {
  if (!email) {
    throw new Error("Email обязателен");
  }

  // Проверяем, что пользователь с таким email не существует
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Пользователь с таким email уже существует");
  }

  // Генерируем код
  const code = generateVerificationCode();

  // Создаем токен
  await createToken(
    code,
    TokenType.EMAIL_VERIFICATION_REGISTRATION,
    { email, firstName, lastName },
    10, // 10 минут
  );

  // Отправляем код на email
  await sendVerificationCode(email, code, "registration", firstName);
}

/**
 * Завершить регистрацию с кодом верификации
 */
export async function completeRegistration(
  email: string,
  code: string,
  password: string,
) {
  if (!email || !code || !password) {
    throw new Error("Email, код и пароль обязательны");
  }

  // Проверяем токен
  const verification = await verifyToken(
    code,
    TokenType.EMAIL_VERIFICATION_REGISTRATION,
  );

  if (!verification.valid) {
    throw new Error(verification.error || "Неверный или истекший код");
  }

  // Проверяем, что email совпадает
  if (verification.data?.email !== email) {
    throw new Error("Email не совпадает с кодом верификации");
  }

  // Проверяем, что пользователь еще не создан
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Пользователь с таким email уже существует");
  }

  // Хешируем пароль
  const hashedPassword = await hashPasswordBun(password);

  // Создаем пользователя напрямую через Prisma с emailVerified
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: verification.data.firstName as string | undefined,
      lastName: verification.data.lastName as string | undefined,
      emailVerified: true, // Email уже верифицирован через код
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

  // Помечаем токен как использованный
  await markTokenAsUsed(code, TokenType.EMAIL_VERIFICATION_REGISTRATION);

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
 * Отправить код для входа на email
 */
export async function sendLoginCode(email: string): Promise<void> {
  if (!email) {
    throw new Error("Email обязателен");
  }

  // Проверяем, что пользователь существует
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Не сообщаем, что пользователь не найден, для безопасности
    // Просто не отправляем код
    return;
  }

  if (!user.isActive) {
    throw new Error("Аккаунт заблокирован");
  }

  // Генерируем код
  const code = generateVerificationCode();

  // Создаем токен
  await createToken(
    code,
    TokenType.EMAIL_VERIFICATION_LOGIN,
    { email, userId: user.id },
    10, // 10 минут
  );

  // Отправляем код на email
  await sendVerificationCode(email, code, "login");
}

/**
 * Войти с кодом верификации
 */
export async function loginWithCode(email: string, code: string) {
  if (!email || !code) {
    throw new Error("Email и код обязательны");
  }

  // Проверяем токен
  const verification = await verifyToken(
    code,
    TokenType.EMAIL_VERIFICATION_LOGIN,
  );

  if (!verification.valid) {
    throw new Error(verification.error || "Неверный или истекший код");
  }

  // Проверяем, что email совпадает
  if (verification.data?.email !== email) {
    throw new Error("Email не совпадает с кодом верификации");
  }

  // Получаем пользователя
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  if (!user.isActive) {
    throw new Error("Аккаунт заблокирован");
  }

  // Помечаем токен как использованный
  await markTokenAsUsed(code, TokenType.EMAIL_VERIFICATION_LOGIN);

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

// ============================================
// ФУНКЦИИ СБРОСА ПАРОЛЯ
// ============================================

/**
 * Отправить код для сброса пароля
 */
export async function sendPasswordResetCode(email: string): Promise<void> {
  if (!email) {
    throw new Error("Email обязателен");
  }

  // Проверяем, что пользователь существует
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Не сообщаем, что пользователь не найден, для безопасности
    return;
  }

  if (!user.isActive) {
    throw new Error("Аккаунт заблокирован");
  }

  // Генерируем код
  const code = generateVerificationCode();

  // Создаем токен
  await createToken(
    code,
    TokenType.PASSWORD_RESET,
    { email, userId: user.id },
    10, // 10 минут
  );

  // Отправляем код на email
  await sendPasswordResetEmail(email, code);
}

/**
 * Сбросить пароль с кодом
 */
export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  if (!email || !code || !newPassword) {
    throw new Error("Email, код и новый пароль обязательны");
  }

  // Проверяем токен
  const verification = await verifyToken(code, TokenType.PASSWORD_RESET);

  if (!verification.valid) {
    throw new Error(verification.error || "Неверный или истекший код");
  }

  // Проверяем, что email совпадает
  if (verification.data?.email !== email) {
    throw new Error("Email не совпадает с кодом верификации");
  }

  // Получаем пользователя
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  if (!user.isActive) {
    throw new Error("Аккаунт заблокирован");
  }

  // Хешируем новый пароль
  const hashedPassword = await hashPasswordBun(newPassword);

  // Обновляем пароль
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Помечаем токен как использованный
  await markTokenAsUsed(code, TokenType.PASSWORD_RESET);
}

// ============================================
// ФУНКЦИИ ПРИВЯЗКИ EMAIL К TELEGRAM АККАУНТУ
// ============================================

/**
 * Отправить код для привязки email к Telegram аккаунту
 */
export async function sendEmailLinkCode(
  userId: number,
  email: string,
): Promise<void> {
  if (!userId || !email) {
    throw new Error("ID пользователя и email обязательны");
  }

  // Получаем пользователя
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  // Проверяем, что у пользователя есть telegramId и нет email
  if (!user.telegramId) {
    throw new Error("У пользователя нет Telegram аккаунта");
  }

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

  // Генерируем код
  const code = generateVerificationCode();

  // Создаем токен типа EMAIL_CHANGE с данными {userId, newEmail}
  await createToken(
    code,
    TokenType.EMAIL_CHANGE,
    { userId, newEmail: email },
    10, // 10 минут
  );

  // Отправляем код на email
  await sendEmailChangeCode(email, code, email);
}

/**
 * Привязать email к Telegram аккаунту с кодом
 */
export async function linkEmailWithCode(
  userId: number,
  email: string,
  code: string,
  password: string,
): Promise<void> {
  if (!userId || !email || !code || !password) {
    throw new Error("ID пользователя, email, код и пароль обязательны");
  }

  // Проверяем токен
  const verification = await verifyToken(code, TokenType.EMAIL_CHANGE);

  if (!verification.valid) {
    throw new Error(verification.error || "Неверный или истекший код");
  }

  // Проверяем, что userId и email совпадают
  if (verification.data?.userId !== userId) {
    throw new Error("ID пользователя не совпадает с кодом верификации");
  }

  if (verification.data?.newEmail !== email) {
    throw new Error("Email не совпадает с кодом верификации");
  }

  // Получаем пользователя
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  // Проверяем условия привязки
  if (!user.telegramId) {
    throw new Error("У пользователя нет Telegram аккаунта");
  }

  if (user.email) {
    throw new Error("У пользователя уже есть email");
  }

  // Проверяем, что email не занят другим пользователем
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.id !== userId) {
    throw new Error("Email уже занят другим пользователем");
  }

  // Хешируем пароль
  const hashedPassword = await hashPasswordBun(password);

  // Обновляем пользователя (добавляем email и пароль, устанавливаем emailVerified: true)
  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      password: hashedPassword,
      emailVerified: true,
    },
  });

  // Помечаем токен как использованный
  await markTokenAsUsed(code, TokenType.EMAIL_CHANGE);
}
