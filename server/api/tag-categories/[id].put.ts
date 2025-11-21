import { prisma } from "../../utils/prisma";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const isHexColor = (value: string) =>
  /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value);

export default defineEventHandler(async (event) => {
  try {
    const categoryId = getRouterParam(event, "id");
    const body = await readBody<{ name?: string; color?: string }>(event);
    const { name, color } = body;

    if (!categoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID категории обязателен",
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw createError({
        statusCode: 404,
        statusMessage: "Категория не найдена",
      });
    }

    if (
      color !== undefined &&
      (typeof color !== "string" || !isHexColor(color.trim().toLowerCase()))
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "Цвет должен быть в формате HEX, например #3b82f6",
      });
    }

    if (name === undefined && color === undefined) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          _count: {
            select: {
              tags: true,
            },
          },
        },
      });

      return {
        success: true,
        category,
        message: "Категория обновлена",
      };
    }

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        throw createError({
          statusCode: 400,
          statusMessage: "Название категории обязательно",
        });
      }

      const trimmedName = name.trim();
      const newSlug = slugify(trimmedName);

      if (!newSlug) {
        throw createError({
          statusCode: 400,
          statusMessage: "Не удалось сгенерировать slug для категории",
        });
      }

      const duplicate = await prisma.category.findFirst({
        where: {
          OR: [{ name: trimmedName }, { slug: newSlug }],
          NOT: { id: categoryId },
        },
      });

      if (duplicate) {
        throw createError({
          statusCode: 409,
          statusMessage: "Категория с таким названием уже существует",
        });
      }

      updateData.name = trimmedName;
      updateData.slug = newSlug;
    }

    if (color !== undefined) {
      updateData.color = color.trim().toLowerCase();
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        _count: {
          select: {
            tags: true,
          },
        },
      },
    });

    return {
      success: true,
      category,
      message: "Категория успешно обновлена",
    };
  } catch (error: any) {
    console.error("Error updating tag category:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при обновлении категории тегов",
    });
  }
});
