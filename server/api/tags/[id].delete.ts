import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const tagId = getRouterParam(event, "id");

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

    await prisma.tag.delete({
      where: { id: tagId },
    });

    return {
      success: true,
      message: "Тег удален",
    };
  } catch (error: any) {
    console.error("Error deleting tag:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при удалении тега",
    });
  }
});
