import { prisma } from "../utils/prisma";
import { getUncorrectedIncorrectAnswers } from "../utils/getUncorrectedIncorrectAnswers";
import { updateUncorrectedQuestionsCount } from "../utils/updateUncorrectedQuestionsCount";

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

// Types for favorite questions
interface QuestionTagCategory {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface QuestionTag {
  id: number;
  name: string;
  slug: string;
  category: QuestionTagCategory | null;
}

interface FavoriteQuestion {
  id: number;
  title: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: QuestionTag[];
}

interface UserFavoriteQuestionItem {
  questionId: number;
  question: FavoriteQuestion | null;
}

// Types for favorite tests
interface TestTagCategory {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface TestTag {
  id: number;
  name: string;
  slug: string;
  category: TestTagCategory | null;
}

interface FavoriteTest {
  id: number;
  name: string;
  description: string | null;
  questionCount: number;
  questionIds: number[];
  isPublished: boolean;
  requiresPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: TestTag[];
  primaryTag: TestTag | null;
}

interface UserFavoriteTestItem {
  testId: number;
  test: FavoriteTest | null;
}

/**
 * Получить статистику обучения
 */
export async function getStatistics(userId: string) {
  // Получаем статистику обучения (профиль создаётся при регистрации)
  const statistics = await prisma.learningStatistics.findUnique({
    where: { userId },
  });

  if (!statistics) {
    throw new Error("Профиль пользователя не найден");
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
  },
) {
  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : 12;

  // Получаем неправильные ответы через утилиту (с пагинацией)
  const { questions, total } = await getUncorrectedIncorrectAnswers(
    Number(userId),
    {
      page,
      limit,
    },
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
  questionIds: number[],
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
  },
) {
  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : 12;

  // Преобразуем userId в число
  const userIdNum = Number(userId);

  // Получаем избранные вопросы с пагинацией (профиль создаётся при регистрации)
  const where = {
    userId: userIdNum,
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

  const questions = favorites
    .map((fav: UserFavoriteQuestionItem) => fav.question)
    .filter((q: FavoriteQuestion | null): q is FavoriteQuestion => q !== null);

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
  },
) {
  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : 12;

  // Преобразуем userId в число
  const userIdNum = Number(userId);

  // Получаем избранные тесты с пагинацией (профиль создаётся при регистрации)
  const where = {
    userId: userIdNum,
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
  const tests = favorites
    .map((fav: UserFavoriteTestItem) => fav.test)
    .filter((t: FavoriteTest | null): t is FavoriteTest => t !== null);

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

export async function toggleFavoriteQuestion(
  userId: string,
  questionId: number,
) {
  const userIdNum = Number(userId);

  const question = await prisma.interviewQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new Error("Вопрос не найден");
  }

  let userProfile = await prisma.userProfile.findUnique({
    where: { userId: userIdNum },
  });

  if (!userProfile) {
    try {
      userProfile = await prisma.userProfile.create({
        data: { userId: userIdNum },
      });
    } catch (error) {
      console.error("Ошибка при создании UserProfile:", error);
      throw new Error("Не удалось создать профиль пользователя");
    }
  } else {
    console.warn("UserProfile найден:", userProfile);
  }

  // Проверяем, есть ли уже в избранном
  const existing = await prisma.userFavoriteQuestion.findUnique({
    where: {
      userId_questionId: {
        userId: userIdNum,
        questionId,
      },
    },
  });

  if (existing) {
    await prisma.userFavoriteQuestion.delete({
      where: {
        userId_questionId: {
          userId: userIdNum,
          questionId,
        },
      },
    });
    return { isFavorite: false, message: "Вопрос удален из избранного" };
  } else {
    await prisma.userFavoriteQuestion.create({
      data: {
        userId: userIdNum,
        questionId,
      },
    });
    return { isFavorite: true, message: "Вопрос добавлен в избранное" };
  }
}

export async function toggleFavoriteTest(userId: string, testId: number) {
  const userIdNum = Number(userId);

  const test = await prisma.test.findUnique({
    where: { id: testId },
  });

  if (!test) {
    throw new Error("Тест не найден");
  }

  // Убеждаемся, что UserProfile существует
  let userProfile = await prisma.userProfile.findUnique({
    where: { userId: userIdNum },
  });

  if (!userProfile) {
    try {
      userProfile = await prisma.userProfile.create({
        data: { userId: userIdNum },
      });
    } catch (error) {
      console.error("Ошибка при создании UserProfile:", error);
      throw new Error("Не удалось создать профиль пользователя");
    }
  } else {
    console.warn("UserProfile найден:", userProfile);
  }

  // Проверяем, есть ли уже в избранном
  const existing = await prisma.userFavoriteTest.findUnique({
    where: {
      userId_testId: {
        userId: userIdNum,
        testId: testId,
      },
    },
  });

  if (existing) {
    // Удаляем из избранного
    await prisma.userFavoriteTest.delete({
      where: {
        userId_testId: {
          userId: userIdNum,
          testId: testId,
        },
      },
    });
    return { isFavorite: false, message: "Тест удален из избранного" };
  } else {
    // Добавляем в избранное
    await prisma.userFavoriteTest.create({
      data: {
        userId: userIdNum,
        testId: testId,
      },
    });
    return { isFavorite: true, message: "Тест добавлен в избранное" };
  }
}
