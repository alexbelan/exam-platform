import { prisma } from "./prisma";
import type { User } from "@prisma/client";

/**
 * Получает текущего пользователя из сессии
 * @param event - событие Nuxt
 * @returns пользователь из БД или null
 */
export async function getCurrentUser(event: any): Promise<User | null> {
  try {
    const session = await getUserSession(event);
    if (!session.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
