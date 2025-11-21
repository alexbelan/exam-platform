import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const questionId = getRouterParam(event, "id");

    if (!questionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID вопроса обязателен",
      });
    }

    // Проверка существования вопроса
    const existingQuestion = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      throw createError({
        statusCode: 404,
        statusMessage: "Вопрос не найден",
      });
    }

    // Удаление вопроса
    await prisma.interviewQuestion.delete({
      where: { id: questionId },
    });

    return {
      success: true,
      message: "Вопрос успешно удален",
    };
  } catch (error) {
    console.error("Error deleting question:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при удалении вопроса",
    });
  }
});
