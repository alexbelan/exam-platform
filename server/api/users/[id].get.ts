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

    // Получение пользователя с дополнительной информацией
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        submittedQuestions: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            submittedQuestions: true,
          },
        },
      },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "Пользователь не найден",
      });
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Error fetching user:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении пользователя",
    });
  }
});
