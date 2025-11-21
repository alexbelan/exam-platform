import { createError } from "h3";
import { prisma } from "../../../utils/prisma";

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

    // Получаем избранные вопросы с пагинацией (профиль создаётся при регистрации)
    const where = {
      userId,
    };

    const [favorites, total] = await Promise.all([
      prisma.userFavoriteQuestion.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          questionId: true,
          question: {
            select: {
              id: true,
              title: true,
              isPublished: true,
              createdAt: true,
              updatedAt: true,
              tags: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      color: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.userFavoriteQuestion.count({ where }),
    ]);

    // Преобразуем данные в нужный формат
    const questions = favorites
      .map((fav) => fav.question)
      .filter((q) => q !== null);

    return {
      questions,
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

    console.error("Error fetching favorite questions:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении избранных вопросов",
    });
  }
});

