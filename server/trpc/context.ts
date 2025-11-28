import { prisma } from "../utils/prisma";
import type { User as AuthUser } from "#auth-utils";

// Тип сессии из nuxt-auth-utils
type Session = {
  user?: AuthUser | null;
  loggedInAt?: Date;
};

export async function createContext(event: any) {
  // Получаем сессию пользователя
  const session: Session = await getUserSession(event);

  // Если есть ID пользователя в сессии, загружаем его из БД
  let user = null;
  if (
    session.user &&
    "id" in session.user &&
    typeof session.user.id === "number"
  ) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
  }

  // Возвращаем только то, что нельзя импортировать напрямую
  return {
    event, // Нужен для setUserSession, clearUserSession
    user, // Текущий пользователь (загружен из БД)
    session, // Сессия (для получения loggedInAt и т.д.)
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
