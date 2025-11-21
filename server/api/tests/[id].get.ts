import { prisma } from "../../utils/prisma";
import { createError } from "h3";

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

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID теста обязателен",
    });
  }

  try {
    // Получаем только метаданные теста (без генерации вопросов)
    const test = await prisma.test.findUnique({
      where: { id: Number(id) },
      include: TAG_INCLUDE,
    });

    if (!test) {
      throw createError({
        statusCode: 404,
        statusMessage: "Тест не найден",
      });
    }

    // Возвращаем только метаданные теста
    return {
      success: true,
      test: {
        id: test.id,
        name: test.name,
        description: test.description,
        questionCount: test.questionCount,
        tags: test.tags,
        primaryTag: test.primaryTag,
        isPublished: test.isPublished,
      },
      message: "Данные теста получены",
    };
  } catch (error) {
    console.error(`Error fetching test ${id}:`, error);

    if ((error as { statusCode?: number })?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: (error as Error)?.message || "Ошибка при получении теста",
    });
  }
});
