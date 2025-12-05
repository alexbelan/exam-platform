import { prisma } from "../utils/prisma";
import { hasPremiumAccess } from "../utils/subscription";
import { generateTestQuestions as generateQuestions } from "../utils/test-generator";
import { updateLearningStatistics } from "./statistics";
import type { Prisma } from "@prisma/client";

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

// Вспомогательные функции для парсинга
const parseTagIds = (tags?: Array<number | { id: number }>) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => {
      if (typeof tag === "number" && Number.isInteger(tag) && tag > 0) {
        return tag;
      }
      if (tag && typeof tag === "object" && "id" in tag) {
        const value = Number(tag.id);
        return Number.isInteger(value) && value > 0 ? value : null;
      }
      return null;
    })
    .filter((tagId): tagId is number => typeof tagId === "number");
};

const parseQuestionIds = (questionIds?: number[]) => {
  if (!Array.isArray(questionIds)) {
    return [];
  }

  return questionIds
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
};

const parseSingleTagId = (tag?: number | { id: number } | null) => {
  if (typeof tag === "number" && Number.isInteger(tag) && tag > 0) {
    return tag;
  }
  if (tag && typeof tag === "object" && "id" in tag) {
    const value = Number(tag.id);
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  if (tag === null) {
    return null;
  }
  return undefined;
};

/**
 * Получить тест по ID
 */
export async function getTestById(id: number, user: { role: string } | null) {
  const test = await prisma.test.findUnique({
    where: { id },
    include: TAG_INCLUDE,
  });

  if (!test) {
    throw new Error("Тест не найден");
  }

  // Проверка доступа: неопубликованные тесты доступны только админам
  const isAdmin = user?.role === "ADMIN";
  if (!test.isPublished && !isAdmin) {
    throw new Error("Доступ запрещен");
  }

  return {
    id: test.id,
    name: test.name,
    description: test.description,
    questionCount: test.questionCount,
    tags: test.tags,
    primaryTag: test.primaryTag,
    isPublished: test.isPublished,
  };
}

/**
 * Получить список тестов
 */
export async function getTestList(params: {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  isPublished?: boolean;
  user: { role: string } | null;
}) {
  const { page = 1, limit = 10, search, tags, isPublished, user } = params;
  const isAdmin = user?.role === "ADMIN";
  const isPremium = user ? hasPremiumAccess(user) : false;

  type FindManyArgs = NonNullable<Parameters<typeof prisma.test.findMany>[0]>;
  const where: NonNullable<FindManyArgs["where"]> = {};
  const andConditions: any[] = [];

  // Поиск по названию
  if (search) {
    andConditions.push({
      OR: [{ name: { contains: search, mode: "insensitive" } }],
    });
  }

  // Фильтрация по тегам (обычные теги ИЛИ главный тег)
  if (tags && tags.length > 0) {
    andConditions.push({
      OR: [
        { tags: { some: { slug: { in: tags } } } },
        { primaryTag: { slug: { in: tags } } },
      ],
    });
  }

  // Фильтр по публикации с проверкой прав
  if (isPublished !== undefined) {
    if (isPublished === false && !isAdmin) {
      // Для не-админов игнорируем false и показываем только опубликованные
      where.isPublished = true;
    } else {
      where.isPublished = isPublished;
    }
  } else {
    // По умолчанию показываем только опубликованные
    where.isPublished = true;
  }

  // Фильтр по премиум доступу
  if (!isPremium) {
    where.requiresPremium = false;
  }

  // Объединяем все условия через AND
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const [tests, total] = await Promise.all([
    prisma.test.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        ...TAG_INCLUDE,
        favoriteTests: user
          ? {
              where: {
                userId: Number(user.id),
              },
              select: {
                testId: true,
              },
            }
          : false,
      },
    }),
    prisma.test.count({ where }),
  ]);

  // Добавляем isFavorite к каждому тесту
  const testsWithFavorite = tests.map((test) => ({
    ...test,
    isFavorite: user && test.favoriteTests && test.favoriteTests.length > 0,
    favoriteTests: undefined, // удаляем из ответа
  }));

  return {
    tests: testsWithFavorite,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Создать тест
 */
export async function createTest(data: {
  name: string;
  description?: string | null;
  questionCount: number;
  isPublished?: boolean;
  requiresPremium?: boolean;
  tags?: Array<number | { id: number }>;
  questionIds?: number[];
  primaryTag?: number | { id: number } | null;
}) {
  if (!data.name || typeof data.name !== "string") {
    throw new Error("Название теста обязательно");
  }

  if (
    data.questionCount === undefined ||
    Number.isNaN(Number(data.questionCount)) ||
    Number(data.questionCount) <= 0
  ) {
    throw new Error("Количество вопросов должно быть положительным");
  }

  if (data.isPublished !== undefined && typeof data.isPublished !== "boolean") {
    throw new Error("Некорректное значение isPublished");
  }

  if (
    data.requiresPremium !== undefined &&
    typeof data.requiresPremium !== "boolean"
  ) {
    throw new Error("Некорректное значение requiresPremium");
  }

  const tagIds = parseTagIds(data.tags);
  const primaryTagId = parseSingleTagId(data.primaryTag);
  const hasPrimary = typeof primaryTagId === "number";
  const secondaryTagIdsRaw = hasPrimary
    ? tagIds.filter((id) => id !== primaryTagId)
    : tagIds;
  const secondaryTagIds = [...new Set(secondaryTagIdsRaw)];

  const idsToValidate = [...secondaryTagIds];
  if (typeof primaryTagId === "number") {
    idsToValidate.push(primaryTagId);
  }

  if (idsToValidate.length > 0) {
    const existingTags = await prisma.tag.findMany({
      where: { id: { in: idsToValidate } },
      select: { id: true },
    });

    const foundIds = new Set(existingTags.map((tag) => tag.id));
    const missingIds = idsToValidate.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new Error(`Некоторые теги не найдены: ${missingIds.join(", ")}`);
    }
  }

  const normalizedQuestionIds = parseQuestionIds(data.questionIds);

  return prisma.test.create({
    data: {
      name: data.name,
      description: data.description,
      questionCount: Number(data.questionCount),
      questionIds: normalizedQuestionIds,
      isPublished: data.isPublished ?? false,
      requiresPremium: data.requiresPremium ?? false,
      primaryTagId: primaryTagId ?? null,
      tags: secondaryTagIds.length
        ? { connect: secondaryTagIds.map((id) => ({ id })) }
        : undefined,
    },
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
        },
      },
      primaryTag: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
        },
      },
    },
  });
}

