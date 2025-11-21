export default defineEventHandler(async (event) => {
  // Проверяем, что это POST запрос
  if (event.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    // Очищаем сессию пользователя
    await clearUserSession(event);

    console.log("API logout");

    return {
      success: true,
      message: "Успешный выход из системы",
    };
  } catch (error: any) {
    console.error("Logout error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Внутренняя ошибка сервера",
    });
  }
});
