import { prisma } from "./prisma";

interface UpdateUncorrectedQuestionsCountParams {
  userId: number;
  incorrectQuestionIds: number[];
}

/**
 * Обновляет счетчик непройденных вопросов в статистике пользователя
 *
 * Логика:
 * 1. Для каждого неправильного вопроса проверяем, был ли правильный ответ до этого
 * 2. Если не было правильного ответа - вопрос считается непройденным
 * 3. Подсчитываем количество уникальных непройденных вопросов
 */
export async function updateUncorrectedQuestionsCount(
  params: UpdateUncorrectedQuestionsCountParams
): Promise<{ updated: boolean; count: number }> {
  const { userId, incorrectQuestionIds } = params;

  // Получаем текущую статистику
  const statistics = await prisma.learningStatistics.findUnique({
    where: { userId },
  });

  if (!statistics) {
    throw new Error(`Statistics not found for user ${userId}`);
  }

  // Если нет неправильных вопросов, сбрасываем счетчик
  if (incorrectQuestionIds.length === 0) {
    const updated = await prisma.learningStatistics.update({
      where: { userId },
      data: {
        uncorrectedQuestionsCount: 0,
        lastActivityAt: new Date(),
      },
    });

    return {
      updated: true,
      count: updated.uncorrectedQuestionsCount,
    };
  }

  // Для каждого неправильного вопроса проверяем, был ли правильный ответ до этого
  const uncorrectedQuestionIds: number[] = [];

  for (const questionId of incorrectQuestionIds) {
    // Проверяем, был ли правильный ответ на этот вопрос до последнего неправильного
    const hasCorrectBefore = await prisma.testQuestionAnswer.findFirst({
      where: {
        questionId,
        attempt: { userId },
        isCorrect: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Если не было правильного ответа - вопрос непройденный
    if (!hasCorrectBefore) {
      uncorrectedQuestionIds.push(questionId);
    }
  }

  // Удаляем дубликаты
  const uniqueUncorrectedIds = [...new Set(uncorrectedQuestionIds)];

  // Обновляем счетчик
  const updated = await prisma.learningStatistics.update({
    where: { userId },
    data: {
      uncorrectedQuestionsCount: uniqueUncorrectedIds.length,
      lastActivityAt: new Date(),
    },
  });

  return {
    updated: true,
    count: updated.uncorrectedQuestionsCount,
  };
}
