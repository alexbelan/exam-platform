export interface TelegramAuthResponse {
  success: boolean;
  message: string;
  isNewUser: boolean;
  user: {
    id: number;
    telegramId?: string;
    telegramUsername?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role: "USER" | "ADMIN";
  };
}

/**
 * Авторизация через Telegram
 * Регистрирует пользователя, если его нет, или входит, если он существует
 */
export async function loginWithTelegram(
  initData: string
): Promise<TelegramAuthResponse> {
  return $fetch<TelegramAuthResponse>("/api/auth/telegram", {
    method: "POST",
    body: { initData },
  });
}

