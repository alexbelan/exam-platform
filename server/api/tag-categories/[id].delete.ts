import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const categoryId = getRouterParam(event, "id");

    if (!categoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID категории обязателен",
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            tags: true,
          },
        },
      },
    });

    if (!existingCategory) {
      throw createError({
        statusCode: 404,
        statusMessage: "Категория не найдена",
      });
    }

    if (existingCategory._count.tags > 0) {
      throw createError({
        statusCode: 409,
        statusMessage:
          "Невозможно удалить категорию, пока в ней есть связанные теги",
      });
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return {
      success: true,
      message: "Категория удалена",
    };
  } catch (error: any) {
    console.error("Error deleting tag category:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при удалении категории тегов",
    });
  }
});
