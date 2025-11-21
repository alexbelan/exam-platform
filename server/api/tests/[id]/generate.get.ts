import { prisma } from "../../../utils/prisma";
import { createError } from "h3";
import { generateTestQuestions } from "../../../utils/test-generator";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID теста обязателен",
    });
  }

  try {
    // Получаем тест для проверки и генерации
    const test = await prisma.test.findUnique({
      where: { id: Number(id) },
      include: {
        tags: true,
        primaryTag: true,
      },
    });

    if (!test) {
      throw createError({
        statusCode: 404,
        statusMessage: "Тест не найден",
      });
    }

    // Проверяем, что у теста есть необходимые данные для генерации
    if (!test.primaryTagId) {
      throw createError({
        statusCode: 400,
        statusMessage: "У теста не указан основной тег (primaryTagId)",
      });
    }

    if (!test.tags || test.tags.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "У теста не указаны второстепенные теги",
      });
    }

    // Извлекаем ID второстепенных тегов
    const secondaryTagIds = test.tags.map((tag: { id: number }) => tag.id);

    // Генерируем вопросы на основе данных теста
    const questions = await generateTestQuestions({
      primaryTagId: test.primaryTagId,
      secondaryTagIds,
      questionCount: test.questionCount,
    });

    // Возвращаем только массив ID вопросов
    return {
      success: true,
      questions, // массив ID вопросов
      message: "Вопросы сгенерированы",
    };
  } catch (error) {
    console.error(`Error generating test questions for ${id}:`, error);

    if ((error as { statusCode?: number })?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage:
        (error as Error)?.message || "Ошибка при генерации вопросов",
    });
  }
});
