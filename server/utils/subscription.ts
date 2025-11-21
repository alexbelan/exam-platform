import type { User, SubscriptionType } from "@prisma/client";

/**
 * Проверяет, есть ли у пользователя премиум доступ
 * @param user - объект пользователя из базы данных
 * @returns true если у пользователя есть активный премиум доступ
 */
export function hasPremiumAccess(user: User): boolean {
  // Если есть пожизненный доступ
  if (user.isLifetimeAccess) {
    return true;
  }

  // Если есть активная подписка
  if (
    user.subscriptionType === "PREMIUM_MONTHLY" ||
    user.subscriptionType === "PREMIUM_YEARLY"
  ) {
    return user.subscriptionEndsAt && user.subscriptionEndsAt > new Date();
  }

  return false;
}

/**
 * Проверяет, является ли пользователь бесплатным
 * @param user - объект пользователя из базы данных
 * @returns true если пользователь имеет бесплатный аккаунт
 */
export function isFreeUser(user: User): boolean {
  return user.subscriptionType === "FREE" && !user.isLifetimeAccess;
}

/**
 * Проверяет, является ли пользователь премиум подписчиком
 * @param user - объект пользователя из базы данных
 * @returns true если пользователь имеет активную премиум подписку
 */
export function isPremiumSubscriber(user: User): boolean {
  return (
    (user.subscriptionType === "PREMIUM_MONTHLY" ||
      user.subscriptionType === "PREMIUM_YEARLY") &&
    user.subscriptionEndsAt &&
    user.subscriptionEndsAt > new Date()
  );
}

/**
 * Проверяет, имеет ли пользователь пожизненный доступ
 * @param user - объект пользователя из базы данных
 * @returns true если пользователь имеет пожизненный доступ
 */
export function hasLifetimeAccess(user: User): boolean {
  return user.isLifetimeAccess || user.subscriptionType === "LIFETIME";
}

/**
 * Получает тип подписки пользователя в читаемом формате
 * @param user - объект пользователя из базы данных
 * @returns строка с описанием типа подписки
 */
export function getSubscriptionTypeLabel(user: User): string {
  if (user.isLifetimeAccess || user.subscriptionType === "LIFETIME") {
    return "Пожизненный доступ";
  }

  switch (user.subscriptionType) {
    case "PREMIUM_MONTHLY":
      return "Премиум (месячная)";
    case "PREMIUM_YEARLY":
      return "Премиум (годовая)";
    case "FREE":
    default:
      return "Бесплатный";
  }
}

/**
 * Проверяет, истекает ли подписка в ближайшие дни
 * @param user - объект пользователя из базы данных
 * @param days - количество дней для проверки (по умолчанию 7)
 * @returns true если подписка истекает в указанный период
 */
export function isSubscriptionExpiringSoon(
  user: User,
  days: number = 7
): boolean {
  if (!user.subscriptionEndsAt || user.isLifetimeAccess) {
    return false;
  }

  const expirationDate = new Date(user.subscriptionEndsAt);
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + days);

  return expirationDate <= warningDate && expirationDate > new Date();
}

/**
 * Получает количество дней до истечения подписки
 * @param user - объект пользователя из базы данных
 * @returns количество дней до истечения или null если подписка не истекает
 */
export function getDaysUntilExpiration(user: User): number | null {
  if (!user.subscriptionEndsAt || user.isLifetimeAccess) {
    return null;
  }

  const expirationDate = new Date(user.subscriptionEndsAt);
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}
