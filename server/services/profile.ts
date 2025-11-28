import { prisma } from '../utils/prisma';
import { getUncorrectedIncorrectAnswers } from '../utils/getUncorrectedIncorrectAnswers';
import { updateUncorrectedQuestionsCount } from '../utils/updateUncorrectedQuestionsCount';

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

/**
 * Получить статистику обучения
 */
export async function getStatistics(userId: string) {
  // Получаем статистику обучения (профиль создаётся при регистрации)
  const statistics = await prisma.learningStatistics.findUnique({
    where: { userId },
  });

  if (!statistics) {
    throw new Error('Профиль пользователя не найден');
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
}

/**
 * Получить неправильные ответы
 */
export async function getIncorrectAnswers(
  userId: string,
  params: {
    page?: number;
    limit?: number;
  }
) {
  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : 12;

  // Получаем неправильные ответы через утилиту (с пагинацией)
  const { questions, total } = await getUncorrectedIncorrectAnswers(
    Number(userId),
    {
      page,
      limit,
    }
  );

  return {
    questions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Обновить счетчик непройденных вопросов
 */
export async function updateUncorrectedQuestions(
  userId: string,
  questionIds: number[]
) {
  // Нормализуем и валидируем ID вопросов
  const normalizedQuestionIds = questionIds
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  // Обновляем счетчик
  const result = await updateUncorrectedQuestionsCount({
    userId: Number(userId),
    incorrectQuestionIds: normalizedQuestionIds,
  });

  return {
    uncorrectedQuestionsCount: result.count,
  };
}

/**
 * Получить избранные вопросы
 */
export async function getFavoriteQuestions(
  userId: string,
  params: {
    page?: number;
    limit?: number;
  }
) {
  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : 12;

  // Получаем избранные вопросы с пагинацией (профиль создаётся при регистрации)
  const where = {
    userId,
  };

  const [favorites, total] = await Promise.all([
    prisma.userFavoriteQuestion.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
}

/**
 * Получить избранные тесты
 */
export async function getFavoriteTests(
  userId: string,
  params: {
    page?: number;
    limit?: number;
  }
) {
  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : 12;

  // Получаем избранные тесты с пагинацией (профиль создаётся при регистрации)
  const where = {
    userId,
  };

  const [favorites, total] = await Promise.all([
    prisma.userFavoriteTest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
}

