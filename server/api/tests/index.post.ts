import { prisma } from "../../utils/prisma";

interface TestPayload {
  name?: string;
  description?: string | null;
  questionCount?: number;
  isPublished?: boolean;
  tags?: Array<number | { id: number }>;
  questionIds?: number[];
  primaryTag?: number | { id: number } | null;
}

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
  return null;
};

export default defineEventHandler(async (event) => {
  try {
    const body = (await readBody(event)) as TestPayload;
    const {
      name,
      description,
      questionCount,
      isPublished,
      tags,
      questionIds,
      primaryTag,
    } = body;

    if (!name || typeof name !== "string") {
      throw createError({
        statusCode: 400,
        statusMessage: "Название теста обязательно",
      });
    }

    if (
      questionCount === undefined ||
      Number.isNaN(Number(questionCount)) ||
      Number(questionCount) <= 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "Количество вопросов должно быть положительным",
      });
    }

    if (isPublished !== undefined && typeof isPublished !== "boolean") {
      throw createError({
        statusCode: 400,
        statusMessage: "Некорректное значение isPublished",
      });
    }

    const tagIds = parseTagIds(tags);
    const primaryTagId = parseSingleTagId(primaryTag);
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

      const foundIds = new Set(
        existingTags.map((tag: { id: number }) => tag.id)
      );
      const missingIds = idsToValidate.filter((id) => !foundIds.has(id));

      if (missingIds.length > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: `Некоторые теги не найдены: ${missingIds.join(", ")}`,
        });
      }
    }

    const normalizedQuestionIds = parseQuestionIds(questionIds);

    const test = await prisma.test.create({
      data: {
        name,
        description,
        questionCount: Number(questionCount),
        questionIds: normalizedQuestionIds,
        isPublished: isPublished ?? false,
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

    return {
      success: true,
      test,
      message: "Тест создан",
    };
  } catch (error) {
    console.error("Error creating test:", error);

    if ((error as { statusCode?: number })?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при создании теста",
    });
  }
});
