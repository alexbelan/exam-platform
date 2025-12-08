import { prisma } from "../utils/prisma";

/**
 * Обновить статистику обучения пользователя
 */
export async function updateLearningStatistics(
  userId: number,
  data: {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
  },
) {
  // Получаем статистику (она всегда должна существовать, т.к. создается при регистрации)
  const statistics = await prisma.learningStatistics.findUnique({
    where: { userId },
  });

  if (!statistics) {
    throw new Error(`Statistics not found for user ${userId}`);
  }

  // Обновляем существующую статистику
  const newTotalTests = statistics.totalTestsCompleted + 1;
  const newTotalQuestions =
    statistics.totalQuestionsAnswered + data.totalQuestions;
  const newTotalCorrect = statistics.totalCorrectAnswers + data.correctAnswers;

  // Пересчитываем средний балл
  // Формула: (старый_средний * старые_попытки + новый_балл) / новые_попытки
  const currentTotalScore =
    Number(statistics.averageScore) * statistics.totalTestsCompleted;
  const newAverageScore =
    (currentTotalScore + Number(data.score)) / newTotalTests;

  return await prisma.learningStatistics.update({
    where: { userId },
    data: {
      totalTestsCompleted: newTotalTests,
      totalQuestionsAnswered: newTotalQuestions,
      totalCorrectAnswers: newTotalCorrect,
      averageScore: newAverageScore,
      lastActivityAt: new Date(),
    },
  });
}
