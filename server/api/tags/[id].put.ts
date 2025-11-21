import { prisma } from "../../utils/prisma";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default defineEventHandler(async (event) => {
  try {
    const tagId = getRouterParam(event, "id");
    const body = await readBody<{
      name?: string;
      categoryId?: string | null;
    }>(event);

    if (!tagId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID тега обязателен",
      });
    }

    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!existingTag) {
      throw createError({
        statusCode: 404,
        statusMessage: "Тег не найден",
      });
    }

    const updateData: Record<string, any> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        throw createError({
          statusCode: 400,
          statusMessage: "Название тега обязательно",
        });
      }

      const trimmedName = body.name.trim();
      const newSlug = slugify(trimmedName);

      if (!newSlug) {
        throw createError({
          statusCode: 400,
          statusMessage: "Не удалось сгенерировать slug для тега",
        });
      }

      const duplicate = await prisma.tag.findFirst({
        where: {
          OR: [{ name: trimmedName }, { slug: newSlug }],
          NOT: { id: tagId },
        },
      });

      if (duplicate) {
        throw createError({
          statusCode: 409,
          statusMessage: "Тег с таким названием уже существует",
        });
      }

      updateData.name = trimmedName;
      updateData.slug = newSlug;
    }

    if (body.categoryId !== undefined) {
      if (body.categoryId === null || body.categoryId === "") {
        updateData.categoryId = null;
      } else {
        const categoryExists = await prisma.category.findUnique({
          where: { id: body.categoryId },
        });

        if (!categoryExists) {
          throw createError({
            statusCode: 404,
            statusMessage: "Указанная категория не найдена",
          });
        }

        updateData.categoryId = body.categoryId;
      }
    }

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: updateData,
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
    });

    return {
      success: true,
      tag,
      message: "Тег успешно обновлен",
    };
  } catch (error: any) {
    console.error("Error updating tag:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при обновлении тега",
    });
  }
});
