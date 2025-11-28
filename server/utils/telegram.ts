import crypto from "crypto";

/**
 * Валидирует данные от Telegram Web App
 * Проверяет подпись initData для защиты от подделки
 *
 * @param initData - строка initData от Telegram.WebApp.initData
 * @returns true если данные валидны и подпись корректна
 */
export function validateTelegramWebAppData(initData: string): boolean {
  try {
    const runtimeConfig = useRuntimeConfig();
    const botToken = runtimeConfig.telegramBotToken;

    if (!botToken) {
      console.warn("Telegram bot token not configured");
      return false;
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");

    if (!hash) {
      return false;
    }

    // Удаляем hash из параметров для проверки
    urlParams.delete("hash");

    // Сортируем параметры по ключу и формируем строку для проверки
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Создаем секретный ключ из bot token
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // Вычисляем hash
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    return calculatedHash === hash;
  } catch (error) {
    console.error("Error validating Telegram data:", error);
    return false;
  }
}

/**
 * Парсит initData и извлекает данные пользователя
 *
 * @param initData - строка initData от Telegram.WebApp.initData
 * @returns объект с данными пользователя
 * @throws Error если данные пользователя не найдены
 */
export function parseInitData(initData: string): {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
} {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get("user");

    if (!userParam) {
      throw new Error("User data not found in initData");
    }

    const userData = JSON.parse(userParam);

    if (!userData.id) {
      throw new Error("User ID not found in user data");
    }

    return {
      id: userData.id,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
    };
  } catch (error) {
    console.error("Error parsing Telegram initData:", error);
    throw new Error("Failed to parse Telegram user data");
  }
}

/**
 * Проверяет, подписан ли пользователь на канал через Telegram Bot API
 *
 * @param userId - Telegram ID пользователя
 * @returns true если пользователь подписан на канал
 */
export async function checkChannelSubscription(
  userId: number
): Promise<boolean> {
  try {
    const runtimeConfig = useRuntimeConfig();
    const botToken = runtimeConfig.telegramBotToken;
    const channelId = runtimeConfig.telegramChannelId;

    if (!botToken || !channelId) {
      console.warn(
        "Telegram bot token or channel ID not configured, allowing access"
      );
      // В разработке разрешаем доступ, если конфигурация не настроена
      return true;
    }

    // Используем Telegram Bot API для проверки подписки
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: channelId,
          user_id: userId,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to check subscription:", errorText);
      return false;
    }

    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram API error:", data.description);
      return false;
    }

    const status = data.result?.status;

    // Статусы: member, administrator, creator - пользователь подписан
    // Статусы: left, kicked, restricted - пользователь не подписан
    const subscribedStatuses = ["member", "administrator", "creator"];

    return subscribedStatuses.includes(status);
  } catch (error) {
    console.error("Error checking channel subscription:", error);
    return false;
  }
}
