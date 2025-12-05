import { prisma } from "./prisma";

interface GetUncorrectedIncorrectAnswersOptions {
  page?: number;
  limit?: number;
}

interface GetUncorrectedIncorrectAnswersResult {
  questions: Array<{
    id: number;
    title: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    isFavorite: boolean;
    tags: Array<{
      id: number;
      name: string;
      slug: string;
      category: {
        id: number;
        name: string;
        slug: string;
        color: string | null;
      } | null;
    }>;
  }>;
  total: number;
}

export async function getUncorrectedIncorrectAnswers(
  userId: number,
  options?: GetUncorrectedIncorrectAnswersOptions
): Promise<GetUncorrectedIncorrectAnswersResult> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 12;
  const skip = (page - 1) * limit;

  // Получаем ID вопросов через raw SQL (необходимо для сложной логики фильтрации)
  const questionIdsResult = await prisma.$queryRaw<
    Array<{ questionId: number }>
  >`
    SELECT DISTINCT ON (tqa."questionId") tqa."questionId"
    FROM "test_question_answers" tqa
    INNER JOIN "test_attempts" ta ON tqa."attemptId" = ta."id"
    WHERE 
      ta."userId" = ${userId}
      AND tqa."isCorrect" = false
      -- Проверяем, что нет правильного ответа после этого неправильного
      AND NOT EXISTS (
        SELECT 1 
        FROM "test_question_answers" tqa2
        INNER JOIN "test_attempts" ta2 ON tqa2."attemptId" = ta2."id"
        WHERE 
          tqa2."questionId" = tqa."questionId"
          AND ta2."userId" = ${userId}
          AND tqa2."isCorrect" = true
          AND tqa2."createdAt" > tqa."createdAt"
      )
      -- И проверяем, что нет правильного ответа ДО этого неправильного
      -- (если был правильный до, значит пользователь знал ответ)
      AND NOT EXISTS (
        SELECT 1 
        FROM "test_question_answers" tqa3
        INNER JOIN "test_attempts" ta3 ON tqa3."attemptId" = ta3."id"
        WHERE 
          tqa3."questionId" = tqa."questionId"
          AND ta3."userId" = ${userId}
          AND tqa3."isCorrect" = true
          AND tqa3."createdAt" < tqa."createdAt"
      )
    ORDER BY tqa."questionId", tqa."createdAt" DESC
  `;

  const allQuestionIds = questionIdsResult.map((r) => r.questionId);
  const total = allQuestionIds.length;

  // Применяем пагинацию
  const paginatedQuestionIds = allQuestionIds.slice(skip, skip + limit);

  // Если нет вопросов, возвращаем пустой результат
  if (paginatedQuestionIds.length === 0) {
    return {
      questions: [],
      total,
    };
  }

  // Получаем полные данные вопросов через Prisma с проверкой избранных
  const questions = await prisma.interviewQuestion.findMany({
    where: {
      id: { in: paginatedQuestionIds },
    },
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
      favoriteQuestions: {
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  // Преобразуем данные, добавляя поле isFavorite
  const questionsWithFavorite = questions.map((q) => ({
    id: q.id,
    title: q.title,
    isPublished: q.isPublished,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
    isFavorite: q.favoriteQuestions.length > 0, // Проверяем, есть ли избранное
    tags: q.tags,
  }));

  return {
    questions: questionsWithFavorite,
    total,
  };
}
