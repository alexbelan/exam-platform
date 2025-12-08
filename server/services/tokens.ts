import { prisma } from "../utils/prisma";
import type { TokenType, Prisma } from "@prisma/client";

/**
 * Тип для данных токена
 * Может содержать email, userId и другие метаданные
 */
export type TokenData = {
  email?: string;
  userId?: number;
  newEmail?: string;
  [key: string]: unknown;
};

/**
 * Результат проверки токена
 */
export type TokenVerificationResult = {
  valid: boolean;
  data?: TokenData;
  error?: string;
};

/**
 * Создать токен в базе данных
 * @param token - строковое значение токена (код)
 * @param type - тип токена из enum TokenType
 * @param data - дополнительные данные токена (JSON)
 * @param expiresInMinutes - время жизни токена в минутах (по умолчанию 10)
 * @returns созданный токен
 */
export async function createToken(
  token: string,
  type: TokenType,
  data: TokenData,
  expiresInMinutes: number = 10,
) {
  if (!token || !type) {
    throw new Error("Токен и тип обязательны");
  }

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

  try {
    const createdToken = await prisma.token.create({
      data: {
        token,
        type,
        data: data as Prisma.InputJsonValue,
        expiresAt,
        used: false,
      },
    });

    return createdToken;
  } catch (error: unknown) {
    // Проверяем, не является ли ошибка нарушением уникального ограничения
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new Error(
        "Токен с таким значением и типом уже существует. Попробуйте еще раз.",
      );
    }

    console.error("Ошибка при создании токена:", error);
    throw new Error("Не удалось создать токен");
  }
}

/**
 * Проверить токен (валидность, срок действия, использование)
 * @param token - строковое значение токена
 * @param type - тип токена из enum TokenType
 * @returns результат проверки с данными или ошибкой
 */
export async function verifyToken(
  token: string,
  type: TokenType,
): Promise<TokenVerificationResult> {
  if (!token || !type) {
    return {
      valid: false,
      error: "Токен и тип обязательны",
    };
  }

  try {
    const tokenRecord = await prisma.token.findUnique({
      where: {
        token_type: {
          token,
          type,
        },
      },
    });

    if (!tokenRecord) {
      return {
        valid: false,
        error: "Токен не найден",
      };
    }

    if (tokenRecord.used) {
      return {
        valid: false,
        error: "Токен уже был использован",
      };
    }

    const now = new Date();
    if (tokenRecord.expiresAt < now) {
      return {
        valid: false,
        error: "Токен истек",
      };
    }

    return {
      valid: true,
      data: tokenRecord.data as TokenData,
    };
  } catch (error) {
    console.error("Ошибка при проверке токена:", error);
    return {
      valid: false,
      error: "Ошибка при проверке токена",
    };
  }
}

/**
 * Получить данные токена без проверки валидности
 * @param token - строковое значение токена
 * @param type - тип токена из enum TokenType
 * @returns данные токена или null
 */
export async function getTokenData(
  token: string,
  type: TokenType,
): Promise<TokenData | null> {
  try {
    const tokenRecord = await prisma.token.findUnique({
      where: {
        token_type: {
          token,
          type,
        },
      },
    });

    if (!tokenRecord) {
      return null;
    }

    return tokenRecord.data as TokenData;
  } catch (error) {
    console.error("Ошибка при получении данных токена:", error);
    return null;
  }
}

/**
 * Пометить токен как использованный
 * @param token - строковое значение токена
 * @param type - тип токена из enum TokenType
 * @returns true если токен успешно помечен как использованный, false в противном случае
 */
export async function markTokenAsUsed(
  token: string,
  type: TokenType,
): Promise<boolean> {
  try {
    // Сначала находим токен
    const tokenRecord = await prisma.token.findUnique({
      where: {
        token_type: {
          token,
          type,
        },
      },
    });

    if (!tokenRecord) {
      return false;
    }

    // Проверяем, что токен еще не использован
    if (tokenRecord.used) {
      return false;
    }

    // Обновляем токен
    await prisma.token.update({
      where: {
        token_type: {
          token,
          type,
        },
      },
      data: {
        used: true,
      },
    });

    return true;
  } catch (error) {
    console.error("Ошибка при пометке токена как использованного:", error);
    return false;
  }
}

/**
 * Удалить истекшие токены из базы данных
 * @returns количество удаленных токенов
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const now = new Date();
    const result = await prisma.token.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error("Ошибка при очистке истекших токенов:", error);
    return 0;
  }
}

/**
 * Удалить использованные токены старше определенного количества дней
 * @param olderThanDays - удалить токены старше указанного количества дней (по умолчанию 7)
 * @returns количество удаленных токенов
 */
export async function cleanupUsedTokens(
  olderThanDays: number = 7,
): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.token.deleteMany({
      where: {
        used: true,
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error("Ошибка при очистке использованных токенов:", error);
    return 0;
  }
}
