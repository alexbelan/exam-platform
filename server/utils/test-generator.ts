import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

interface GenerateTestQuestionsOptions {
  primaryTagId: number;
  secondaryTagIds: number[]; // Обязательное поле, минимум 1 элемент
  questionCount: number;
}

/**
 * Генерирует массив ID вопросов в случайном порядке на основе тегов
 * 
 * Логика:
 * - primaryTagId обязателен (должен быть в каждом вопросе)
 * - secondaryTagIds обязательны, минимум 1 элемент, хотя бы один должен присутствовать в вопросе
 * - Приоритет: вопросы с большим количеством secondaryTagIds идут первыми
 * - Всегда ищет только опубликованные вопросы (isPublished: true)
 * 
 * @param options - Параметры генерации вопросов
 * @returns Массив ID вопросов
 */
export async function generateTestQuestions(
  options: GenerateTestQuestionsOptions
): Promise<number[]> {
  const {
    primaryTagId,
    secondaryTagIds,
    questionCount,
  } = options;

  // Валидация
  if (!primaryTagId || !Number.isInteger(Number(primaryTagId))) {
    throw new Error("primaryTagId обязателен и должен быть числом");
  }

  if (!Array.isArray(secondaryTagIds) || secondaryTagIds.length === 0) {
    throw new Error("secondaryTagIds обязателен и должен содержать минимум один элемент");
  }

  if (questionCount <= 0 || !Number.isInteger(questionCount)) {
    throw new Error("Количество вопросов должно быть положительным целым числом");
  }

  // Проверка существования тегов
  const allTagIds = [primaryTagId, ...secondaryTagIds].filter(
    (id, index, arr) => arr.indexOf(id) === index
  );

  const existingTags = await prisma.tag.findMany({
    where: { id: { in: allTagIds } },
    select: { id: true },
  });

  const foundTagIds = new Set(existingTags.map((tag) => tag.id));
  const missingTagIds = allTagIds.filter((id) => !foundTagIds.has(id));

  if (missingTagIds.length > 0) {
    throw new Error(`Некоторые теги не найдены: ${missingTagIds.join(", ")}`);
  }

  const normalizedSecondaryTagIds = secondaryTagIds.filter(
    (id) => id !== primaryTagId
  );

  if (normalizedSecondaryTagIds.length === 0) {
    throw new Error("secondaryTagIds должен содержать хотя бы один тег, отличный от primaryTagId");
  }

  // Оптимизированный запрос с JOIN вместо подзапросов
  const questions = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT 
      iq.id,
      COUNT(DISTINCT CASE 
        WHEN iqt_secondary."B" IN (${Prisma.join(normalizedSecondaryTagIds.map(id => Prisma.sql`${id}`))}) 
        THEN iqt_secondary."B" 
      END) as secondary_tag_count
    FROM interview_questions iq
    INNER JOIN "_InterviewQuestionToTag" iqt_primary 
      ON iq.id = iqt_primary."A" 
      AND iqt_primary."B" = ${primaryTagId}
    INNER JOIN "_InterviewQuestionToTag" iqt_secondary 
      ON iq.id = iqt_secondary."A" 
      AND iqt_secondary."B" IN (${Prisma.join(normalizedSecondaryTagIds.map(id => Prisma.sql`${id}`))})
    WHERE iq."isPublished" = true
    GROUP BY iq.id
    ORDER BY secondary_tag_count DESC, RANDOM()
    LIMIT ${questionCount}
  `;

  // Возвращаем только массив ID
  return questions.map((q) => q.id);
}

