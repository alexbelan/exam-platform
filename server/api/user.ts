export default defineEventHandler(async (event) => {
  try {
    // Получаем текущую сессию пользователя
    const session = await getUserSession(event);

    if (!session.user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Пользователь не авторизован",
      });
    }

    return {
      success: true,
      user: session.user,
      session: {
        loggedInAt: session.loggedInAt,
      },
    };
  } catch (error: any) {
    // Если это уже наша ошибка, просто пробрасываем её
    if (error.statusCode) {
      throw error;
    }

    console.error("Get user session error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Внутренняя ошибка сервера",
    });
  }
});
