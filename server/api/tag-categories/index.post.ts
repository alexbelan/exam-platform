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
    const body = await readBody<{ name?: string; color?: string }>(event);
    const { name, color } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Название категории обязательно",
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

    const trimmedName = name.trim();
    const slug = slugify(trimmedName);

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: "Не удалось сгенерировать slug для категории",
      });
    }

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: trimmedName }, { slug }],
      },
    });

    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: "Категория с таким названием уже существует",
      });
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        slug,
        color: color ? color.trim().toLowerCase() : undefined,
      },
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
      message: "Категория успешно создана",
    };
  } catch (error: any) {
    console.error("Error creating tag category:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при создании категории тегов",
    });
  }
});
