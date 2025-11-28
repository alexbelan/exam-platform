declare module "#auth-utils" {
  interface User {
    id: number;
    // Telegram авторизация
    telegramId?: string;
    telegramUsername?: string | null;
    // Email авторизация (для админов)
    email?: string;
    // Общие поля
    firstName?: string | null;
    lastName?: string | null;
    role: "USER" | "ADMIN";
  }

  interface UserSession {
    loggedInAt?: Date;
  }

  interface SecureSessionData {
    // Приватные данные сессии
  }
}

export {};
