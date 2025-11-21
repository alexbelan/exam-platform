import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID теста обязателен",
    });
  }

  try {
    await prisma.test.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Тест удалён",
    };
  } catch (error) {
    console.error(`Error deleting test ${id}:`, error);

    if ((error as { code?: string })?.code === "P2025") {
      throw createError({
        statusCode: 404,
        statusMessage: "Тест не найден",
      });
    }

    if ((error as { statusCode?: number })?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при удалении теста",
    });
  }
});
