import { createError } from "h3";
import { prisma } from "../../utils/prisma";

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

    // Получаем статистику обучения (профиль создаётся при регистрации)
    const statistics = await prisma.learningStatistics.findUnique({
      where: { userId },
    });

    if (!statistics) {
      throw createError({
        statusCode: 404,
        statusMessage: "Профиль пользователя не найден",
      });
    }

    return {
      totalTestsCompleted: statistics.totalTestsCompleted,
      totalQuestionsAnswered: statistics.totalQuestionsAnswered,
      totalCorrectAnswers: statistics.totalCorrectAnswers,
      averageScore: Number(statistics.averageScore),
      problematicQuestionsCount: statistics.uncorrectedQuestionsCount,
      uncorrectedQuestionsCount: statistics.uncorrectedQuestionsCount,
      lastActivityAt: statistics.lastActivityAt,
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error("Error fetching profile statistics:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении статистики профиля",
    });
  }
});