/**
 * Обновить тест
 */
export async function updateTest(
  id: number,
  data: {
    name?: string;
    description?: string | null;
    questionCount?: number;
    isPublished?: boolean;
    requiresPremium?: boolean;
    tags?: Array<number | { id: number }>;
    questionIds?: number[];
    primaryTag?: number | { id: number } | null;
  }
) {
  const existing = await prisma.test.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Тест не найден");
  }

  const updateData: Parameters<typeof prisma.test.update>[0]["data"] = {};

  if (data.name !== undefined) {
    if (!data.name) {
      throw new Error("Название теста обязательно");
    }
    updateData.name = data.name;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.questionCount !== undefined) {
    if (
      Number.isNaN(Number(data.questionCount)) ||
      Number(data.questionCount) <= 0
    ) {
      throw new Error("Количество вопросов должно быть положительным");
    }
    updateData.questionCount = Number(data.questionCount);
  }

  if (data.questionIds !== undefined) {
    updateData.questionIds = parseQuestionIds(data.questionIds);
  }

  if (data.isPublished !== undefined) {
    if (typeof data.isPublished !== "boolean") {
      throw new Error("Некорректное значение isPublished");
    }
    updateData.isPublished = data.isPublished;
  }

  if (data.requiresPremium !== undefined) {
    if (typeof data.requiresPremium !== "boolean") {
      throw new Error("Некорректное значение requiresPremium");
    }
    updateData.requiresPremium = data.requiresPremium;
  }

  let secondaryTagIds: number[] | undefined;
  const primaryTagId = parseSingleTagId(data.primaryTag);

  if (data.primaryTag !== undefined) {
    updateData.primaryTagId = primaryTagId ?? null;
  }

  if (data.tags !== undefined) {
    const tagIds = parseTagIds(data.tags);
    const hasPrimary = typeof primaryTagId === "number";
    const filteredSecondaryTagIds = hasPrimary
      ? tagIds.filter((tagId) => tagId !== primaryTagId)
      : tagIds;
    secondaryTagIds = [...new Set(filteredSecondaryTagIds)];

    const idsToValidate = [...secondaryTagIds];
    if (typeof primaryTagId === "number") {
      idsToValidate.push(primaryTagId);
    }

    if (idsToValidate.length > 0) {
      const existingTags = await prisma.tag.findMany({
        where: { id: { in: idsToValidate } },
        select: { id: true },
      });

      const foundIds = new Set(existingTags.map((tag) => tag.id));
      const missingIds = idsToValidate.filter((tagId) => !foundIds.has(tagId));

      if (missingIds.length > 0) {
        throw new Error(`Некоторые теги не найдены: ${missingIds.join(", ")}`);
      }
    }

    updateData.tags = {
      set: secondaryTagIds.map((tagId) => ({ id: tagId })),
    };
  } else if (typeof primaryTagId === "number") {
    const existingPrimary = await prisma.tag.findUnique({
      where: { id: primaryTagId },
      select: { id: true },
    });
    if (!existingPrimary) {
      throw new Error("Указанный главный тег не найден");
    }
  }

  return prisma.test.update({
    where: { id },
    data: updateData,
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
        },
      },
      primaryTag: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
        },
      },
    },
  });
}

