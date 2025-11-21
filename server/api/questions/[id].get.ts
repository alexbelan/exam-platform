import { createError } from "h3";
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

    const question = await prisma.interviewQuestion.findUnique({
      where: { id: +questionId },
      include: {
        tags: {
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
        },
        questionAnswers: {
          include: {
            answer: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
      },
    });

    if (!question) {
      throw createError({
        statusCode: 404,
        statusMessage: "Вопрос не найден",
      });
    }

    return {
      success: true,
      question,
    };
  } catch (error) {
    console.error("Error fetching question:", error);

    if (error instanceof Error && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении вопроса",
    });
  }
});
