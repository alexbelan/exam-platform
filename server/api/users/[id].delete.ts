import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, "id");

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID пользователя обязателен",
      });
    }

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: "Пользователь не найден",
      });
    }

    // Удаление пользователя (каскадное удаление submissions)
    await prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: "Пользователь успешно удален",
    };
  } catch (error) {
    console.error("Error deleting user:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при удалении пользователя",
    });
  }
});
