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

  // Преобразуем данные в нужный формат
  const questions = favorites
    .map((fav: { questionId: number; question: any }) => fav.question)
    .filter((q: any) => q !== null);

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
    .map((fav: { testId: number; test: any }) => fav.test)
    .filter((t: any) => t !== null);

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

/**
 * Переключить статус избранного вопроса
 */
export async function toggleFavoriteQuestion(
  userId: string,
  questionId: number
) {
  const userIdNum = Number(userId);

  console.log(
    "toggleFavoriteQuestion - userId:",
    userIdNum,
    "questionId:",
    questionId
  );

  // Проверяем существование вопроса
  const question = await prisma.interviewQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new Error("Вопрос не найден");
  }

  // Убеждаемся, что UserProfile существует
  let userProfile = await prisma.userProfile.findUnique({
    where: { userId: userIdNum },
  });

  if (!userProfile) {
    console.log("UserProfile не найден, создаем для userId:", userIdNum);
    // Создаем профиль, если его нет (для старых пользователей)
    try {
      userProfile = await prisma.userProfile.create({
        data: { userId: userIdNum },
      });
      console.log("UserProfile создан:", userProfile);
    } catch (error) {
      console.error("Ошибка при создании UserProfile:", error);
      throw new Error("Не удалось создать профиль пользователя");
    }
  } else {
    console.log("UserProfile найден:", userProfile);
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
    // Удаляем из избранного
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
    // Добавляем в избранное
    await prisma.userFavoriteQuestion.create({
      data: {
        userId: userIdNum,
        questionId,
      },
    });
    return { isFavorite: true, message: "Вопрос добавлен в избранное" };
  }
}

/**
 * Переключить статус избранного теста
 */
export async function toggleFavoriteTest(userId: string, testId: number) {
  const userIdNum = Number(userId);

  console.log("toggleFavoriteTest - userId:", userIdNum, "testId:", testId);

  // Проверяем существование теста
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
    console.log("UserProfile не найден, создаем для userId:", userIdNum);
    try {
      userProfile = await prisma.userProfile.create({
        data: { userId: userIdNum },
      });
      console.log("UserProfile создан:", userProfile);
    } catch (error) {
      console.error("Ошибка при создании UserProfile:", error);
      throw new Error("Не удалось создать профиль пользователя");
    }
  } else {
    console.log("UserProfile найден:", userProfile);
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
