declare module "#auth-utils" {
  interface User {
    id: number;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: "USER" | "ADMIN";
  }

  interface UserSession {
    loggedInAt?: Date;
  }

  interface SecureSessionData {
    // Добавьте здесь приватные данные сессии, если нужно
  }
}

export {};
