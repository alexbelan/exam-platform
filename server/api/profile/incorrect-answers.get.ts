import { createError } from "h3";
import { getUncorrectedIncorrectAnswers } from "../../utils/getUncorrectedIncorrectAnswers";

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

    // Получаем неправильные ответы через утилиту (с пагинацией)
    const { questions, total } = await getUncorrectedIncorrectAnswers(userId, {
      page,
      limit,
    });

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

    console.error("Error fetching incorrect answers:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении неправильных ответов",
    });
  }
});
