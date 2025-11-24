import { prisma } from "../../utils/prisma";

interface TestPayload {
  name?: string;
  description?: string | null;
  questionCount?: number;
  isPublished?: boolean;
  requiresPremium?: boolean;
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
  if (tag === null) {
    return null;
  }
  return undefined;
};

export default defineEventHandler(async (event) => {
  const idParam = event.context.params?.id;

  if (!idParam) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID теста обязателен",
    });
  }

  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректный ID теста",
    });
  }

  try {
    const body = (await readBody(event)) as TestPayload;
    const {
      name,
      description,
      questionCount,
      isPublished,
      requiresPremium,
      tags,
      questionIds,
      primaryTag,
    } = body;

    const existing = await prisma.test.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: "Тест не найден",
      });
    }

    const data: Parameters<typeof prisma.test.update>[0]["data"] = {};

    if (name !== undefined) {
      if (!name) {
        throw createError({
          statusCode: 400,
          statusMessage: "Название теста обязательно",
        });
      }
      data.name = name;
    }

    if (description !== undefined) {
      data.description = description;
    }

    if (questionCount !== undefined) {
      if (
        Number.isNaN(Number(questionCount)) ||
        Number(questionCount) <= 0
      ) {
        throw createError({
          statusCode: 400,
          statusMessage: "Количество вопросов должно быть положительным",
        });
      }
      data.questionCount = Number(questionCount);
    }

    if (questionIds !== undefined) {
      data.questionIds = parseQuestionIds(questionIds);
    }

    if (isPublished !== undefined) {
      if (typeof isPublished !== "boolean") {
        throw createError({
          statusCode: 400,
          statusMessage: "Некорректное значение isPublished",
        });
      }
      data.isPublished = isPublished;
    }

    if (requiresPremium !== undefined) {
      if (typeof requiresPremium !== "boolean") {
        throw createError({
          statusCode: 400,
          statusMessage: "Некорректное значение requiresPremium",
        });
      }
      data.requiresPremium = requiresPremium;
    }

    let secondaryTagIds: number[] | undefined;
    const primaryTagId = parseSingleTagId(primaryTag);

    if (primaryTag !== undefined) {
      data.primaryTagId = primaryTagId ?? null;
    }

    if (tags !== undefined) {
      const tagIds = parseTagIds(tags);
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
          throw createError({
            statusCode: 400,
            statusMessage: `Некоторые теги не найдены: ${missingIds.join(", ")}`,
          });
        }
      }

      data.tags = {
        set: secondaryTagIds.map((tagId) => ({ id: tagId })),
      };
    } else if (typeof primaryTagId === "number") {
      const existingPrimary = await prisma.tag.findUnique({
        where: { id: primaryTagId },
        select: { id: true },
      });
      if (!existingPrimary) {
        throw createError({
          statusCode: 400,
          statusMessage: "Указанный главный тег не найден",
        });
      }
    }

    const updated = await prisma.test.update({
      where: { id },
      data,
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
      test: updated,
      message: "Тест обновлён",
    };
  } catch (error) {
    console.error(`Error updating test ${id}:`, error);

    if ((error as { statusCode?: number })?.statusCode) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Ошибка при обновлении теста";

    throw createError({
      statusCode: 500,
      statusMessage: errorMessage,
      message: errorMessage,
    });
  }
});

