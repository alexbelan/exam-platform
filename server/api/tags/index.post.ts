import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, categoryId }: { name?: string; categoryId?: string } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Название тега обязательно",
      });
    }
    const trimmedName = name.trim();
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: "Не удалось сгенерировать slug для тега",
      });
    }

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!categoryExists) {
        throw createError({
          statusCode: 404,
          statusMessage: "Указанная категория не найдена",
        });
      }
    }

    // Проверяем, существует ли тег с таким именем или slug
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [{ name: trimmedName }, { slug }],
      },
    });

    if (existingTag) {
      throw createError({
        statusCode: 409,
        statusMessage: "Тег с таким названием уже существует",
      });
    }

    // Создаем новый тег
    const newTag = await prisma.tag.create({
      data: {
        name: trimmedName,
        slug,
        ...(categoryId
          ? {
              category: {
                connect: { id: categoryId },
              },
            }
          : {}),
      },
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
      tag: newTag,
    };
  } catch (error) {
    console.error("Error creating tag:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при создании тега",
    });
  }
});