/**
 * Удалить тест
 */
export async function deleteTest(id: number) {
  return prisma.test.delete({
    where: { id },
  });
}

/**
 * Сгенерировать вопросы для теста
 */
export async function generateTestQuestions(id: number) {
  // Получаем тест для проверки и генерации
  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      tags: true,
      primaryTag: true,
    },
  });

  if (!test) {
    throw new Error("Тест не найден");
  }

  // Проверяем, что у теста есть необходимые данные для генерации
  if (!test.primaryTagId) {
    throw new Error("У теста не указан основной тег (primaryTagId)");
  }

  if (!test.tags || test.tags.length === 0) {
    throw new Error("У теста не указаны второстепенные теги");
  }

  // Извлекаем ID второстепенных тегов
  const secondaryTagIds = test.tags.map((tag: { id: number }) => tag.id);

  // Генерируем вопросы на основе данных теста
  const questions = await generateQuestions({
    primaryTagId: test.primaryTagId,
    secondaryTagIds,
    questionCount: test.questionCount,
  });

  return {
    questions, // массив ID вопросов
  };
}

/**
 * Сохранить результаты прохождения теста
 */
export async function submitTestAttempt(
  userId: number,
  data: {
    testId: number;
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    timeSpent?: number;
    startedAt: Date;
    completedAt: Date;
    questionAnswers: Array<{
      questionId: number;
      userAnswerIds: number[];
      correctAnswerIds: number[];
      isCorrect: boolean;
      timeSpent?: number;
    }>;
  }
) {
  // Используем транзакцию для атомарности всех операций
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Создаем TestAttempt с детальными ответами
    const attempt = await tx.testAttempt.create({
      data: {
        userId,
        testId: data.testId,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        score: data.score,
        timeSpent: data.timeSpent,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        status: "COMPLETED",
        questionAnswers: {
          create: data.questionAnswers.map((qa) => ({
            questionId: qa.questionId,
            userAnswerIds: qa.userAnswerIds,
            correctAnswerIds: qa.correctAnswerIds,
            isCorrect: qa.isCorrect,
            timeSpent: qa.timeSpent,
          })),
        },
      },
      include: {
        questionAnswers: true,
      },
    });

    // 2. Обновляем общую статистику обучения
    await updateLearningStatistics(userId, {
      totalQuestions: data.totalQuestions,
      correctAnswers: data.correctAnswers,
      score: data.score,
    });

    return attempt;
  });
}
