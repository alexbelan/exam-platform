import { createError } from "h3";
import { prisma } from "../../../utils/prisma";
import { updateUncorrectedQuestionsCount } from "../../../utils/updateUncorrectedQuestionsCount";

interface UpdateUncorrectedQuestionsRequest {
  questionIds: number[];
}

export default defineEventHandler(async (event) => {
  try {
    // Проверка метода
    if (event.method !== "PUT") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed",
      });
    }

    // Получаем текущую сессию пользователя
    const session = await getUserSession(event);

    if (!session.user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Пользователь не авторизован",
      });
    }

    const userId = session.user.id;

    // Проверяем существование статистики
    const statistics = await prisma.learningStatistics.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!statistics) {
      throw createError({
        statusCode: 404,
        statusMessage: "Статистика пользователя не найдена",
      });
    }

    // Получаем тело запроса
    const body = (await readBody(event)) as UpdateUncorrectedQuestionsRequest;

    // Валидация
    if (!Array.isArray(body.questionIds)) {
      throw createError({
        statusCode: 400,
        statusMessage: "questionIds должен быть массивом",
      });
    }

    // Нормализуем и валидируем ID вопросов
    const questionIds = body.questionIds
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);

    // Обновляем счетчик
    const result = await updateUncorrectedQuestionsCount({
      userId,
      incorrectQuestionIds: questionIds,
    });

    return {
      success: true,
      data: {
        uncorrectedQuestionsCount: result.count,
      },
      message: "Счетчик непройденных вопросов обновлен",
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error("Error updating uncorrected questions count:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при обновлении счетчика непройденных вопросов",
    });
  }
});

