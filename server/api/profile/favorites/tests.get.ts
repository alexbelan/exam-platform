import { createError } from "h3";
import { prisma } from "../../../utils/prisma";

const TAG_INCLUDE = {
  tags: {
    include: {
      category: true,
    },
  },
  primaryTag: {
    include: {
      category: true,
    },
  },
} as const;

export default defineEventHandler(async (event) => {
  try {
    // Получаем текущую сессию пользователя
    const session = await getUserSession(event);

    if (!session.user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Пользователь не авторизован",
      });
    }

    const userId = session.user.id;
    const query = getQuery(event);
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 12;

    // Получаем избранные тесты с пагинацией (профиль создаётся при регистрации)
    const where = {
      userId,
    };

    const [favorites, total] = await Promise.all([
      prisma.userFavoriteTest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          testId: true,
          test: {
            include: TAG_INCLUDE,
          },
        },
      }),
      prisma.userFavoriteTest.count({ where }),
    ]);

    // Преобразуем данные в нужный формат
    const tests = favorites.map((fav) => fav.test).filter((t) => t !== null);

    return {
      tests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error("Error fetching favorite tests:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении избранных тестов",
    });
  }
});
